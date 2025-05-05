const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // Ambil token dari header Authorization
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({ message: 'Akses ditolak. Token tidak ditemukan' });
    }
    
    // Format: "Bearer [token]" - ekstrak token
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Akses ditolak. Format token tidak valid' });
    }

    // Verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Tambahkan user info ke request object
    req.user = decoded;
    
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token kedaluwarsa. Silakan login kembali' });
    }
    res.status(401).json({ message: 'Token tidak valid' });
  }
};