// controllers/employerController.js
const Job = require("../models/Job");
const User = require("../models/User");

// Get Employer Profile
const getEmployerProfile = async (req, res) => {
  try {
    // Fetch the user by ID and ensure they are an employer
    const employer = await User.findById(req.user.id).select("-password");
    if (!employer || employer.role !== "employer") {
      return res.status(404).json({ message: "Employer not found" });
    }

    // Return the employer profile data
    res.json(employer);
  } catch (error) {
    console.error("Error fetching employer profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create Job
const createJob = async (req, res) => {
  const {
    title,
    location,
    jobtype,
    salary,
    experience,
    jobcategory,
    level,
    deadline,
    openings,
    istrending,
    status,
    description,
  } = req.body;

  const employerId = req.user.id;

  try {
    const employer = await User.findById(employerId);

    if (!employer || employer.role !== "employer" || !employer.isVerified) {
      return res
        .status(403)
        .json({ message: "User is not authorized to create jobs" });
    }

    const job = new Job({
      title,
      location,
      jobtype,
      salary,
      experience,
      jobcategory,
      level,
      deadline,
      openings,
      istrending: istrending || false,
      status: status || "Active",
      description,
      employer: employerId,
    });

    await job.save();
    res.status(201).json(job);
  } catch (error) {
    console.error("Error creating job:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// Edit Job
const editJob = async (req, res) => {
  const { jobId } = req.params;
  const employerId = req.user.id;

  try {
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.employer.toString() !== employerId) {
      return res
        .status(403)
        .json({ message: "Not authorized to edit this job" });
    }

    // Update only fields present in req.body
    const updatableFields = [
      "title",
      "location",
      "jobtype",
      "salary",
      "experience",
      "jobcategory",
      "level",
      "deadline",
      "openings",
      "istrending",
      "status",
      "description",
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        job[field] = req.body[field];
      }
    });

    await job.save();
    res.json(job);
  } catch (error) {
    console.error("Error editing job:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// Delete Job
const deleteJob = async (req, res) => {
  const { jobId } = req.params;
  const employerId = req.user.id;

  try {
    // Find the job by ID
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Check if the employer is authorized to delete this job
    if (job.employer.toString() !== employerId) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this job" });
    }

    // Use deleteOne method to delete the job
    await Job.deleteOne({ _id: jobId });
    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    console.error("Error deleting job:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// Get Applied Jobseekers
const getAppliedJobseekers = async (req, res) => {
  const { jobId } = req.params;
  const employerId = req.user.id;

  try {
    const job = await Job.findById(jobId).populate(
      "jobseekers",
      "name email"
    );
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.employer.toString() !== employerId) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this job's jobseekers" });
    }

    res.json(job.jobseekers);
  } catch (error) {
    console.error("Error fetching enrolled jobseekers:", error);
    res.status(500).json({ message: "Server error" });
  }
};



// Get Employer's Jobs
const getEmployerJobs = async (req, res) => {
  const employerId = req.user.id; // Get the authenticated user's ID

  try {
    // Find jobs where the employer is the logged-in user
    const jobs = await Job.find({ employer: employerId });

    if (!jobs || jobs.length === 0) {
      return res
        .status(404)
        .json({ message: "No jobs found for this employer" });
    }

    res.json(jobs);
  } catch (error) {
    console.error("Error fetching employer jobs:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getEmployerProfile,
  createJob,
  editJob,
  deleteJob,
  getAppliedJobseekers,
  getEmployerJobs,
};
