const express = require("express");
const router = express.Router();
const news = require("../controllers/newsController");
const { requireAdmin } = require("../middleware/auth");
const { uploadNewsImage } = require("../middleware/upload");

router.get("/", news.listNews);
router.get("/:id", news.getNewsItem);

router.post("/", requireAdmin, uploadNewsImage.single("image"), news.createNews);
router.put("/:id", requireAdmin, uploadNewsImage.single("image"), news.updateNews);
router.delete("/:id", requireAdmin, news.deleteNews);

module.exports = router;
