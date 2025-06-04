const Job = require("../models/Job");
const User = require("../models/User");


// Get Admin Profile
const getAdminProfile = async (req, res) => {
  try {
    // Fetch the user by ID and ensure they are an admin
    const admin = await User.findById(req.user.id).select("-password");
    
    // Check if the user exists and is an admin
    if (!admin || admin.role !== "admin") {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Return the admin profile data
    res.json(admin);
  } catch (error) {
    console.error("Error fetching admin profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Verify Employer
const verifyEmployer = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId);
    if (!user || user.role !== "employer" || user.isVerified) {
      return res.status(400).json({ message: "User is not eligible for verification" });
    }

    user.isVerified = true;
    await user.save();

    res.json({ message: "Employer verified successfully" });
  } catch (error) {
    console.error("Error verifying employer:", error);
    res.status(500).json({ message: "Server error" });
  }
};
// Get All Users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// Delete User
const deleteUser = async (req, res) => {
  const userId = req.params.id;

  try {
    // Fetch the user by ID
    const user = await User.findById(userId);

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user is an admin
    if (user.role === "admin") {
      return res.status(403).json({ message: "Admins cannot be deleted" });
    }

    // Proceed with deleting the user
    await User.findByIdAndDelete(userId);

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error" });
  }
};



// Get All Jobs
const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate("employer", "name") // Populate the employer field with the name only
      .exec();
    res.json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// Delete a Job
const deleteJob = async (req, res) => {
  const jobId = req.params.id;

  try {
    const job = await Job.findByIdAndDelete(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    console.error("Error deleting job:", error);
    res.status(500).json({ message: "Server error" });
  }
};


module.exports = {getAdminProfile, verifyEmployer, getAllUsers, deleteUser, getAllJobs, deleteJob};