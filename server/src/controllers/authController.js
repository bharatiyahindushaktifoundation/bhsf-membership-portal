const prisma = require("../config/db");
const { requestOtp, verifyOtp } = require("../utils/otp");
const { signAdminToken } = require("../utils/jwt");
const { isValidPhone } = require("../middleware/validate");

// ---------- Public: applicant phone verification (used on application form) ----------

async function sendApplicationOtp(req, res, next) {
  try {
    const { phone } = req.body;
    if (!isValidPhone(phone)) {
      return res.status(400).json({ message: "A valid 10-digit phone number is required" });
    }
    await requestOtp(phone, "APPLICATION");
    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    next(err);
  }
}

async function verifyApplicationOtp(req, res, next) {
  try {
    const { phone, otp } = req.body;
    if (!isValidPhone(phone) || !otp) {
      return res.status(400).json({ message: "Phone and OTP are required" });
    }
    const result = await verifyOtp(phone, otp, "APPLICATION");
    if (!result.valid) {
      return res.status(400).json({ message: result.reason });
    }
    res.json({ message: "Phone number verified", verified: true });
  } catch (err) {
    next(err);
  }
}

// ---------- Admin: OTP based login ----------

async function sendAdminOtp(req, res, next) {
  try {
    const { phone } = req.body;
    if (!isValidPhone(phone)) {
      return res.status(400).json({ message: "A valid 10-digit phone number is required" });
    }

    const admin = await prisma.admin.findUnique({ where: { phone } });
    if (!admin || !admin.isActive) {
      return res.status(404).json({ message: "No active admin found with this phone number" });
    }

    await requestOtp(phone, "ADMIN_LOGIN");
    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    next(err);
  }
}

async function verifyAdminOtp(req, res, next) {
  try {
    const { phone, otp } = req.body;
    if (!isValidPhone(phone) || !otp) {
      return res.status(400).json({ message: "Phone and OTP are required" });
    }

    const result = await verifyOtp(phone, otp, "ADMIN_LOGIN");
    if (!result.valid) {
      return res.status(400).json({ message: result.reason });
    }

    const admin = await prisma.admin.findUnique({ where: { phone } });
    if (!admin || !admin.isActive) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const token = signAdminToken(admin);
    res.json({ token, admin: { id: admin.id, name: admin.name, phone: admin.phone, role: admin.role } });
  } catch (err) {
    next(err);
  }
}

async function getCurrentAdmin(req, res, next) {
  try {
    const admin = await prisma.admin.findUnique({ where: { id: req.admin.id } });
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    res.json({ id: admin.id, name: admin.name, phone: admin.phone, role: admin.role });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  sendApplicationOtp,
  verifyApplicationOtp,
  sendAdminOtp,
  verifyAdminOtp,
  getCurrentAdmin,
};
