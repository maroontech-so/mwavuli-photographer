const express = require("express");
const router = express.Router();
const projectController = require("../controller/projectController");
const auth = require("../middleware/auth");

router.get("/", projectController.getProjects);
router.get("/:id", projectController.getProject);

router.post("/", auth, projectController.createProject);
router.put("/:id", auth, projectController.updateProject);
router.delete("/:id", auth, projectController.deleteProject);

module.exports = router;