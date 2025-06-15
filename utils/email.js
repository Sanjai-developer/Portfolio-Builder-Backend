const nodemailer = require("nodemailer");
const { logger } = require("./logger");
require("dotenv").config();


console.log("Email User:", process.env.EMAIL_USER);
console.log("Email Pass:", process.env.EMAIL_PASS);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, text }) => {
  try {
    await transporter.sendMail({ to, subject, text });
    logger.info(`Email sent to ${to}`);
  } catch (error) {
    logger.error(`Email error: ${error.message}`);
    throw error;
  }
};

module.exports = { sendEmail };
