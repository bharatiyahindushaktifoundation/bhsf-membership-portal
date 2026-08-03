const QRCode = require("qrcode");

/**
 * Generates a QR code (as a base64 data URL) encoding the given member ID.
 */
async function generateMemberQrDataUrl(memberId) {
  return QRCode.toDataURL(memberId, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 300,
  });
}

module.exports = { generateMemberQrDataUrl };
