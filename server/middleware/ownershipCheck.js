/**
 * Middleware for checking resource ownership
 * Used to ensure users can only access/modify
 * resources they own
 * 
 * @param {Object} model - Sequelize model
 * @param {string} paramId - ID parameter name in URL
 * @param {string} userIdField - User ID field name in model
 * @returns {Function} Express middleware function
 */
const ownershipCheck = (model, paramId = 'id', userIdField = 'user_id') => {
  return async (req, res, next) => {
    try {
      // Ensure auth middleware ran first
      if (!req.user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Akses ditolak. Belum terautentikasi' 
        });
      }

      // Admins always have access
      if (req.user.role === 'admin') {
        return next();
      }

      const resourceId = req.params[paramId];
      
      if (!resourceId) {
        return res.status(400).json({ 
          success: false, 
          message: `Parameter ${paramId} tidak ditemukan` 
        });
      }

      // Find resource by ID
      const resource = await model.findByPk(resourceId);
      
      if (!resource) {
        return res.status(404).json({ 
          success: false, 
          message: 'Resource tidak ditemukan' 
        });
      }

      // Check if user owns resource
      if (resource[userIdField] !== req.user.id) {
        return res.status(403).json({ 
          success: false, 
          message: 'Akses ditolak. Anda bukan pemilik resource ini' 
        });
      }

      // Add resource to request for controllers to use
      req.resource = resource;
      
      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
};

export default ownershipCheck;