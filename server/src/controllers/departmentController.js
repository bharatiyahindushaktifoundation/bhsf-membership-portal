const prisma = require("../config/db");

async function listDepartments(req, res, next) {
  try {
    const departments = await prisma.department.findMany({
      include: { assignments: { include: { member: true } } },
      orderBy: { title: "asc" },
    });
    res.json(departments);
  } catch (err) {
    next(err);
  }
}

async function createDepartment(req, res, next) {
  try {
    const { title, description } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ message: "Title is required" });
    const department = await prisma.department.create({
      data: { title: title.trim(), description: description || null },
    });
    res.status(201).json(department);
  } catch (err) {
    if (err.code === "P2002") return res.status(409).json({ message: "Department already exists" });
    next(err);
  }
}

async function updateDepartment(req, res, next) {
  try {
    const { title, description } = req.body;
    const department = await prisma.department.update({
      where: { id: req.params.id },
      data: { title: title?.trim(), description },
    });
    res.json(department);
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ message: "Department not found" });
    next(err);
  }
}

async function deleteDepartment(req, res, next) {
  try {
    await prisma.department.delete({ where: { id: req.params.id } });
    res.json({ message: "Department deleted successfully" });
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ message: "Department not found" });
    next(err);
  }
}

// Assign a designation (department) to a member.
// A designation holder automatically gets ADMIN dashboard access.
async function assignDesignation(req, res, next) {
  try {
    const { memberId, departmentId } = req.body;
    if (!memberId || !departmentId) {
      return res.status(400).json({ message: "memberId and departmentId are required" });
    }

    const member = await prisma.member.findUnique({ where: { id: memberId } });
    if (!member) return res.status(404).json({ message: "Member not found" });

    const assignment = await prisma.$transaction(async (tx) => {
      const created = await tx.departmentAssignment.create({
        data: { memberId, departmentId },
        include: { member: true, department: true },
      });

      // Grant (or re-activate) dashboard access for this member. If an
      // Admin account already exists (e.g. this member was previously a
      // designation holder, or is a manually created Super Admin), its
      // role is left untouched - only ADMIN accounts are auto-created here.
      const existingAdmin = await tx.admin.findFirst({
        where: { OR: [{ memberId }, { phone: member.phone }] },
      });

      if (existingAdmin) {
        await tx.admin.update({
          where: { id: existingAdmin.id },
          data: { isActive: true, memberId, phone: member.phone, name: member.fullName },
        });
      } else {
        await tx.admin.create({
          data: {
            name: member.fullName,
            phone: member.phone,
            role: "ADMIN",
            isActive: true,
            memberId,
          },
        });
      }

      return created;
    });

    res.status(201).json(assignment);
  } catch (err) {
    if (err.code === "P2002") return res.status(409).json({ message: "Member already holds this designation" });
    next(err);
  }
}

// Removing a designation revokes ADMIN dashboard access only if the member
// holds no other designation, and only if their role is plain ADMIN
// (a Super Admin's access is never auto-revoked by designation changes).
// The member record itself is never touched or deleted.
async function removeDesignation(req, res, next) {
  try {
    const assignment = await prisma.departmentAssignment.findUnique({
      where: { id: req.params.assignmentId },
    });
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });

    await prisma.$transaction(async (tx) => {
      await tx.departmentAssignment.delete({ where: { id: assignment.id } });

      const remaining = await tx.departmentAssignment.count({
        where: { memberId: assignment.memberId },
      });

      if (remaining === 0) {
        const admin = await tx.admin.findFirst({ where: { memberId: assignment.memberId } });
        if (admin && admin.role === "ADMIN") {
          await tx.admin.update({ where: { id: admin.id }, data: { isActive: false } });
        }
      }
    });

    res.json({ message: "Designation removed" });
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ message: "Assignment not found" });
    next(err);
  }
}

module.exports = {
  listDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  assignDesignation,
  removeDesignation,
};
