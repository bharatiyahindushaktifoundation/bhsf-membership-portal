const express = require("express");
const router = express.Router();
const gallery = require("../controllers/galleryController");
const { requireAdmin } = require("../middleware/auth");
const { uploadGalleryImage, uploadGalleryVideo } = require("../middleware/upload");

// Photos
router.get("/photos", gallery.listPhotos);
router.post("/photos", requireAdmin, uploadGalleryImage.array("photos", 20), gallery.uploadPhotos);
router.delete("/photos/:id", requireAdmin, gallery.deletePhoto);

// Videos
router.get("/videos", gallery.listVideos);
router.post("/videos", requireAdmin, uploadGalleryVideo.single("video"), gallery.addVideo);
router.delete("/videos/:id", requireAdmin, gallery.deleteVideo);

module.exports = router;
