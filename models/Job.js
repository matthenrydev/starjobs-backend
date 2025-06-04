const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    jobtype: {
      type: String,
      required: true,
      enum: ["Full-time", "Part-time", "Contract", "Hourly"],
    },
    salary: { type: String, required: true, trim: true },
    experience: { type: String, trim: true },

    jobcategory: { type: String, required: true, trim: true },
    level: {
      type: String,
      required: true,
      enum: ["Internship", "Fresher", "Mid Level", "Senior"],
    },
    deadline: { type: Date, required: true },
    openings: { type: Number, required: true, min: 1 },

    istrending: { type: Boolean, default: false },
    status: {
      type: String,
      default: "Active",
      enum: ["Active", "Inactive", "Closed"],
    },

    description: { type: String, required: true }, // rich text assumed as HTML/Markdown

    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    jobseekers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Job", jobSchema);
