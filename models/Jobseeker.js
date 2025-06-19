const mongoose = require("mongoose");
const User = require("./User");

const jobseekerSchema = new mongoose.Schema({
  profilePic: { type: String },
  skills: [String],
  qualifications: [
    {
      degree: String,
      institution: String,
      year: Number
    }
  ],
  experiences: [
    {
      jobPosition: String,
      institution: String,
      duration: String
    }
  ],
  resume: { type: String },

  savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Job" }]
});

const Jobseeker = User.discriminator("jobseeker", jobseekerSchema);
module.exports = Jobseeker;
