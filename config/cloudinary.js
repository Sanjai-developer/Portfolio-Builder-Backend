const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

/**
 * Upload resume file to Cloudinary under "portfolio/resumes/" folder
 * and return secure_url + raw download URL
 */
const uploadToCloudinary = (buffer, fileName) => {
  return new Promise((resolve, reject) => {
    const publicId = `portfolio/resumes/${fileName}`;

    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "raw", public_id: publicId, overwrite: true },
      (error, result) => {
        if (error) return reject(error);

        // Construct raw downloadable URL manually (n8n-safe)
        const rawDownloadUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/raw/upload/${publicId}`;

        resolve({
          secure_url: result.secure_url, // Cloudinary's version
          raw_url: rawDownloadUrl, // Direct raw download URL
          public_id: result.public_id,
          original_filename: result.original_filename,
        });
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
};

module.exports = { uploadToCloudinary };
