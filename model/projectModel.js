const mongoose = require("mongoose");
const { Schema } = mongoose;

const projectsSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      // Will be generated from name: "modern-villa-complex"
    },
    area: {
      type: String,
      trim: true
    },
    location: {
      type: String,
      trim: true
    },
    architects: {
      type: String,
      trim: true
    },
    categories: [{
      type: String,
    }],
    yearOfCompletion: {
      type: Number,
      // min: 1900,
      max: new Date().getFullYear() + 10
    },
    designTeam: {
      type: String,
      trim: true
    },
    imageURL: {
      type: String,
    },
    verticalImages: [{
      type: String,
    }],
    horizontalImages: [{
      type: String,
    }],
    isActive: {
      type: Boolean,
      default: true
    },
    description: {
      type: String,
      trim: true
    },
    moreDetails: {
      type: String,
    },
    client: {
      type: String,
    },
    plotArea: {
      type: String,
    },
    photographer: {
      type: String
    }

  },
  { timestamps: true }
);

// Pre-save middleware to generate slug
projectsSchema.pre('save', function (next) {
  if (this.isModified('name') || this.isNew) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-')     // Replace spaces with hyphens
      .replace(/-+/g, '-')      // Replace multiple hyphens with single
      .trim();
  }
  next();
});

// Add indexes for better performance
projectsSchema.index({ slug: 1 });
projectsSchema.index({ category: 1, isActive: 1 });
projectsSchema.index({ isActive: 1, createdAt: -1 });

const Projects = mongoose.model("Projects", projectsSchema);

module.exports = Projects;
