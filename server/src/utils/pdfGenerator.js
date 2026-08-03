const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");

const BRAND_COLOR = "#FF9933";
const DARK_GRAY = "#333333";

/**
 * Streams a single member's ID card as a PDF directly to the HTTP response.
 */
function streamIdCardPdf(res, { member, qrDataUrl, logoPath }) {
  const doc = new PDFDocument({ size: [340, 540], margin: 0 });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${member.memberId}-id-card.pdf"`
  );
  doc.pipe(res);

  // Header band
  doc.rect(0, 0, 340, 90).fill(BRAND_COLOR);
  doc.fillColor("#ffffff").fontSize(16).font("Helvetica-Bold");
  doc.text("BHARATIYA HINDU SHAKTI FOUNDATION", 15, 25, { width: 310, align: "center" });
  doc.fontSize(9).font("Helvetica").text("Membership Identity Card", 15, 60, {
    width: 310,
    align: "center",
  });

  if (logoPath && fs.existsSync(logoPath)) {
    doc.image(logoPath, 12, 10, { width: 40, height: 40 });
  }

  // ---------------- Photo ----------------

const photoX = 120;
const photoY = 105;

let absolutePhotoPath = null;

if (member.photoPath) {

    absolutePhotoPath = path.join(
        __dirname,
        "..",
        member.photoPath.replace(/^\/+/, "")
    );

    console.log("Photo Path:", absolutePhotoPath);

    if (fs.existsSync(absolutePhotoPath)) {

        doc.image(absolutePhotoPath, photoX, photoY, {
            fit: [100,110],
            align: "center",
            valign: "center"
        });

    } else {

        console.log("Photo NOT FOUND");

        doc.rect(photoX, photoY, 100,110).stroke();

        doc.fontSize(8)
           .fillColor(DARK_GRAY)
           .text("Photo",photoX,photoY+50,{
                width:100,
                align:"center"
           });

    }

}
else{

    doc.rect(photoX, photoY,100,110).stroke();

    doc.fontSize(8)
       .fillColor(DARK_GRAY)
       .text("Photo",photoX,photoY+50,{
            width:100,
            align:"center"
       });

}

  doc.fillColor(DARK_GRAY).font("Helvetica-Bold").fontSize(11);
  doc.text(member.fullName, 15, 225, { width: 310, align: "center" });
  doc.font("Helvetica").fontSize(9).fillColor("#555555");
  doc.text(member.designation || "Member", 15, 242, { width: 310, align: "center" });

  const details = [
    ["Member ID", member.memberId],
    ["Assembly", member.assemblyName || "-"],
    ["Mandal", member.mandalName || "-"],
    ["Phone", member.phone],
  ];

  let y = 270;
  doc.fontSize(9);
  details.forEach(([label, value]) => {
    doc.font("Helvetica-Bold").fillColor(DARK_GRAY).text(`${label}:`, 25, y, { continued: true, width: 100 });
    doc.font("Helvetica").fillColor("#555555").text(`  ${value}`, { width: 200 });
    y += 18;
  });

  // QR Code
  if (qrDataUrl) {
    const base64Data = qrDataUrl.split(",")[1];
    const qrBuffer = Buffer.from(base64Data, "base64");
    doc.image(qrBuffer, 110, y + 10, { width: 120, height: 120 });
  }

  doc.fontSize(7).fillColor("#999999").text(
    "This card is the property of Bharatiya Hindu Shakti Foundation.",
    15,
    500,
    { width: 310, align: "center" }
  );

  doc.end();
}

/**
 * Streams a tabular PDF of members to the HTTP response.
 */
function streamMembersListPdf(res, members) {
  const doc = new PDFDocument({ size: "A4", margin: 30 });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", 'attachment; filename="members-list.pdf"');
  doc.pipe(res);

  doc.fontSize(16).fillColor(BRAND_COLOR).font("Helvetica-Bold").text(
    "Bharatiya Hindu Shakti Foundation - Member List",
    { align: "center" }
  );
  doc.moveDown(1);

  const headers = ["Member ID", "Name", "Phone", "Assembly", "Mandal", "Panchayat"];
  const colWidths = [80, 100, 75, 80, 80, 90];
  let x = 30;
  let y = doc.y;

  doc.fontSize(9).font("Helvetica-Bold").fillColor("#000");
  headers.forEach((h, i) => {
    doc.text(h, x, y, { width: colWidths[i] });
    x += colWidths[i];
  });
  y += 16;
  doc.moveTo(30, y).lineTo(535, y).stroke();
  y += 6;

  doc.font("Helvetica").fontSize(8);
  members.forEach((m) => {
    if (y > 760) {
      doc.addPage();
      y = 30;
    }
    x = 30;
    const row = [
      m.memberId,
      m.fullName,
      m.phone,
      m.assembly?.name || "-",
      m.mandal?.name || "-",
      m.panchayat?.name || "-",
    ];
    row.forEach((cell, i) => {
      doc.text(String(cell), x, y, { width: colWidths[i] });
      x += colWidths[i];
    });
    y += 16;
  });

  doc.end();
}

module.exports = { streamIdCardPdf, streamMembersListPdf };
