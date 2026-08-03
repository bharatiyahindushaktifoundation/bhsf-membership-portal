const express = require("express");
const router = express.Router();
const location = require("../controllers/locationController");
const { requireAdmin, requireSuperAdmin } = require("../middleware/auth");

// :level = state | district | assembly | mandal | panchayat
// GET is public (needed for the public application form dropdowns)
router.get("/:level", location.list);

// Mutations: managing locations is a Super Admin only capability
router.post("/:level", requireAdmin, requireSuperAdmin, location.create);
router.put("/:level/:id", requireAdmin, requireSuperAdmin, location.update);
router.delete("/:level/:id", requireAdmin, requireSuperAdmin, location.remove);

module.exports = router;
