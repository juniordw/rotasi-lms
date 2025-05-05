// server/config/db.js
const { Sequelize } = require('sequelize');
const config = require('./config.json')[process.env.NODE_ENV || 'development'];

// Buat koneksi database
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: config.dialect,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      underscored: true, // Gunakan snake_case untuk nama kolom
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    },
    timezone: '+07:00' // Waktu Indonesia Barat
  }
);

// Fungsi untuk menguji koneksi database
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Koneksi database berhasil.');
    return true;
  } catch (error) {
    console.error('Koneksi database gagal:', error);
    return false;
  }
};

module.exports = {
  sequelize,
  testConnection
};