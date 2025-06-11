const express = require("express");
const router = express.Router();
const userUpload = require('../middleware/userUploadMiddleware');

const {registerUser,loginUser,forgotPassword,resetPassword,} = require("../controllers/userController");
const { verifyOtp, resendOtp } = require("../controllers/verifyController");


router.post("/register", userUpload, registerUser);

router.post("/login", loginUser);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;