const express = require("express");
const router = express.Router();
const exportController = require("../controllers/exportController");
const { requireAdmin } = require("../middleware/auth");

router.get("/members/excel", requireAdmin, exportController.exportMembersExcel);
router.get("/members/pdf", requireAdmin, exportController.exportMembersPdf);

module.exports = router;
