const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { auth } = require('../middleware/auth');

const router = express.Router();

// Configure Cloudinary if env vars provided
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

// Use memory storage; we forward buffer to Cloudinary
const upload = multer({ storage: multer.memoryStorage() });

const isCloudinaryConfigured = () =>
  Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);

// POST /api/upload/image
router.post('/image', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    if (!isCloudinaryConfigured()) {
      return res.status(501).json({ message: 'Image upload service not configured' });
    }

    const result = await cloudinary.uploader.upload_stream(
      { folder: 'blog/images' },
      (error, uploadResult) => {
        if (error) {
          return res.status(500).json({ message: 'Cloud upload failed', error: error.message });
        }
        return res.status(201).json({
          message: 'Image uploaded successfully',
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          width: uploadResult.width,
          height: uploadResult.height,
          format: uploadResult.format
        });
      }
    );

    // Write the buffer to the stream
    result.end(req.file.buffer);
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ message: 'Server error uploading image' });
  }
});

// POST /api/upload/file
router.post('/file', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }

    if (!isCloudinaryConfigured()) {
      return res.status(501).json({ message: 'File upload service not configured' });
    }

    const result = await cloudinary.uploader.upload_stream(
      { folder: 'blog/files', resource_type: 'auto' },
      (error, uploadResult) => {
        if (error) {
          return res.status(500).json({ message: 'Cloud upload failed', error: error.message });
        }
        return res.status(201).json({
          message: 'File uploaded successfully',
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          bytes: uploadResult.bytes,
          format: uploadResult.format,
          resourceType: uploadResult.resource_type
        });
      }
    );

    result.end(req.file.buffer);
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ message: 'Server error uploading file' });
  }
});

module.exports = router;


