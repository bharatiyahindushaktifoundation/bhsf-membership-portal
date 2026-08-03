const prisma = require("../config/db");

async function getSummary(req, res, next) {
  try {
    const [totalMembers, pendingApplications, approvedMembers] = await Promise.all([
      prisma.member.count(),
      prisma.membershipApplication.count({ where: { status: "PENDING" } }),
      prisma.member.count({ where: { status: "ACTIVE" } }),
    ]);

    res.json({ totalMembers, pendingApplications, approvedMembers });
  } catch (err) {
    next(err);
  }
}

module.exports = { getSummary };
