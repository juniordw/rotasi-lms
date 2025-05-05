const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

/**
 * Konfigurasi penyimpanan file upload menggunakan multer
 */
const storage = multer.diskStorage({
  // Tentukan direktori penyimpanan file
  destination: function(req, file, cb) {
    // Tentukan folder berdasarkan jenis file
    let uploadPath = 'uploads/';
    
    switch (file.fieldname) {
      case 'avatar':
        uploadPath += 'avatars/';
        break;
      case 'course_thumbnail':
        uploadPath += 'courses/thumbnails/';
        break;
      case 'lesson_content':
        uploadPath += 'lessons/';
        break;
      case 'certificate_template':
        uploadPath += 'certificates/templates/';
        break;
      default:
        uploadPath += 'misc/';
    }
    
    // Buat direktori jika belum ada
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  
  // Generate nama file yang unik
  filename: function(req, file, cb) {
    // Format: fieldname-uuid-timestamp.extension
    const uniqueId = uuidv4();
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    const filename = `${file.fieldname}-${uniqueId}-${timestamp}${extension}`;
    
    cb(null, filename);
  }
});

/**
 * Filter untuk membatasi jenis file yang dapat diupload
 */
const fileFilter = (req, file, cb) => {
  // Tentukan tipe file yang diizinkan berdasarkan fieldname
  let allowedTypes = [];
  
  switch (file.fieldname) {
    case 'avatar':
      allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      break;
    case 'course_thumbnail':
      allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      break;
    case 'lesson_content':
      allowedTypes = [
        'image/jpeg', 'image/png', 'image/webp', 
        'application/pdf', 
        'video/mp4', 
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      break;
    case 'certificate_template':
      allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      break;
    default:
      allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  }
  
  // Validasi tipe file
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipe file tidak diizinkan. Tipe yang diizinkan: ${allowedTypes.join(', ')}`), false);
  }
};

/**
 * Konfigurasi multer
 */
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

/**
 * Middleware untuk handle error multer
 */
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Ukuran file terlalu besar (maksimal 10MB)'
      });
    }
    return res.status(400).json({
      success: false,
      message: `Error upload: ${err.message}`
    });
  }
  
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  next();
};

// Export middleware dan handler
module.exports = {
  upload,
  handleUploadError
};