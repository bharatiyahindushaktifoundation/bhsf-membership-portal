const prisma = require("../config/db");
const { streamMembersListExcel } = require("../utils/excelGenerator");
const { streamMembersListPdf } = require("../utils/pdfGenerator");

async function getFilteredMembers(query) {
  const { assemblyId, mandalId, panchayatId, status } = query;
  const where = {};
  if (assemblyId) where.assemblyId = assemblyId;
  if (mandalId) where.mandalId = mandalId;
  if (panchayatId) where.panchayatId = panchayatId;
  if (status) where.status = status;

  return prisma.member.findMany({
    where,
    include: { assembly: true, mandal: true, panchayat: true },
    orderBy: { createdAt: "desc" },
  });
}

async function exportMembersExcel(req, res, next) {
  try {
    const members = await getFilteredMembers(req.query);
    await streamMembersListExcel(res, members);
  } catch (err) {
    next(err);
  }
}

async function exportMembersPdf(req, res, next) {
  try {
    const members = await getFilteredMembers(req.query);
    streamMembersListPdf(res, members);
  } catch (err) {
    next(err);
  }
}

module.exports = { exportMembersExcel, exportMembersPdf };
