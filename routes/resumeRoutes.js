// routes/resumeRoutes.js

const express = require("express");
const axios = require("axios");
const { upload } = require("../middleware/upload");
const { uploadToCloudinary } = require("../config/cloudinary");
const ParsedResume = require("../model/ParsedResume");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @route   POST /api/input/upload-resume
 * @desc    Upload resume file, send to n8n for parsing, and save structured data
 * @access  Private (JWT required)
 */
router.post(
  "/upload-resume",
  authMiddleware,
  upload.single("resume"),
  async (req, res) => {
    try {
      // Step 1: Validate file
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Step 2: Upload file to Cloudinary
      const cloudResult = await uploadToCloudinary(
        file.buffer,
        file.originalname
      );
      const { secure_url, raw_url } = cloudResult;

      // Step 3: Send file URL to n8n webhook for parsing
      const webhookUrl = process.env.N8N_RESUME_WEBHOOK;
      const { data: parsedData } = await axios.post(webhookUrl, {
        fileUrl: raw_url,
        id: req.user.id,
      });

      if (!parsedData || typeof parsedData !== "object") {
        return res
          .status(400)
          .json({ error: "Invalid parsed data received from n8n" });
      }

      // Step 4: Save parsed data in MongoDB
      const savedData = await ParsedResume.findOneAndUpdate(
        { id: req.user.id },
        {
          resumeUrl: raw_url,
          cloudinaryUrl: secure_url,
          data: parsedData,
          updatedAt: new Date(),
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      // Step 5: Respond with success
      return res.status(200).json({
        message: "Resume uploaded, parsed, and saved successfully",
        cloudinaryUrl: secure_url,
        rawUrl: raw_url,
        parsedData: savedData.data,
      });
    } catch (error) {
      console.error("Upload/Parse error:", error.message || error);
      return res.status(500).json({
        error: "Resume upload or parsing failed",
        details: error.message || error.toString(),
      });
    }
  }
);

module.exports = router;
