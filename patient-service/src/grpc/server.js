// patient-service/src/grpc/server.js
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const Patient = require('../models/Patient');

const PROTO_PATH = __dirname + '/patient.proto';

const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const patientProto = grpc.loadPackageDefinition(packageDefinition).PatientService;

const server = new grpc.Server();

server.addService(patientProto.service, {
  UpdateMedicalFile: async (call, callback) => {
    try {
      const patient = await Patient.findOneAndUpdate(
        { patientId: call.request.patient_id },
        { medicfilemeta: call.request.s3_uri },
        { new: true }
      );

      if (!patient) {
        return callback(null, { success: false, message: "Patient not found" });
      }

      callback(null, { success: true, message: "S3 URI updated" });
    } catch (err) {
      callback({ code: grpc.status.INTERNAL, message: "Server error" });
    }
  }
});

server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
  server.start();
  console.log('gRPC server running on port 50051');
});