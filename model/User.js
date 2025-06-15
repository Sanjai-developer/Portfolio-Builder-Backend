// backend/models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  otp: { type: String },
  otpExpires: { type: Date },
  isVerified: { type: Boolean, default: false },
  githubToken: { type: String }, // Added for GitHub sync
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
