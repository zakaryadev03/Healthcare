const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'doctordb',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgres',
  {
    host: process.env.DB_HOST || 'doctor-db',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
  }
);

module.exports = sequelize;