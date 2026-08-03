const express = require("express");
const router = express.Router();
const auth = require("../controllers/authController");
const { requireAdmin } = require("../middleware/auth");

// Public: applicant phone OTP
router.post("/application/send-otp", auth.sendApplicationOtp);
router.post("/application/verify-otp", auth.verifyApplicationOtp);

// Admin OTP login
router.post("/admin/send-otp", auth.sendAdminOtp);
router.post("/admin/verify-otp", auth.verifyAdminOtp);
router.get("/admin/me", requireAdmin, auth.getCurrentAdmin);

module.exports = router;
