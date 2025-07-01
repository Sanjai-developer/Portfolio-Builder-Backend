const mongoose = require("mongoose");

const UserSocialDataSchema = new mongoose.Schema({
  id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  github: {
    username: String,
    repos: Array,
    profile: Object,
  },
  linkedin: {
    url: String,
    data: Object, // will be populated later
  },
  leetcode: {
    username: String,
    stats: Object, // to be populated later
  },
  addedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("UserSocialData", UserSocialDataSchema);
