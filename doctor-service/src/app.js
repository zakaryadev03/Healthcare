const express = require('express');
const sequelize = require('./config/db');
const doctorRoutes = require('./routes/doctorRoutes');
const cors = require('cors');
const { connectRabbitMQ } = require('./controllers/doctorController');

const app = express();
const PORT = process.env.PORT || 3000;

connectRabbitMQ(); // Connect to RabbitMQ

// Middleware
app.use(express.json());
app.use(cors()); // Enable CORS for frontend communication

// Database connection
sequelize
  .authenticate()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch((err) => console.error('Database connection failed:', err));

// Sync models (create tables if they don't exist)
sequelize.sync({ alter: true }); // Use `force: true` only for dev to drop tables!

// Routes
app.use('/doctors', doctorRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Doctor service running on port ${PORT}`);
});