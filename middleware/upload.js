// /middleware/upload.js
const multer = require("multer");

const storage = multer.memoryStorage(); // buffer instead of disk
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = [".pdf", ".docx"];
    const ext = require("path").extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error("Only .pdf and .docx files are allowed"));
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

module.exports = { upload };
