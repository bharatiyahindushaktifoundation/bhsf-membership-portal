const prisma = require("../config/db");

const OTP_EXPIRY_MINUTES = Number(process.env.OTP_EXPIRY_MINUTES || 5);
const OTP_MODE = process.env.OTP_MODE || "mock";

function generateSixDigitOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/**
 * Creates and "sends" an OTP for a given phone number and purpose.
 * purpose: "APPLICATION" | "ADMIN_LOGIN"
 *
 * When OTP_MODE=mock (default, used when no real SMS provider is configured),
 * the OTP is logged to the server console instead of sent via SMS so the
 * flow can be tested end-to-end without external credentials.
 */
async function requestOtp(phone, purpose) {
  const otp = generateSixDigitOtp();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await prisma.otpRequest.create({
    data: { phone, otp, purpose, expiresAt },
  });

  if (OTP_MODE === "mock") {
    // eslint-disable-next-line no-console
    console.log(`[MOCK SMS] OTP for ${phone} (${purpose}): ${otp}`);
  } else {
    // Plug a real SMS gateway (e.g. MSG91, Twilio) here using
    // process.env.SMS_API_KEY / SMS_SENDER_ID.
    // await smsProvider.send(phone, `Your BHSF OTP is ${otp}`);
  }

  return { expiresAt };
}

/**
 * Verifies a submitted OTP for a phone + purpose. Marks it used on success.
 */
async function verifyOtp(phone, otp, purpose) {
  const record = await prisma.otpRequest.findFirst({
    where: { phone, purpose, isUsed: false },
    orderBy: { createdAt: "desc" },
  });

  if (!record) return { valid: false, reason: "No OTP requested for this number" };
  if (record.expiresAt < new Date()) return { valid: false, reason: "OTP expired" };
  if (record.otp !== otp) return { valid: false, reason: "Incorrect OTP" };

  await prisma.otpRequest.update({
    where: { id: record.id },
    data: { isUsed: true },
  });

  return { valid: true };
}

module.exports = { requestOtp, verifyOtp };
