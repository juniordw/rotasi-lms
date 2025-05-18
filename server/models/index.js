import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Sequelize } from 'sequelize';
import process from 'process';
import config from '../config/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];
const db = {};

let sequelize;
if (dbConfig.use_env_variable) {
  sequelize = new Sequelize(process.env[dbConfig.use_env_variable], dbConfig);
} else {
  sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, dbConfig);
}

// Use dynamic imports for all model files
const modelFiles = fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  });

// Load all models asynchronously
for (const file of modelFiles) {
  if (file !== 'index.js') {
    // Convert the path to a file URL for ESM compatibility
    const modelPath = path.join(__dirname, file);
    const modelURL = new URL(`file://${modelPath}`).href;
    const modelModule = await import(modelURL);
    const model = modelModule.default(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  }
}

// Set up associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
export const { 
  User, Course, Module, Lesson, Enrollment, Progress, 
  Category, Quiz, Question, Answer, UserAnswer, 
  Certificate, Discussion, Comment, Notification, RefreshToken 
} = db;