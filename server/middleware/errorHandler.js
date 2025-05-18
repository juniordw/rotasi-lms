/**
 * Middleware for handling global errors
 * Provides consistent error responses
 */
const errorHandler = (err, req, res, next) => {
  console.error('Global error:', err);
  
  // Determine error status code
  const statusCode = err.statusCode || 500;
  
  // Create error response
  const errorResponse = {
    success: false,
    message: err.message || 'Terjadi kesalahan pada server',
    error: {}
  };
  
  // Add error details in development mode
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error = {
      stack: err.stack,
      detail: err.detail || err
    };
  }
  
  // Add error code if exists
  if (err.code) {
    errorResponse.code = err.code;
  }
  
  // Send error response
  res.status(statusCode).json(errorResponse);
};

export default errorHandler;