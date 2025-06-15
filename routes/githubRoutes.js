const express = require('express');
const router = express.Router();
const githubController = require('../controller/githubController');
const auth = require('../middleware/authMiddleware');

router.post('/auth', auth, githubController.authGitHub);
router.post('/sync', auth, githubController.syncGitHub);
router.get('/repos', auth, githubController.getGitHubRepos);

module.exports = router;