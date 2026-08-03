const express = require("express");
const router = express.Router();
const department = require("../controllers/departmentController");
const { requireAdmin, requireSuperAdmin } = require("../middleware/auth");

router.get("/", department.listDepartments);

// Defining designations and assigning/removing them from members is a
// Super Admin only capability - it directly grants/revokes dashboard access.
router.post("/", requireAdmin, requireSuperAdmin, department.createDepartment);
router.put("/:id", requireAdmin, requireSuperAdmin, department.updateDepartment);
router.delete("/:id", requireAdmin, requireSuperAdmin, department.deleteDepartment);

router.post("/assign", requireAdmin, requireSuperAdmin, department.assignDesignation);
router.delete("/assign/:assignmentId", requireAdmin, requireSuperAdmin, department.removeDesignation);

module.exports = router;
