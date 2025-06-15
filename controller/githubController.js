const axios = require("axios");
const GitHubRepo = require("../model/GitHubRepo");
const { logger } = require("../utils/logger");
const User = require("../model/User");
const githubApi = axios.create({
  baseURL: "https://api.github.com",
  headers: { Accept: "application/vnd.github.v3+json" },
});

// Authenticate and store token
exports.authGitHub = async (req, res, next) => {
  const { githubToken } = req.body;
  logger.info(`Received token: ${githubToken.substring(0, 10)}...`);
  try {
    logger.info(`Calling GitHub API`);
    const response = await githubApi.get("/user", {
      headers: { Authorization: `token ${githubToken}` },
    });
    logger.info(`GitHub user: ${response.data.login}`);
    await User.findByIdAndUpdate(req.user.id, { githubToken }, { new: true });
    res.json({ status: "authenticated" });
  } catch (error) {
    logger.error(`GitHub auth error: ${error.message}`);
    res.status(401).json({
      message: "Invalid GitHub token",
      details: error.message,
    });
  }
};

// Parse raw GitHub data
exports.parseGitHubData = async (rawRepos, githubToken, username) => {
  const parsedRepos = [];

  for (const repo of rawRepos) {
    if (repo.fork) continue; // Skip forks

    // Fetch package.json (if exists)
    let techStack = [repo.language].filter(Boolean);
    try {
      const { data: packageJson } = await githubApi.get(
        `/repos/${repo.owner.login}/${repo.name}/contents/package.json`,
        {
          headers: { Authorization: `token ${githubToken}` },
        }
      );
      const dependencies =
        JSON.parse(Buffer.from(packageJson.content, "base64").toString())
          .dependencies || {};
      techStack = [...new Set([...techStack, ...Object.keys(dependencies)])];
    } catch (error) {
      // No package.json, continue
    }

    // Fetch commits (filter by user)
    const { data: commits } = await githubApi.get(
      `/repos/${repo.owner.login}/${repo.name}/commits`,
      {
        headers: { Authorization: `token ${githubToken}` },
        params: { author: username },
      }
    );

    parsedRepos.push({
      repoId: repo.id.toString(),
      name: repo.name,
      description: repo.description,
      techStack,
      commits: commits.map((c) => ({
        message: c.commit.message,
        date: c.commit.author.date,
        sha: c.sha,
      })),
    });
  }

  return parsedRepos;
};

// Sync GitHub data
exports.syncGitHub = async (req, res) => {
  const { githubToken } = req.body;
  if (!githubToken)
    return res.status(400).json({ error: "GitHub token required" });

  try {
    // Fetch user info
    const { data: user } = await githubApi.get("/user", {
      headers: { Authorization: `token ${githubToken}` },
    });

    // Fetch repos
    const { data: rawRepos } = await githubApi.get(
      `/users/${user.login}/repos`,
      {
        headers: { Authorization: `token ${githubToken}` },
      }
    );

    // Parse data
    const parsedRepos = await exports.parseGitHubData(
      rawRepos,
      githubToken,
      user.login
    );

    // Store in MongoDB
    for (const repo of parsedRepos) {
      await GitHubRepo.findOneAndUpdate(
        { repoId: repo.repoId, userId: req.user.id },
        { ...repo, userId: req.user.id, updatedAt: Date.now() },
        { upsert: true, new: true }
      );
    }

    res.json({
      status: "synced",
      repos: parsedRepos,
      techStack: [...new Set(parsedRepos.map((r) => r.techStack).flat())],
    });
  } catch (error) {
    res.status(500).json({ error: "Sync failed", details: error.message });
  }
};

// Get stored repos
exports.getGitHubRepos = async (req, res) => {
  try {
    const repos = await GitHubRepo.find({ userId: req.user.id });
    res.json({ repos });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch repos" });
  }
};
