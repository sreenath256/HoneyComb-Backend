const express = require("express");
const upload = require("../middleware/upload");
const { getProjects, getProject, deleteProject, updateProject, addProject } = require("../controllers/admin/projectController");

const router = express.Router();




// Projects controller functions mounting them to corresponding route
router.get("/projects", getProjects);
router.get("/project/:id", getProject);
router.delete("/project/:id", deleteProject);
router.patch("/project/:id", upload.any(), updateProject);
router.post("/project", upload.any(), addProject);



module.exports = router;
