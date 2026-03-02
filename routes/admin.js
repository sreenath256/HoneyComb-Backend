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

const {
    getProductDesigns,
    addProductDesign,
    reorderProductDesigns,
    deleteProductDesign,
} = require("../controllers/admin/productDesignController");


// Product Designs routes
router.get("/productDesigns", getProductDesigns);
router.post("/productDesign", upload.any(), addProductDesign);
router.patch("/productDesigns/reorder", reorderProductDesigns);
router.delete("/productDesign/:id", deleteProductDesign);



module.exports = router;
