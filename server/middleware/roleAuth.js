/**
 * Middleware untuk mengecek role/peran user
 * Digunakan untuk membatasi akses berdasarkan peran user
 * 
 * @param {...string} roles - Daftar role yang diizinkan
 * @returns {Function} Express middleware function
 */
module.exports = (...roles) => {
    return (req, res, next) => {
      // Pastikan middleware auth sudah berjalan terlebih dahulu
      // dan req.user sudah ada
      if (!req.user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Akses ditolak. Belum terautentikasi' 
        });
      }
  
      // Cek apakah role user ada dalam daftar roles yang diizinkan
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ 
          success: false, 
          message: 'Akses ditolak. Anda tidak memiliki izin yang cukup',
          requiredRoles: roles,
          yourRole: req.user.role
        });
      }
  
      // User memiliki role yang sesuai, lanjutkan ke handler berikutnya
      next();
    };
  };