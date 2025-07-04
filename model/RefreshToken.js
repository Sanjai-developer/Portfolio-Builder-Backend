const mongoose = require("mongoose");

const refreshTokenSchema = new mongoose.Schema({
  id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  token: { type: String, required: true },
  expiresAt: { type: Date, required: true },
});

module.exports = mongoose.model("RefreshToken", refreshTokenSchema);
