/**
 * Middleware untuk menangani error global
 * Memberikan respons error yang konsisten
 */
const errorHandler = (err, req, res, next) => {
    console.error('Global error:', err);
    
    // Tentukan status code error
    const statusCode = err.statusCode || 500;
    
    // Buat response error
    const errorResponse = {
      success: false,
      message: err.message || 'Terjadi kesalahan pada server',
      error: {}
    };
    
    // Tambahkan detail error di development mode
    if (process.env.NODE_ENV === 'development') {
      errorResponse.error = {
        stack: err.stack,
        detail: err.detail || err
      };
    }
    
    // Tambahkan error code jika ada
    if (err.code) {
      errorResponse.code = err.code;
    }
    
    // Kirim response error
    res.status(statusCode).json(errorResponse);
  };
  
  module.exports = errorHandler;