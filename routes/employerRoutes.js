const express = require("express");
const router = express.Router();
const { authenticate, authorizeEmployer } = require("../middleware/authMiddleware");
const { getEmployerProfile,createJob, editJob, deleteJob, getAppliedJobseekers, getEmployerJobs} = require("../controllers/employerController");

// Get employer profile
router.get("/profile", authenticate, getEmployerProfile);

// Create job
router.post("/jobs", authenticate, authorizeEmployer, createJob);

// Edit job
router.put("/jobs/:jobId", authenticate, authorizeEmployer, editJob);

// Delete job
router.delete("/jobs/:jobId", authenticate, authorizeEmployer, deleteJob);

// Get applied jobseekers
router.get("/jobs/:jobId/jobseekers", authenticate, authorizeEmployer, getAppliedJobseekers);

// Get employer jobs
router.get("/my-jobs", authenticate, authorizeEmployer, getEmployerJobs);

module.exports = router;
