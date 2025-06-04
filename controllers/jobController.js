const Job = require("../models/Job");
const User = require("../models/User");

// Get All Jobs
const getJobs = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const jobs = await Job.find()
      .populate("employer", "name")
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    // Add like/dislike counts
    const jobsWithCounts = jobs.map(job => ({
      ...job,
      likeCount: job.likes?.length || 0,
      dislikeCount: job.dislikes?.length || 0
    }));

    res.json(jobsWithCounts);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// Get job by ID
const getJobById = async (req, res) => {
  const { id } = req.params;

  try {
    const job = await Job.findById(id)
      .populate("employer", "name email")
      .lean();

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    job.likeCount = job.likes?.length || 0;
    job.dislikeCount = job.dislikes?.length || 0;

    res.json(job);
  } catch (error) {
    console.error("Error fetching job by ID:", error);
    res.status(500).json({ message: "Server error" });
  }
};




// Apply in Job
const applyInJob = async (req, res) => {
  const { jobId } = req.body;
  const jobseekerId = req.user.id;

  try {
    const user = await User.findById(jobseekerId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "jobseeker") {
      return res
        .status(403)
        .json({ message: "Only jobseekers can apply in jobs" });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.jobseekers.includes(jobseekerId)) {
      return res
        .status(400)
        .json({ message: "Jobseeker is already applyed in this job" });
    }

    // Apply the jobseeker in a single operation
    await Job.findByIdAndUpdate(jobId, {
      $push: { jobseekers: jobseekerId },
    });

    res.json({ message: "Applied in job successfully" });
  } catch (error) {
    console.error("Error applying in job:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Like a job
const likeJob = async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user || user.role !== "jobseeker") {
      return res.status(403).json({ message: "Only jobseekers can like a job." });
    }

    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Remove from dislikes if present
    job.dislikes = job.dislikes.filter(uid => uid.toString() !== userId.toString());

    // Toggle like
    if (job.likes.includes(userId)) {
      job.likes = job.likes.filter(uid => uid.toString() !== userId.toString());
    } else {
      job.likes.push(userId);
    }

    await job.save();
    res.json({ message: "Like updated", likes: job.likes.length });
  } catch (error) {
    console.error("Error liking job:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Dislike a job
const dislikeJob = async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user || user.role !== "jobseeker") {
      return res.status(403).json({ message: "Only jobseekers can dislike a job." });
    }

    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Remove from likes if present
    job.likes = job.likes.filter(uid => uid.toString() !== userId.toString());

    // Toggle dislike
    if (job.dislikes.includes(userId)) {
      job.dislikes = job.dislikes.filter(uid => uid.toString() !== userId.toString());
    } else {
      job.dislikes.push(userId);
    }

    await job.save();
    res.json({ message: "Dislike updated", dislikes: job.dislikes.length });
  } catch (error) {
    console.error("Error disliking job:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getJobs,
  getJobById,
  applyInJob,
  likeJob,
  dislikeJob
};
