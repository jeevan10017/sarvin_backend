const express = require('express');
const router = express.Router();
const { upload, uploadToS3, getCloudFrontUrl } = require('../utils/s3Upload');
const { protect, admin } = require('../middlewares/auth');

// @desc    Upload single image
// @route   POST /api/upload/single
// @access  Private
router.post('/single', protect, (req, res, next) => {
  req.uploadFolder = req.body.folder || 'images';
  next();
}, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const s3Key = await uploadToS3(req.file, req.uploadFolder);
    const cloudFrontUrl = getCloudFrontUrl(s3Key);
    
    res.json({
      message: 'File uploaded successfully',
      url: cloudFrontUrl,
      key: s3Key,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Error uploading file', error: error.message });
  }
});

// @desc    Upload multiple images
// @route   POST /api/upload/multiple
// @access  Private
router.post('/multiple', protect, (req, res, next) => {
  req.uploadFolder = req.body.folder || 'images';
  next();
}, upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const uploadedFiles = [];
    for (const file of req.files) {
      const s3Key = await uploadToS3(file, req.uploadFolder);
      uploadedFiles.push({
        url: getCloudFrontUrl(s3Key),
        key: s3Key,
        size: file.size,
        mimetype: file.mimetype
      });
    }
    
    res.json({
      message: 'Files uploaded successfully',
      files: uploadedFiles
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Error uploading files', error: error.message });
  }
});

// @desc    Upload product images
// @route   POST /api/upload/product
// @access  Private/Admin
router.post('/product', protect, admin, (req, res, next) => {
  req.uploadFolder = 'products';
  next();
}, upload.array('images', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const uploadedImages = req.files.map(file => getCloudFrontUrl(file.key));
    
    res.json({
      message: 'Product images uploaded successfully',
      images: uploadedImages
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Error uploading product images' });
  }
});

// @desc    Upload category image
// @route   POST /api/upload/category
// @access  Private/Admin
router.post('/category', protect, admin, (req, res, next) => {
  req.uploadFolder = 'categories';
  next();
}, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const cloudFrontUrl = getCloudFrontUrl(req.file.key);
    
    res.json({
      message: 'Category image uploaded successfully',
      image: cloudFrontUrl
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Error uploading category image' });
  }
});

// @desc    Upload type logo
// @route   POST /api/upload/type
// @access  Private/Admin
router.post('/type', protect, admin, (req, res, next) => {
  req.uploadFolder = 'types';
  next();
}, upload.single('logo'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const cloudFrontUrl = getCloudFrontUrl(req.file.key);
    
    res.json({
      message: 'type logo uploaded successfully',
      logo: cloudFrontUrl
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Error uploading type logo' });
  }
});

module.exports = router;