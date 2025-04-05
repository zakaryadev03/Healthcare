const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const { uploadToS3 } = require('./s3Uploader');

// Load proto file
const PROTO_PATH = path.join(__dirname, 'grpc/patient.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const patientProto = grpc.loadPackageDefinition(packageDefinition).PatientService;

// Create gRPC client
const client = new patientProto(
  process.env.PATIENT_SERVICE_ADDRESS || 'patient-service:50051',
  grpc.credentials.createInsecure()
);

// Upload and update workflow
async function uploadAndUpdate(patientId, filePath) {
  try {
    // 1. Upload to S3
    const s3Uri = await uploadToS3(patientId, filePath);
    
    // 2. Update Patient Service
    const response = await new Promise((resolve, reject) => {
      client.UpdateMedicalFile(
        { patient_id: patientId, s3_uri: s3Uri },
        (err, response) => err ? reject(err) : resolve(response)
      );
    });

    console.log('Success:', response.message);
  } catch (err) {
    console.error('Error:', err.message);
  }
}