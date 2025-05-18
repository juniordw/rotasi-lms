import jwt from 'jsonwebtoken';

const auth = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({ message: 'Akses ditolak. Token tidak ditemukan' });
    }
    
    // Format: "Bearer [token]" - extract token
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Akses ditolak. Format token tidak valid' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user info to request object
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

export default auth;