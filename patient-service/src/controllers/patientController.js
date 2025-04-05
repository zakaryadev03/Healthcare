const Patient = require('../models/Patient');
const amqp = require('amqplib');

let channel = null;
const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect(process.env.AMQP_URL || 'amqp://admin:admin@rabbitmq');
    channel = await connection.createChannel();
    
    // Declare the exchange (creates it if it doesn't exist)
    await channel.assertExchange('patient-events', 'topic', {
      durable: false
    });
    
    console.log('✅ Connected to RabbitMQ');
  } catch (err) {
    console.error('❌ RabbitMQ connection error:', err.message);
    setTimeout(connectRabbitMQ, 5000); // Retry every 5 seconds
  }
};

// Initialize connection on startup
connectRabbitMQ();

exports.createPatient = async (req, res) => {
  try {
    const patient = await Patient.create(req.body);
    res.status(201).json(patient);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getPatient = async (req, res) => {
  try {
    const patient = await Patient.findOne({ patientId: req.params.patientId });
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findOneAndDelete({ 
      patientId: req.params.patientId 
    });

    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    // Emit event to RabbitMQ
    if (channel) {
      channel.publish(
        'patient-events',
        'patient.deleted',
        Buffer.from(patient.patientId)
      );
    }

    res.json({ message: 'Patient deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};