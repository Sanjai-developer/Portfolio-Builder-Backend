// backend/models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  name: { type: String, required: true },

  // 🔐 Security
  otp: { type: String },
  otpExpires: { type: Date },
  isVerified: { type: Boolean, default: false },

  // 🔄 GitHub Sync
  githubToken: { type: String }, // OAuth2 access token

  // 🌐 Profile
  avatarUrl: { type: String },
  bio: { type: String }, // AI-generated About Me

  // ⚙️ Preferences
  settings: {
    theme: { type: String, default: "light" }, // light | dark
    preferredTemplate: { type: String, default: "basic" },
    aiTone: { type: String, default: "professional" }, // formal, casual, witty, etc.
  },

  // 🔔 Notifications
  notifications: [
    {
      title: String,
      message: String,
      read: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now },
    },
  ],

  // 📊 Activity Logs
  activityLog: [
    {
      action: String,
      timestamp: { type: Date, default: Date.now },
    },
  ],

  createdAt: { type: Date, default: Date.now },
});

// 🔐 Hash password before saving (if modified)
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// 🔍 Compare password method
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
