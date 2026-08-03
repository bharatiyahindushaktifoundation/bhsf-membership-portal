const express = require("express");
const router = express.Router();
const homeContent = require("../controllers/homeContentController");
const { requireAdmin, requireSuperAdmin } = require("../middleware/auth");
const { uploadGalleryImage } = require("../middleware/upload");

router.get("/", homeContent.getAllContent);
router.put("/:section", requireAdmin, requireSuperAdmin, uploadGalleryImage.single("image"), homeContent.updateSection);

module.exports = router;
