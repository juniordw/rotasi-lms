import corsPackage from 'cors';

/**
 * CORS configuration for security
 * Set allowed origins, methods, and headers
 */
const corsOptions = {
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    
    // List of allowed origins
    const allowedOrigins = [
      process.env.CLIENT_URL || 'http://localhost:3000', // Frontend production
      'http://localhost:3000', // Frontend development
      'https://rotasi.company.com', // Production domain
      /\.company\.com$/ // All company.com subdomains
    ];
    
    // Check if origin is in allowed list
    let isAllowed = false;
    
    for (let i = 0; i < allowedOrigins.length; i++) {
      const allowedOrigin = allowedOrigins[i];
      
      // If allowedOrigin is RegExp
      if (allowedOrigin instanceof RegExp) {
        if (allowedOrigin.test(origin)) {
          isAllowed = true;
          break;
        }
      } 
      // If allowedOrigin is string
      else if (allowedOrigin === origin) {
        isAllowed = true;
        break;
      }
    }
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'), false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Disposition'], // For file downloads
  credentials: true,
  maxAge: 86400 // 24 hours
};

const cors = corsPackage(corsOptions);
export default cors;