const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const member = require("../controllers/memberController");
const { requireAdmin } = require("../middleware/auth");

const UPLOAD_ROOT = path.join(__dirname, "..", "uploads");
function ensureDir(dir) {
  const full = path.join(UPLOAD_ROOT, dir);
  if (!fs.existsSync(full)) fs.mkdirSync(full, { recursive: true });
  return full;
}

const memberUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, ensureDir(file.fieldname === "idProof" ? "idproofs" : "photos")),
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

const fields = memberUpload.fields([{ name: "photo", maxCount: 1 }, { name: "idProof", maxCount: 1 }]);

// All member management routes are admin-only
router.get("/", requireAdmin, member.listMembers);
router.get("/:id", requireAdmin, member.getMember);
router.post("/", requireAdmin, fields, member.createMember);
router.put("/:id", requireAdmin, fields, member.updateMember);
router.delete("/:id", requireAdmin, member.deleteMember);

// ID card (still admin-gated; member-facing self-service was not requested)
router.get("/:id/id-card", requireAdmin, member.getIdCardData);
router.get("/:id/id-card/pdf", requireAdmin, member.downloadIdCardPdf);

module.exports = router;
