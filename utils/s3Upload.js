const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Configure AWS
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});


// File filter function
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Configure multer
const upload = multer({
  storage: multer.memoryStorage(), // Store file in memory for processing
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Function to upload to S3
const uploadToS3 = async (file, folder) => {
  const key = `${folder}/${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
  
  const upload = new Upload({
    client: s3,
    params: {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }
  });

  await upload.done();
  return key;
};

// Function to delete file from S3
const deleteFromS3 = async (fileKey) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileKey
    });
    
    await s3.send(command);
    return true;
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    return false;
  }
};

// Function to get CloudFront URL
const getCloudFrontUrl = (s3Key) => {
  return `${process.env.AWS_CLOUDFRONT_DOMAIN}/${s3Key}`;
};


const extractS3KeyFromUrl = (url) => {
  if (!url) return null;
  
  const cloudfrontDomain = process.env.AWS_CLOUDFRONT_DOMAIN;
  if (url.startsWith(cloudfrontDomain)) {
    return url.replace(cloudfrontDomain + '/', '');
  }

  return url;
};

module.exports = {
  upload,
  uploadToS3,
  deleteFromS3,
  getCloudFrontUrl,
  extractS3KeyFromUrl,
  s3
};