const express = require("express");
const router = express.Router();
const adminManagement = require("../controllers/adminManagementController");
const { requireAdmin, requireSuperAdmin } = require("../middleware/auth");

// Every route here is restricted to an authenticated, active SUPER_ADMIN.
router.use(requireAdmin, requireSuperAdmin);

router.get("/", adminManagement.listAdmins);
router.patch("/:id/activate", adminManagement.activateAdmin);
router.patch("/:id/deactivate", adminManagement.deactivateAdmin);
router.patch("/:id/promote", adminManagement.promoteToSuperAdmin);
router.patch("/:id/demote", adminManagement.demoteToAdmin);
router.delete("/:id", adminManagement.removeAdmin);

module.exports = router;
