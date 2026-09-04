const prisma = require("../config/db");
const { requestOtp, verifyOtp } = require("../utils/otp");
const { verifyMSG91AccessToken } = require("../utils/msg91");
const { signAdminToken } = require("../utils/jwt");
const { isValidPhone } = require("../middleware/validate");

// ---------- Public: applicant phone verification (used on application form) ----------

async function sendApplicationOtp(req, res, next) {
  try {
    const { phone } = req.body;

    if (!isValidPhone(phone)) {
      return res.status(400).json({
        message: "A valid 10-digit phone number is required",
      });
    }

    // Invalidate any previous pending verification
    await prisma.applicationPhoneVerification.updateMany({
      where: {
        phone,
        isVerified: false,
      },
      data: {
        expiresAt: new Date(),
      },
    });

    // Create a new verification session.
    // MSG91 itself generates and sends the OTP.
    await prisma.applicationPhoneVerification.create({
      data: {
        phone,
        isVerified: false,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    res.json({
      message: "Ready to send OTP",
      phone,
    });
  } catch (err) {
    next(err);
  }
}

async function verifyApplicationOtp(req, res, next) {
  try {
    const { phone, accessToken } = req.body;

    if (!isValidPhone(phone)) {
      return res.status(400).json({
        message: "A valid 10-digit phone number is required",
      });
    }

    if (!accessToken) {
      return res.status(400).json({
        message: "MSG91 access token is required",
      });
    }

    // Find the latest pending verification session
    const verification =
      await prisma.applicationPhoneVerification.findFirst({
        where: {
          phone,
          isVerified: false,
          expiresAt: {
            gt: new Date(),
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    if (!verification) {
      return res.status(400).json({
        message:
          "OTP verification session expired or not found. Please request a new OTP.",
      });
    }

    // Verify the MSG91 access token
    const msg91Result = await verifyMSG91AccessToken(accessToken);

    if (!msg91Result.valid) {
      return res.status(400).json({
        message:
          msg91Result.message ||
          "MSG91 OTP verification failed",
      });
    }

    // Mark this verification session as verified
    await prisma.applicationPhoneVerification.update({
      where: {
        id: verification.id,
      },
      data: {
        isVerified: true,
        verifiedAt: new Date(),
      },
    });

    res.json({
      message: "Phone number verified successfully",
      verified: true,
    });
  } catch (err) {
    next(err);
  }
}

// ---------- Admin: OTP based login ----------

async function sendAdminOtp(req, res, next) {
  try {
    const { phone } = req.body;

    if (!isValidPhone(phone)) {
      return res.status(400).json({
        message: "A valid 10-digit phone number is required",
      });
    }

    const admin = await prisma.admin.findUnique({
      where: { phone },
    });

    if (!admin || !admin.isActive) {
      return res.status(404).json({
        message: "No active admin found with this phone number",
      });
    }

    // MSG91 handles the actual OTP sending.
    // This endpoint only confirms that the phone
    // belongs to an active BHSF admin.

    res.json({
      message: "Admin verified. Ready to send OTP.",
      phone,
    });
  } catch (err) {
    next(err);
  }
}

async function verifyAdminOtp(req, res, next) {
  try {
    const { phone, accessToken } = req.body;

    if (!isValidPhone(phone)) {
      return res.status(400).json({
        message: "A valid 10-digit phone number is required",
      });
    }

    if (!accessToken) {
      return res.status(400).json({
        message: "MSG91 access token is required",
      });
    }

    // Verify the OTP verification token with MSG91.
    const msg91Result = await verifyMSG91AccessToken(accessToken);

    if (!msg91Result.valid) {
      return res.status(400).json({
        message:
          msg91Result.message || "MSG91 OTP verification failed",
      });
    }

    // Make sure this phone belongs to an active BHSF admin.
    const admin = await prisma.admin.findUnique({
      where: { phone },
    });

    if (!admin || !admin.isActive) {
      return res.status(404).json({
        message: "Admin not found or inactive",
      });
    }

    // Keep your existing BHSF JWT authentication.
    const token = signAdminToken(admin);

    res.json({
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        phone: admin.phone,
        role: admin.role,
      },
    });
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
