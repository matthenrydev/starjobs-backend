const express = require("express");
const router = express.Router();
const {registerUser,loginUser, forgotPassword, resetPassword} = require("../controllers/userController");
const { verifyOtp } = require("../controllers/verifyController");
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify-otp", verifyOtp);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);


module.exports = router;
