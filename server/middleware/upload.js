import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';

// __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Configure file upload storage using multer
 */
const storage = multer.diskStorage({
  // Determine storage directory
  destination: function(req, file, cb) {
    // Set folder based on file type
    let uploadPath = path.join(__dirname, '..', 'uploads', '');
    
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
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  
  // Generate unique filename
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
 * Filter to limit file types
 */
const fileFilter = (req, file, cb) => {
  // Determine allowed file types based on fieldname
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
  
  // Validate file type
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipe file tidak diizinkan. Tipe yang diizinkan: ${allowedTypes.join(', ')}`), false);
  }
};

/**
 * Configure multer
 */
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

/**
 * Middleware to handle multer errors
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

// Export middleware and handler
export { upload, handleUploadError };