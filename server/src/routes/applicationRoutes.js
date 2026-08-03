const express = require("express");
const router = express.Router();
const application = require("../controllers/applicationController");
const { requireAdmin } = require("../middleware/auth");
const multer = require("multer");

// Because photo and idProof need different validation (idProof allows PDF),
// we build a dedicated multer instance here that accepts both fields and
// validates by field name.
const path = require("path");
const fs = require("fs");
const UPLOAD_ROOT = path.join(__dirname, "..", "uploads");

function ensureDir(dir) {
  const full = path.join(UPLOAD_ROOT, dir);
  if (!fs.existsSync(full)) fs.mkdirSync(full, { recursive: true });
  return full;
}

const applicationUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, ensureDir(file.fieldname === "idProof" ? "idproofs" : "photos"));
    },
    filename: (req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${unique}${path.extname(file.originalname)}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    const imageTypes = ["image/jpeg", "image/png", "image/webp"];
    const idProofTypes = [...imageTypes, "application/pdf"];
    const allowed = file.fieldname === "idProof" ? idProofTypes : imageTypes;
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error(`Invalid file type for ${file.fieldname}`));
  },
  limits: { fileSize: Number(process.env.MAX_FILE_SIZE_MB || 5) * 1024 * 1024 },
});

// Public
router.post(
  "/",
  applicationUpload.fields([{ name: "photo", maxCount: 1 }, { name: "idProof", maxCount: 1 }]),
  application.submitApplication
);
router.get("/status/:id", application.getApplicationStatus);

// Admin
router.get("/", requireAdmin, application.listApplications);
router.get("/:id", requireAdmin, application.getApplication);
router.post("/:id/approve", requireAdmin, application.approveApplication);
router.post("/:id/reject", requireAdmin, application.rejectApplication);

module.exports = router;
