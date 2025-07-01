// E:\Portfolio\server\server.js

require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const socialRoutes = require("./routes/socialRoutes");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const githubRoutes = require("./routes/githubRoutes");

const resumeRoutes = require("./routes/resumeRoutes");
const errorHandler = require("./middleware/errorMiddleware");
const { logger } = require("./utils/logger");

const app = express();

// ─────────────────────────────
// 🌐 Middleware Setup
// ─────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL||5173,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─────────────────────────────
// 🔐 JWT Authentication
// ─────────────────────────────
const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    logger.warn("No token provided");
    return res.status(401).json({ message: "No token provided" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    logger.info(`Authenticated user: ${decoded.id}`);
    next();
  } catch (err) {
    logger.error(`Invalid token: ${err.message}`);
    res.status(401).json({ message: "Invalid token" });
  }
};

// ─────────────────────────────
// ⚙️ MongoDB Connection
// ─────────────────────────────
connectDB();

// ─────────────────────────────
// 📦 Routes
// ─────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/github", githubRoutes);

app.use("/api/input", authMiddleware, resumeRoutes); // Upload handled in route
app.use("/api/social", authMiddleware, socialRoutes);
// ─────────────────────────────
// ❌ Error Handler
// ─────────────────────────────
app.use(errorHandler);

// ─────────────────────────────
// 🚀 Start Server
// ─────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  logger.info(`Server running on port ${PORT}`);
});
