const mongoose = require("mongoose");

const options = { discriminatorKey: "role", timestamps: true };

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["jobseeker", "employer", "admin"],
    default: "jobseeker",
  },
  isVerified: { type: Boolean, default: false },
  emailVerified: { type: Boolean, default: false },
  otpCode: { type: String },
  otpExpires: { type: Date },
}, options);

const User = mongoose.model("User", userSchema);
module.exports = User;
