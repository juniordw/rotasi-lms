/**
 * Middleware untuk mengecek kepemilikan resource
 * Digunakan untuk memastikan user hanya bisa mengakses/mengubah
 * resource yang mereka miliki
 * 
 * @param {Object} model - Sequelize model
 * @param {string} paramId - Nama parameter ID di URL
 * @param {string} userIdField - Nama field user ID di model
 * @returns {Function} Express middleware function
 */
module.exports = (model, paramId = 'id', userIdField = 'user_id') => {
    return async (req, res, next) => {
      try {
        // Pastikan middleware auth sudah berjalan terlebih dahulu
        if (!req.user) {
          return res.status(401).json({ 
            success: false, 
            message: 'Akses ditolak. Belum terautentikasi' 
          });
        }
  
        // Admin selalu memiliki akses
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
  
        // Cari resource berdasarkan ID
        const resource = await model.findByPk(resourceId);
        
        if (!resource) {
          return res.status(404).json({ 
            success: false, 
            message: 'Resource tidak ditemukan' 
          });
        }
  
        // Cek apakah user adalah pemilik resource
        if (resource[userIdField] !== req.user.id) {
          return res.status(403).json({ 
            success: false, 
            message: 'Akses ditolak. Anda bukan pemilik resource ini' 
          });
        }
  
        // Tambahkan resource ke request untuk digunakan di controller
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