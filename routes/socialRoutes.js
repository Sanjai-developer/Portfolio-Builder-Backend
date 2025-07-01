const express = require("express");
const axios = require("axios");
const UserSocialData = require("../model/UserSocialData");

const router = express.Router();

/**
 * Save or update GitHub, LinkedIn, LeetCode links
 */
router.post("/save", async (req, res) => {
  try {
    const { github, linkedin, leetcode } = req.body;
    const id = req.user.id;

    if (!github)
      return res
        .status(400)
        .json({ error: "GitHub link or username is required." });

    const githubUsername = github.includes("github.com")
      ? github.split("github.com/")[1].split("/")[0]
      : github;

    // Fetch GitHub profile and repositories
    const [profileRes, reposRes] = await Promise.all([
      axios.get(`https://api.github.com/users/${githubUsername}`),
      axios.get(`https://api.github.com/users/${githubUsername}/repos`),
    ]);

    const saved = await UserSocialData.findOneAndUpdate(
      { id },
      {
        github: {
          username: githubUsername,
          profile: profileRes.data,
          repos: reposRes.data,
        },
        linkedin: {
          url: linkedin || null,
        },
        leetcode: {
          username: leetcode || null,
        },
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    return res
      .status(200)
      .json({
        message: "Social links saved and GitHub data synced.",
        data: saved,
      });
  } catch (err) {
    console.error("Error saving social links:", err.message);
    res.status(500).json({ error: "Failed to save social data." });
  }
});

/**
 * Get user's synced social data
 */
router.get("/me", async (req, res) => {
  try {
    const id = req.user.id;
    const data = await UserSocialData.findOne({ id });
    if (!data) return res.status(404).json({ error: "No data found." });
    res.status(200).json({ data });
  } catch (err) {
    console.error("Error fetching social data:", err.message);
    res.status(500).json({ error: "Failed to fetch data." });
  }
});

module.exports = router;
