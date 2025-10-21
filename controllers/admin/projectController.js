const Project = require("../../model/projectModel");
const mongoose = require("mongoose");

// Getting all projects to list on admin dashboard
const getProjects = async (req, res) => {
  try {
    const {
      status,
      search,
      page = 1,
      limit = 10,
      startingDate,
      endingDate,
    } = req.query;

    let filter = {};

    if (status !== undefined) {
      filter.isActive = status === 'true' || status === true;
    }
    if (search) {
      filter.name = { $regex: new RegExp(search, "i") };
    }
    const skip = (page - 1) * limit;

    // Date
    if (startingDate) {
      const date = new Date(startingDate);
      filter.createdAt = { $gte: date };
    }
    if (endingDate) {
      const date = new Date(endingDate);
      filter.createdAt = { ...filter.createdAt, $lte: date };
    }

    const projects = await Project.find(filter, {
      verticalImages: 0,
      horizontalImages: 0,
    })
      .skip(skip)
      .limit(limit);

    const totalAvailableProjects = await Project.countDocuments(filter);

    res.status(200).json({ projects, totalAvailableProjects });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get single Project
const getProject = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw Error("Invalid ID!!!");
    }

    const project = await Project.findOne({ _id: id });

    if (!project) {
      throw Error("No Such Project");
    }

    res.status(200).json({ project });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const addProject = async (req, res) => {
  try {
    let formData = { ...req.body, isActive: true };
    const files = req?.files || [];

    console.log("Received files:", files);
    console.log("Form Data before processing:", formData);

    // ✅ Generate slug from project name
    if (formData.name && typeof formData.name === "string") {
      const trimmedName = formData.name.trim();
      formData.name = trimmedName;

      let baseSlug = trimmedName
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();

      let slug = baseSlug;
      let slugExists = await Project.findOne({ slug });

      if (slugExists) {
        let i = 1;
        while (await Project.findOne({ slug: `${baseSlug}-${i}` })) {
          i++;
        }
        slug = `${baseSlug}-${i}`;
      }

      formData.slug = slug;
    }

    // ✅ Parse categories safely
    if (formData.categories && typeof formData.categories === "string") {
      try {
        const parsed = JSON.parse(formData.categories);
        formData.categories = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        formData.categories = [formData.categories];
      }
    }

    // ✅ Initialize arrays before looping
    formData.verticalImages = [];
    formData.horizontalImages = [];
    formData.imageURL = "";

    // ✅ Assign images correctly
    files.forEach((file) => {
      switch (file.fieldname) {
        case "imageURL":
          formData.imageURL = file.filename;
          break;
        case "verticalImages":
          formData.verticalImages.push(file.filename);
          break;
        case "horizontalImages":
          formData.horizontalImages.push(file.filename);
          break;
        default:
          console.warn(`⚠️ Unknown field: ${file.fieldname}`);
      }
    });

    console.log("✅ Final FormData before save:", formData);

    const project = await Project.create(formData);

    res.status(200).json({
      success: true,
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    console.error("❌ Error adding project:", error);
    res.status(400).json({ success: false, error: error.message });
  }
};



// Update a Project
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const formData = req.body;
    console.log("Updation: ", formData);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw Error("Invalid ID!!!");
    }

    const files = req?.files;

    if (files && files.length > 0) {
      formData.verticalImages = [];
      formData.horizontalImages = [];
      formData.imageURL = "";

      files.map((file) => {
        if (file.fieldname === "imageURL") {
          formData.imageURL = file.filename;
        } else if (file.fieldname === "verticalImages") {
          formData.verticalImages.push(file.filename);
        } else if (file.fieldname === "horizontalImages") {
          formData.horizontalImages.push(file.filename);
        }
      });

      if (formData.imageURL === "") {
        delete formData.imageURL;
      }

      if (formData.verticalImages.length === 0 || formData.verticalImages === "") {
        delete formData.verticalImages;
      }

      if (formData.horizontalImages.length === 0 || formData.horizontalImages === "") {
        delete formData.horizontalImages;
      }
    }

    if (formData.verticalImages === "") {
      formData.verticalImages = [];
    }

    if (formData.horizontalImages === "") {
      formData.horizontalImages = [];
    }

    // Parse category if it's a JSON string
    if (formData.category && typeof formData.category === 'string') {
      try {
        formData.category = JSON.parse(formData.category);
      } catch (error) {
        // If parsing fails, treat as single string
        formData.category = [formData.category];
      }
    }

    const project = await Project.findOneAndUpdate(
      { _id: id },
      { $set: { ...formData } },
      { new: true }
    );

    if (!project) {
      throw Error("No Such Project");
    }

    res.status(200).json({ project });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Deleting a Project
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw Error("Invalid ID!!!");
    }

    const project = await Project.findOneAndDelete({ _id: id });

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
  addProject,
  deleteProject,
  updateProject,
};
