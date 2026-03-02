const Project = require("../../model/projectModel");
const mongoose = require("mongoose");

// ✅ controllers/projectController.js
const getProjects = async (req, res) => {
    try {
        const {
            search,
            category,
        } = req.query;

        const filter = {
            isActive: true, // ✅ only active projects
        };


        if (search) {
            filter.name = { $regex: new RegExp(search, "i") };
        }

        // ✅ Filter by category (case-insensitive)
        if (category && category !== 'all') {
            filter.categories = { $in: [new RegExp(category, "i")] };
        }


        const projects = await Project.find(filter, {
            verticalImages: 0,
            horizontalImages: 0,
        }).sort({ createdAt: -1 })  // 👈 Sort by latest first




        res.status(200).json({ projects });
    } catch (error) {
        console.log("Error", error)
        res.status(400).json({ error: error.message });
    }
};


// Get single Project
const getProject = async (req, res) => {
    try {
        const { id } = req.params;


        // if (!mongoose.Types.ObjectId.isValid(id)) {
        //   throw Error("Invalid ID!!!");
        // }

        const project = await Project.findOne({ slug: id });

        if (!project) {
            throw Error("No Such Project");
        }

        res.status(200).json({ project });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};



module.exports = {
    getProjects,
    getProject,

};
