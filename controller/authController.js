const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../model/User");
const RefreshToken = require("../model/RefreshToken");
const { sendEmail } = require("../utils/email");
const { logger } = require("../utils/logger");

const register = async (req, res, next) => {
  const { email, password, name } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) throw new Error("User already exists");

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({ email, password: hashedPassword, name });
    await user.save();

    const verificationToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    await sendEmail({
      to: email,
      subject: "Verify Your Email",
      text: `Click to verify: ${process.env.CLIENT_URL}/verify/${verificationToken}`,
    });

    res
      .status(201)
      .json({ message: "User registered. Please verify your email." });
  } catch (error) {
    logger.error(`Register error: ${error.message}`);
    next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  const { token } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) throw new Error("User not found");
    if (user.isVerified) throw new Error("Email already verified");

    user.isVerified = true;
    await user.save();

    res.json({ message: "Email verified successfully" });
  } catch (error) {
    logger.error(`Verify email error: ${error.message}`);
    next(error);
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) throw new Error("Invalid credentials");
    if (!user.isVerified) throw new Error("Please verify your email");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid credentials");

    const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    const refreshToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await RefreshToken.create({
      id: user._id,
      token: refreshToken,
      expiresAt,
    });

    res.json({ accessToken, refreshToken });
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  const { refreshToken } = req.body;
  try {
    const tokenDoc = await RefreshToken.findOne({
      token: refreshToken,
      expiresAt: { $gt: Date.now() },
    });
    if (!tokenDoc) throw new Error("Invalid or expired refresh token");

    const accessToken = jwt.sign(
      { id: tokenDoc.id },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );
    res.json({ accessToken });
  } catch (error) {
    logger.error(`Refresh token error: ${error.message}`);
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) throw new Error("User not found");

    const otp = crypto.randomInt(100000, 999999).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    await sendEmail({
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP is ${otp}. It expires in 10 minutes.`,
    });

    res.json({ message: "OTP sent to email" });
  } catch (error) {
    logger.error(`Forgot password error: ${error.message}`);
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  const { email, otp, newPassword } = req.body;
  try {
    const user = await User.findOne({
      email,
      otp,
      otpExpires: { $gt: Date.now() },
    });
    if (!user) throw new Error("Invalid or expired OTP");

    user.password = await bcrypt.hash(newPassword, 12);
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    logger.error(`Reset password error: ${error.message}`);
    next(error);
  }
};

const logout = async (req, res, next) => {
  const { refreshToken } = req.body;
  try {
    await RefreshToken.deleteOne({ token: refreshToken });
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    logger.error(`Logout error: ${error.message}`);
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select(
      "-password -otp -otpExpires"
    );
    if (!user) throw new Error("User not found");
    res.json(user);
  } catch (error) {
    logger.error(`Get profile error: ${error.message}`);
    next(error);
  }
};

module.exports = {
  register,
  verifyEmail,
  login,
  refreshToken,
  forgotPassword,
  resetPassword,
  logout,
  getProfile,
};
