const { verifyToken } = require("../utils/jwt");
const prisma = require("../config/db");

/**
 * Verifies the JWT and re-checks the admin's current status/role directly
 * from the database on every request, so a deactivation or role change
 * takes effect immediately instead of waiting for the token to expire.
 * Allows both ADMIN and SUPER_ADMIN roles through.
 */
async function requireAdmin(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const payload = verifyToken(token);
    if (payload.role !== "ADMIN" && payload.role !== "SUPER_ADMIN") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const admin = await prisma.admin.findUnique({ where: { id: payload.id } });
    if (!admin || !admin.isActive) {
      return res.status(401).json({ message: "Your admin access has been deactivated" });
    }

    req.admin = { id: admin.id, name: admin.name, phone: admin.phone, role: admin.role };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

/**
 * Must run after requireAdmin. Restricts a route to SUPER_ADMIN only.
 * Organization designations (Chairman, Editor, etc.) are unrelated to this
 * check - this is purely the system-level dashboard permission.
 */
function requireSuperAdmin(req, res, next) {
  if (!req.admin || req.admin.role !== "SUPER_ADMIN") {
    return res.status(403).json({ message: "Super Admin access required" });
  }
  next();
}

module.exports = { requireAdmin, requireSuperAdmin };
