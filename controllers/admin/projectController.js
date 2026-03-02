const Project = require("../../model/projectModel");
const mongoose = require("mongoose");

// Getting all projects to list on admin dashboard
const getProjects = async (req, res) => {
  try {
    const {
      status,
      search,
      page = 1,
      limit = 130,
      startingDate,
      endingDate,
    } = req.query;


    const filter = {
      isActive: true,   // ✅ only active projects
    };

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

// Add a new project
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

    // ✅ Initialize image fields
    formData.verticalImages = [];
    formData.horizontalImages = [];
    formData.imageURL = "";

    // ✅ Assign Cloudflare R2 URLs instead of local filenames
    if (files && files.length > 0) {
      files.forEach((file) => {
        const fileUrl = `${process.env.R2_PUBLIC_ENDPOINT}/${encodeURIComponent(file.key)}`;

        switch (file.fieldname) {
          case "imageURL":
            formData.imageURL = fileUrl;
            break;
          case "verticalImages":
            formData.verticalImages.push(fileUrl);
            break;
          case "horizontalImages":
            formData.horizontalImages.push(fileUrl);
            break;
          default:
            console.warn(`⚠️ Unknown field: ${file.fieldname}`);
        }
      });
    }

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



// Update a project
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    let formData = req.body;

    console.log("🔹 Received update data:", req.body);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw Error("Invalid ID!!!");
    }

    const files = req?.files || [];

    // Find existing project
    const existingProject = await Project.findById(id);
    if (!existingProject) throw Error("No Such Project");

    // Prepare updated data
    const updatedData = {};

    // ✅ Parse stringified arrays safely
    const parseArray = (field) => {
      if (!formData[field]) return [];
      if (typeof formData[field] === "string") {
        try {
          return JSON.parse(formData[field]);
        } catch {
          return [formData[field]];
        }
      }
      return formData[field];
    };

    const existingVertical = parseArray("verticalImages");
    const existingHorizontal = parseArray("horizontalImages");
    const existingCover = formData.imageURL || existingProject.imageURL;

    // ✅ Handle new uploads
    const newVertical = [];
    const newHorizontal = [];
    let newCover = "";

    files.forEach((file) => {
      const fileUrl = `${process.env.R2_PUBLIC_ENDPOINT}/${encodeURIComponent(file.key)}`;

      if (file.fieldname === "imageURL") newCover = fileUrl;
      else if (file.fieldname === "verticalImages") newVertical.push(fileUrl);
      else if (file.fieldname === "horizontalImages") newHorizontal.push(fileUrl);
    });

    // ✅ Merge existing + new images
    updatedData.imageURL = newCover || existingCover || "";

    updatedData.verticalImages = [
      ...existingVertical,
      ...newVertical,
    ].filter(Boolean);

    updatedData.horizontalImages = [
      ...existingHorizontal,
      ...newHorizontal,
    ].filter(Boolean);

    // ✅ If array is empty, that means removed all
    if (updatedData.verticalImages.length === 0) updatedData.verticalImages = [];
    if (updatedData.horizontalImages.length === 0) updatedData.horizontalImages = [];
    if (!updatedData.imageURL) updatedData.imageURL = "";

    // ✅ Parse categories
    if (formData.categories) {
      try {
        updatedData.categories = JSON.parse(formData.categories);
      } catch {
        updatedData.categories = Array.isArray(formData.categories)
          ? formData.categories
          : [formData.categories];
      }
    }

    // ✅ Copy other fields
    const textFields = [
      "name",
      "slug",
      "area",
      "plotArea",
      "client",
      "photographer",
      "location",
      "architects",
      "designTeam",
      "yearOfCompletion",
      "description",
      "moreDetails",
    ];

    textFields.forEach((field) => {
      if (formData[field] !== undefined) {
        updatedData[field] = formData[field];
      }
    });

    console.log("✅ Final update data:", updatedData);

    // ✅ Save to DB
    const updatedProject = await Project.findByIdAndUpdate(
      id,
      { $set: updatedData },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      project: updatedProject,
    });
  } catch (error) {
    console.error("❌ Error updating project:", error);
    res.status(400).json({ success: false, error: error.message });
  }
};




// Soft Deleting a Project
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw Error("Invalid ID!!!");
    }

    // Instead of deleting from DB, mark as inactive
    const project = await Project.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true } // returns the updated document
    );

    if (!project) {
      throw Error("No Such Project");
    }

    res.status(200).json({
      message: "Project soft deleted successfully",
      project,
    });
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
