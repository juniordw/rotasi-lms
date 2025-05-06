/**
 * Middleware to check user role
 * Used to restrict access based on user roles
 * 
 * @param {...string} roles - List of allowed roles
 * @returns {Function} Express middleware function
 */
const roleAuth = (...roles) => {
  return (req, res, next) => {
    // Ensure auth middleware ran first and req.user exists
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Akses ditolak. Belum terautentikasi' 
      });
    }

    // Check if user's role is in allowed roles list
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Akses ditolak. Anda tidak memiliki izin yang cukup',
        requiredRoles: roles,
        yourRole: req.user.role
      });
    }

    // User has appropriate role, continue to next handler
    next();
  };
};

export default roleAuth;