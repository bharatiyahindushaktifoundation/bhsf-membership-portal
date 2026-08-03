const ExcelJS = require("exceljs");

/**
 * Streams an Excel workbook of members to the HTTP response.
 */
async function streamMembersListExcel(res, members) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Bharatiya Hindu Shakti Foundation";
  const sheet = workbook.addWorksheet("Members");

  sheet.columns = [
    { header: "Member ID", key: "memberId", width: 18 },
    { header: "Full Name", key: "fullName", width: 25 },
    { header: "Father's Name", key: "fatherName", width: 25 },
    { header: "Gender", key: "gender", width: 10 },
    { header: "Phone", key: "phone", width: 15 },
    { header: "Email", key: "email", width: 25 },
    { header: "Assembly", key: "assembly", width: 20 },
    { header: "Mandal", key: "mandal", width: 20 },
    { header: "Village Panchayat", key: "panchayat", width: 20 },
    { header: "Status", key: "status", width: 12 },
    { header: "Joined On", key: "createdAt", width: 15 },
  ];

  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFF9933" } };
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
  });

  members.forEach((m) => {
    sheet.addRow({
      memberId: m.memberId,
      fullName: m.fullName,
      fatherName: m.fatherName,
      gender: m.gender,
      phone: m.phone,
      email: m.email || "-",
      assembly: m.assembly?.name || "-",
      mandal: m.mandal?.name || "-",
      panchayat: m.panchayat?.name || "-",
      status: m.status,
      createdAt: new Date(m.createdAt).toLocaleDateString("en-IN"),
    });
  });

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", 'attachment; filename="members-list.xlsx"');

  await workbook.xlsx.write(res);
  res.end();
}

module.exports = { streamMembersListExcel };
