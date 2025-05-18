import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import db from './models/index.js';
const { sequelize } = db;

// Port
const PORT = process.env.PORT || 5000;

// Start server
const startServer = async () => {
  try {
    // Sync database (in development only)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ force: false, alter: false });
      console.log('Database synced');
    }
    
    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION:', err);
  // Close server & exit process
  process.exit(1);
});

// Start server
startServer();