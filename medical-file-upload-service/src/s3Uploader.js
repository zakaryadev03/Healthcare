const AWS = require('aws-sdk');
const path = require('path');
require('dotenv').config();

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: 'us-east-1'
});

const s3 = new AWS.S3();
const BUCKET_NAME = 'medical-files-bucket';

module.exports.uploadToS3 = async (patientId, filePath) => {
  const fileContent = require('fs').readFileSync(filePath);
  const key = `/patients/${patientId}/${path.basename(filePath)}`;

  await s3.putObject({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: fileContent
  }).promise();

  return `s3://${BUCKET_NAME}/${key}`;
};