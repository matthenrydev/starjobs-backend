const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/authMiddleware");
const { getJobs, applyInJob, getJobById, likeJob, dislikeJob } = require("../controllers/jobController");

// Route to get all jobs
router.get("/", getJobs);

// Route to get a job by ID
router.get("/:id", getJobById);

// Apply to a job
router.post("/apply", authenticate, applyInJob);

// Like/dislike routes
router.post("/:id/like", authenticate, likeJob);
router.post("/:id/dislike", authenticate, dislikeJob);

module.exports = router;
