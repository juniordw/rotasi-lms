const cors = require('cors');

/**
 * Konfigurasi CORS untuk keamanan
 * Mengatur origin, method, dan header yang diizinkan
 */
const corsOptions = {
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    
    // Daftar origin yang diizinkan
    const allowedOrigins = [
      process.env.CLIENT_URL || 'http://localhost:3000', // Frontend production
      'http://localhost:3000', // Frontend development
      'https://rotasi.company.com', // Production domain
      /\.company\.com$/ // Semua subdomain company.com
    ];
    
    // Cek apakah origin ada dalam daftar yang diizinkan
    let isAllowed = false;
    
    for (let i = 0; i < allowedOrigins.length; i++) {
      const allowedOrigin = allowedOrigins[i];
      
      // Jika allowedOrigin adalah RegExp
      if (allowedOrigin instanceof RegExp) {
        if (allowedOrigin.test(origin)) {
          isAllowed = true;
          break;
        }
      } 
      // Jika allowedOrigin adalah string
      else if (allowedOrigin === origin) {
        isAllowed = true;
        break;
      }
    }
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('CORS tidak diizinkan'), false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Disposition'], // Untuk download file
  credentials: true,
  maxAge: 86400 // 24 jam
};

module.exports = cors(corsOptions);