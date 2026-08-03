const express = require("express");
const router = express.Router();
const activity = require("../controllers/activityController");
const { requireAdmin } = require("../middleware/auth");
const { uploadActivityImage } = require("../middleware/upload");

// Public read access
router.get("/", activity.listActivities);
router.get("/:id", activity.getActivity);

// Admin CRUD
router.post("/", requireAdmin, uploadActivityImage.array("images", 10), activity.createActivity);
router.put("/:id", requireAdmin, uploadActivityImage.array("images", 10), activity.updateActivity);
router.delete("/:id", requireAdmin, activity.deleteActivity);
router.delete("/images/:imageId", requireAdmin, activity.deleteActivityImage);

module.exports = router;
