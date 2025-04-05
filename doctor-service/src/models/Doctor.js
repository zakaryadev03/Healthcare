const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const bcrypt = require('bcryptjs');

const Doctor = sequelize.define('Doctor', {
  doctorId: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  specialization: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

// Hash password before saving
Doctor.beforeCreate(async (doctor) => {
  doctor.password = await bcrypt.hash(doctor.password, 10);
});

module.exports = Doctor;