const User = require("../models/User");
const Job = require("../models/Job");

// Get Jobseeker Profile
const getJobseekerProfile = async (req, res) => {
  try {
    const jobseeker = await User.findById(req.user.id).select("-password");
    if (!jobseeker || jobseeker.role !== "jobseeker") {
      return res.status(404).json({ message: "Jobseeker not found" });
    }

    res.json(jobseeker);
  } catch (error) {
    console.error("Error in getJobseekerProfile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get Applied Jobs
const getAppliedJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ jobseekers: req.user.id }); // Assuming the job model has a `jobseekers` array
    res.json(jobs);
  } catch (error) {
    console.error("Error in getAppliedJobs:", error);
    res.status(500).json({ message: "Server error" });
  }
};


module.exports = { getJobseekerProfile, getAppliedJobs };
