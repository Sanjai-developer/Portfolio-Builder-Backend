const jwt = require("jsonwebtoken");
const { logger } = require("../utils/logger");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id }; // ✅ Ensure req.user.id is available
    logger.info(`✅ Authenticated user: ${decoded.id}`);
    next();
  } catch (error) {
    logger.error(`Auth middleware error: ${error.message}`);
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;
