const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/reports.controller");
const { requireAuth, optionalAuth } = require("../middleware/auth");
const { upload } = require("../middleware/upload");

router.get("/mine/saved", requireAuth, ctrl.listSavedReports);
router.post("/ai/improve", requireAuth, ctrl.improveDescription);

router.get("/", optionalAuth, ctrl.listReports);
router.get("/:id", optionalAuth, ctrl.getReport);
router.post("/", requireAuth, upload.array("images", 5), ctrl.createReport);
router.put("/:id", requireAuth, upload.array("images", 5), ctrl.updateReport);
router.delete("/:id", requireAuth, ctrl.deleteReport);
router.post("/:id/save", requireAuth, ctrl.toggleSaveReport);

module.exports = router;

