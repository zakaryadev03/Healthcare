const express = require('express');
const connectDB = require('./config/db');
const patientRoutes = require('./routes/patientRoutes');
require('./grpc/server');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(express.json());

// Database connection
connectDB();

// Routes
app.use('/patients', patientRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Patient service running on port ${PORT}`);
});