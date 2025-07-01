const mongoose = require("mongoose");

const ParsedResumeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    resumeUrl: String,
    cloudinaryUrl: String,
    data: mongoose.Schema.Types.Mixed,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  }, { strict: false }); // Allow any keys inside `data`
  
module.exports = mongoose.model("ParsedResume", ParsedResumeSchema);
