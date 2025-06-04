const express = require("express");
const router = express.Router();
const { authenticate, authorizeAdmin } = require("../middleware/authMiddleware");
const {getAdminProfile, verifyEmployer, getAllUsers, deleteUser, getAllJobs, deleteJob} = require("../controllers/adminController");

// Get employer profile
router.get("/profile", authenticate,authorizeAdmin, getAdminProfile);

// Verify employer
router.post("/verify-employer/:id", authenticate, authorizeAdmin, verifyEmployer);

// Get all users
router.get("/users", authenticate, authorizeAdmin, getAllUsers);

// Delete user
router.delete("/user/:id", authenticate, authorizeAdmin, deleteUser);

// Get all jobs
router.get("/jobs", authenticate, authorizeAdmin, getAllJobs);

// Delete job
router.delete("/job/:id", authenticate, authorizeAdmin, deleteJob);

module.exports = router;
