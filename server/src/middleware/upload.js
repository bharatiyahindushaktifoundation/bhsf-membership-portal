const multer = require("multer");
const path = require("path");
const fs = require("fs");

const MAX_FILE_SIZE_MB = Number(process.env.MAX_FILE_SIZE_MB || 5);

const UPLOAD_ROOT = path.join(__dirname, "..", "uploads");

function ensureDir(dir) {
  const fullPath = path.join(UPLOAD_ROOT, dir);
  if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
  return fullPath;
}

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ID_PROOF_TYPES = [...IMAGE_TYPES, "application/pdf"];

function makeStorage(subfolder) {
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, ensureDir(subfolder)),
    filename: (req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${unique}${path.extname(file.originalname)}`);
    },
  });
}

function fileFilterFactory(allowedTypes) {
  return (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed: ${allowedTypes.join(", ")}`));
    }
  };
}

const uploadPhoto = multer({
  storage: makeStorage("photos"),
  fileFilter: fileFilterFactory(IMAGE_TYPES),
  limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 },
});

const uploadIdProof = multer({
  storage: makeStorage("idproofs"),
  fileFilter: fileFilterFactory(ID_PROOF_TYPES),
  limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 },
});

const uploadGalleryImage = multer({
  storage: makeStorage("gallery"),
  fileFilter: fileFilterFactory(IMAGE_TYPES),
  limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 },
});

const uploadActivityImage = multer({
  storage: makeStorage("activities"),
  fileFilter: fileFilterFactory(IMAGE_TYPES),
  limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 },
});

const uploadNewsImage = multer({
  storage: makeStorage("news"),
  fileFilter: fileFilterFactory(IMAGE_TYPES),
  limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 },
});

const uploadGalleryVideo = multer({
  storage: makeStorage("gallery"),
  fileFilter: fileFilterFactory(["video/mp4", "video/webm"]),
  limits: { fileSize: MAX_FILE_SIZE_MB * 20 * 1024 * 1024 },
});

module.exports = {
  uploadPhoto,
  uploadIdProof,
  uploadGalleryImage,
  uploadActivityImage,
  uploadNewsImage,
  uploadGalleryVideo,
  UPLOAD_ROOT,
};
