import { Sequelize } from 'sequelize';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read config file
const configPath = path.join(__dirname, 'config.json');
const configFile = fs.readFileSync(configPath, 'utf8');
const config = JSON.parse(configFile)[process.env.NODE_ENV || 'development'];

// Create database connection
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
      underscored: true, // Use snake_case for column names
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    },
    timezone: '+07:00' // Western Indonesia Time
  }
);

// Function to test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection successful.');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
};

export { sequelize, testConnection };