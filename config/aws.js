const AWS = require('aws-sdk');

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const s3 = new AWS.S3();
const cloudFrontDomain = process.env.AWS_CLOUDFRONT_DOMAIN;

// Convert S3 URL to CloudFront URL
const toCloudFrontUrl = (url) => {
  if (!url) return url;
  
  const s3Domain = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`;
  if (url.includes(s3Domain)) {
    return url.replace(s3Domain, cloudFrontDomain);
  }
  return url;
};

module.exports = { s3, cloudFrontDomain, toCloudFrontUrl };