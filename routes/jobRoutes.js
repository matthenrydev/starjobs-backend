const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/authMiddleware");
const applicationUpload = require("../middleware/applicationUploadMiddleware");
const {
  getJobs,
  applyInJob,
  getJobById,
  likeJob,
  dislikeJob,
  saveJob,
  getSavedJobs
} = require("../controllers/jobController");

// Route to get all jobs
router.get("/", getJobs);

// Get saved jobs for a jobseeker
router.get("/saved-jobs", authenticate, getSavedJobs);

// Apply to a job
router.post("/apply", authenticate, applicationUpload, applyInJob);

// Like route
router.post("/:id/like", authenticate, likeJob);

//Dislike route
router.post("/:id/dislike", authenticate, dislikeJob);

// Save a job route
router.patch("/:id/save", authenticate, saveJob);

// Route to get a job by ID (must come last!)
router.get("/:id", getJobById);

module.exports = router;
