// backend/models/GitHubRepo.js
const mongoose = require("mongoose");

const gitHubRepoSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  repoId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  techStack: [{ type: String }],
  commits: [{ message: String, date: Date, sha: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("GitHubRepo", gitHubRepoSchema);
