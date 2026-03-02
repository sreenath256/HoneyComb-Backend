const express = require("express");
const { getProjects, getProject } = require("../controllers/Common/projectController");
const { getProductDesigns } = require("../controllers/Common/productDesignsController");


const router = express.Router();

// Logout
router.get("/projects", getProjects);
router.get("/project/:id", getProject);
router.get("/productDesigns", getProductDesigns);

// Public Routes can be added here

module.exports = router;
