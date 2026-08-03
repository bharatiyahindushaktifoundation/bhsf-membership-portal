const express = require("express");
const router = express.Router();

router.use("/auth", require("./authRoutes"));
router.use("/locations", require("./locationRoutes"));
router.use("/applications", require("./applicationRoutes"));
router.use("/members", require("./memberRoutes"));
router.use("/departments", require("./departmentRoutes"));
router.use("/activities", require("./activityRoutes"));
router.use("/news", require("./newsRoutes"));
router.use("/gallery", require("./galleryRoutes"));
router.use("/home-content", require("./homeContentRoutes"));
router.use("/dashboard", require("./dashboardRoutes"));
router.use("/export", require("./exportRoutes"));
router.use("/admin-management", require("./adminManagementRoutes"));

router.get("/health", (req, res) => res.json({ status: "ok" }));

module.exports = router;
