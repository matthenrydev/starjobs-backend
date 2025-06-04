const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/authMiddleware");
const {
  getJobseekerProfile,
  getAppliedJobs
} = require("../controllers/jobseekerController");

// Get jobseeker profile
router.get("/profile", authenticate, getJobseekerProfile);

// Get applied jobs
router.get("/applied-jobs", authenticate, getAppliedJobs);


module.exports = router;
