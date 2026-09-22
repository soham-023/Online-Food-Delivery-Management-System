const multer = require('multer');
const path = require('path');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

// Storage: use memory buffer for Cloudinary upload, disk fallback if Cloudinary not configured
const isCloudinaryConfigured =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_KEY !== 'your_api_key';

const storage = isCloudinaryConfigured
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, 'uploads/');
      },
      filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
      },
    });

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});


const uploadToCloudinary = (folder = 'annseva') => {
  return async (req, res, next) => {
    if (!req.file) return next();

   
    if (!isCloudinaryConfigured) {
      return next();
    }

    try {
      
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: 'image',
            transformation: [
              { width: 800, height: 600, crop: 'limit', quality: 'auto', fetch_format: 'auto' },
            ],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(req.file.buffer);
      });

      
      req.file.cloudinaryUrl = result.secure_url;
      req.file.cloudinaryId = result.public_id;
      next();
    } catch (error) {
      console.error('❌ Cloudinary upload error:', error.message);
      next(error);
    }
  };
};


const getImageUrl = (req) => {
  if (!req.file) return null;
  if (req.file.cloudinaryUrl) return req.file.cloudinaryUrl;
  return `/uploads/${req.file.filename}`;
};

module.exports = { upload, uploadToCloudinary, getImageUrl };
