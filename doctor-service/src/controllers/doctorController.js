const Doctor = require('../models/Doctor');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const amqp = require('amqplib');

let channel = null;

// Connect to RabbitMQ
exports.connectRabbitMQ = async () => {
  const maxRetries = 5;
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      const conn = await amqp.connect(process.env.AMQP_URL);
      channel = await conn.createChannel();
      await channel.assertExchange('doctor-events', 'topic', { durable: false });
      console.log('✅ Connected to RabbitMQ');
      return;
    } catch (err) {
      retries++;
      console.error(`⚠️ RabbitMQ connection failed (attempt ${retries}):`, err.message);
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5s
    }
  }
  console.error('❌ Failed to connect to RabbitMQ after retries');
};


exports.deleteDoctor = async (req, res) => {
  try {
    const doctorId = req.doctor.doctorId;
    await req.doctor.destroy();

    // Emit event to RabbitMQ
    if (channel) {
      channel.publish(
        'doctor-events',
        'doctor.deleted',
        Buffer.from(doctorId)
      );
      console.log(`Emitted event: doctor.deleted for ${doctorId}`);
    }

    res.json({ message: 'Doctor deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Register a new doctor
exports.createDoctor = async (req, res) => {
  try {
    const { username, password, specialization } = req.body;
    const doctor = await Doctor.create({ username, password, specialization });
    res.status(201).json({ doctorId: doctor.doctorId });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Doctor login
exports.loginDoctor = async (req, res) => {
  try {
    const { username, password } = req.body;
    const doctor = await Doctor.findOne({ where: { username } });

    if (!doctor || !(await bcrypt.compare(password, doctor.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { doctorId: doctor.doctorId },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get doctor details (protected)
exports.getDoctor = async (req, res) => {
  res.json(req.doctor); // Attached by authMiddleware
};