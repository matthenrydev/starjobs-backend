const User = require("../models/User");
const Jobseeker = require("../models/Jobseeker");
const Employer = require("../models/Employer");
const sendMail = require("../utils/sendMail");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register User
const registerUser = async (req, res) => {
  const {
    name,
    email,
    password,
    role,
    // Jobseeker fields from req.body (initially as strings from FormData)
    skills,
    qualifications,
    experiences,
    // Employer fields from req.body (non-file fields)
    panNumber,
    establishedDate,
    industryType,
    companySize,
    address,
    telephone,
    description,
  } = req.body;

  // Access uploaded files from req.files (using multer's upload.fields for multiple files)
  const profilePicFile = req.files && req.files['profilePic'] ? req.files['profilePic'][0] : null;
  const resumeFile = req.files && req.files['resume'] ? req.files['resume'][0] : null;
  const companyLogoFile = req.files && req.files['companyLogo'] ? req.files['companyLogo'][0] : null;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "All required fields (name, email, password, role) are missing." });
  }

  if (!["jobseeker", "employer", "admin"].includes(role)) {
    return res.status(400).json({ message: "Invalid role provided. Role must be 'jobseeker', 'employer', or 'admin'." });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters long." });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User with this email already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

    let userData = {
      name,
      email,
      password: hashedPassword,
      role,
      otpCode: otp,
      otpExpires: otpExpiry,
    };

    let user;

    if (role === "jobseeker") {
      // === IMPORTANT FIX ===
      // Parse JSON strings back into arrays/objects for Mongoose
      let parsedSkills = [];
      if (skills) {
        try {
          parsedSkills = JSON.parse(skills);
        } catch (e) {
          console.error("Failed to parse skills JSON:", skills, e);
          return res.status(400).json({ message: "Invalid format for skills." });
        }
      }

      let parsedQualifications = [];
      if (qualifications) {
        try {
          parsedQualifications = JSON.parse(qualifications);
        } catch (e) {
          console.error("Failed to parse qualifications JSON:", qualifications, e);
          return res.status(400).json({ message: "Invalid format for qualifications." });
        }
      }

      let parsedExperiences = [];
      if (experiences) {
        try {
          parsedExperiences = JSON.parse(experiences);
        } catch (e) {
          console.error("Failed to parse experiences JSON:", experiences, e);
          return res.status(400).json({ message: "Invalid format for experiences." });
        }
      }

      // Add profilePic and resume paths if files were uploaded
      if (profilePicFile) {
        userData.profilePic = `/uploads/profile_pics/${profilePicFile.filename}`; // Store relative path
      }
      if (resumeFile) {
        userData.resume = `/uploads/resumes/${resumeFile.filename}`; // Store relative path
      }

      user = new Jobseeker({
        ...userData,
        skills: parsedSkills, // Use parsed array
        qualifications: parsedQualifications, // Use parsed array of objects
        experiences: parsedExperiences, // Use parsed array of objects
      });
    } else if (role === "employer") {
      // Add companyLogo path if file was uploaded
      if (companyLogoFile) {
        userData.companyLogo = `/uploads/company_logos/${companyLogoFile.filename}`; // Store relative path
      }

      user = new Employer({
        ...userData,
        panNumber,
        establishedDate,
        industryType,
        companySize,
        address,
        telephone,
        description,
      });
    } else if (role === "admin") {
      // Handle admin specific fields if any, or just use base userData
      user = new User({ ...userData });
    } else {
      return res.status(400).json({ message: "Invalid role specified." });
    }

    await user.save();

    await sendMail(email, "Verify your email", `Your OTP code is ${otp}`);

    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    console.error("Register error:", error);
    // Consider adding logic here to delete uploaded files if user creation fails
    res.status(500).json({ message: "An error occurred during registration. Please try again later." });
  }
};




// Login User
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Input validation
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (error) {
    console.error("Error in loginUser:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // expires in 10 mins

    user.otpCode = otp;
    user.otpExpires = otpExpiry;
    await user.save();

    await sendMail(email, "Reset your password", `Your OTP code is ${otp}`);

    res.json({ message: "OTP sent to email for password reset." });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: "Email, OTP, and new password are required" });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.otpCode !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // Clear OTP fields
    user.otpCode = undefined;
    user.otpExpires = undefined;

    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { registerUser, loginUser, forgotPassword, resetPassword };
