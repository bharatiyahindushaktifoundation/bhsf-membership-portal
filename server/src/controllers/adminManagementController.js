const prisma = require("../config/db");

function serializeAdmin(admin) {
  return {
    id: admin.id,
    name: admin.name,
    phone: admin.phone,
    role: admin.role,
    isActive: admin.isActive,
    createdAt: admin.createdAt,
    designations: admin.member?.designation?.map((d) => d.department.title) || [],
  };
}

async function countActiveSuperAdmins(excludeId) {
  return prisma.admin.count({
    where: {
      role: "SUPER_ADMIN",
      isActive: true,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
  });
}

async function listAdmins(req, res, next) {
  try {
    const { search } = req.query;
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { phone: { contains: search } },
          ],
        }
      : {};

    const admins = await prisma.admin.findMany({
      where,
      include: { member: { include: { designation: { include: { department: true } } } } },
      orderBy: { createdAt: "asc" },
    });

    res.json(admins.map(serializeAdmin));
  } catch (err) {
    next(err);
  }
}

// Shared implementation for activate/deactivate
async function setActive(req, res, next, isActive) {
  try {
    const target = await prisma.admin.findUnique({ where: { id: req.params.id } });
    if (!target) return res.status(404).json({ message: "Admin not found" });

    if (target.id === req.admin.id) {
      return res.status(400).json({ message: "You cannot change your own account from here" });
    }

    if (!isActive && target.role === "SUPER_ADMIN") {
      const remaining = await countActiveSuperAdmins(target.id);
      if (remaining === 0) {
        return res.status(400).json({ message: "At least one active Super Admin must remain" });
      }
    }

    const admin = await prisma.admin.update({ where: { id: target.id }, data: { isActive } });
    res.json({ message: isActive ? "Admin activated" : "Admin deactivated", admin: serializeAdmin(admin) });
  } catch (err) {
    next(err);
  }
}

const activateAdmin = (req, res, next) => setActive(req, res, next, true);
const deactivateAdmin = (req, res, next) => setActive(req, res, next, false);

async function promoteToSuperAdmin(req, res, next) {
  try {
    const target = await prisma.admin.findUnique({ where: { id: req.params.id } });
    if (!target) return res.status(404).json({ message: "Admin not found" });
    if (target.role === "SUPER_ADMIN") {
      return res.status(400).json({ message: "Admin is already a Super Admin" });
    }

    const admin = await prisma.admin.update({ where: { id: target.id }, data: { role: "SUPER_ADMIN" } });
    res.json({ message: "Promoted to Super Admin", admin: serializeAdmin(admin) });
  } catch (err) {
    next(err);
  }
}

async function demoteToAdmin(req, res, next) {
  try {
    const target = await prisma.admin.findUnique({ where: { id: req.params.id } });
    if (!target) return res.status(404).json({ message: "Admin not found" });

    if (target.id === req.admin.id) {
      return res.status(400).json({ message: "You cannot demote yourself" });
    }
    if (target.role !== "SUPER_ADMIN") {
      return res.status(400).json({ message: "Admin is not a Super Admin" });
    }

    const remaining = await countActiveSuperAdmins(target.id);
    if (remaining === 0) {
      return res.status(400).json({ message: "At least one active Super Admin must remain" });
    }

    const admin = await prisma.admin.update({ where: { id: target.id }, data: { role: "ADMIN" } });
    res.json({ message: "Demoted to Admin", admin: serializeAdmin(admin) });
  } catch (err) {
    next(err);
  }
}

async function removeAdmin(req, res, next) {
  try {
    const target = await prisma.admin.findUnique({ where: { id: req.params.id } });
    if (!target) return res.status(404).json({ message: "Admin not found" });

    if (target.id === req.admin.id) {
      return res.status(400).json({ message: "You cannot remove your own account" });
    }

    if (target.role === "SUPER_ADMIN") {
      const remaining = await countActiveSuperAdmins(target.id);
      if (remaining === 0) {
        return res.status(400).json({ message: "At least one active Super Admin must remain" });
      }
    }

    // Only the Admin (dashboard access) record is removed here - the
    // underlying Member and their designations, if any, are untouched.
    await prisma.admin.delete({ where: { id: target.id } });
    res.json({ message: "Admin removed" });
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ message: "Admin not found" });
    next(err);
  }
}

module.exports = {
  listAdmins,
  activateAdmin,
  deactivateAdmin,
  promoteToSuperAdmin,
  demoteToAdmin,
  removeAdmin,
};
