const prisma = require("../config/db");

/**
 * Generates a sequential, human-readable member ID in the form:
 *   BHSF-<STATE_CODE>-000123
 * Falls back to a generic prefix if state code cannot be resolved.
 */
async function generateMemberId(stateName = "") {
  const stateCode = (stateName || "GEN").substring(0, 2).toUpperCase();

  const count = await prisma.member.count();
  const sequence = String(count + 1).padStart(6, "0");

  const candidate = `BHSF-${stateCode}-${sequence}`;

  // Extremely unlikely collision guard (e.g. concurrent approvals)
  const exists = await prisma.member.findUnique({ where: { memberId: candidate } });
  if (exists) {
    return `BHSF-${stateCode}-${String(count + 1 + Math.floor(Math.random() * 100)).padStart(6, "0")}`;
  }
  return candidate;
}

module.exports = { generateMemberId };
