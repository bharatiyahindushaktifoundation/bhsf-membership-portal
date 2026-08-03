const express = require("express");
const router = express.Router();
const dashboard = require("../controllers/dashboardController");
const { requireAdmin } = require("../middleware/auth");

router.get("/summary", requireAdmin, dashboard.getSummary);

module.exports = router;
