const jwt = require('jsonwebtoken');
const Doctor = require('../models/Doctor');

module.exports = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    const doctor = await Doctor.findByPk(decoded.doctorId);
    if (!doctor) return res.status(401).json({ error: 'Invalid token' });
    req.doctor = doctor;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};