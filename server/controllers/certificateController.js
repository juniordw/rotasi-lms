import { Certificate, User, Course, Enrollment, Notification } from '../models/index.js';
import path from 'path';
import fs from 'fs';
import PDFDocument from 'pdfkit';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



/**
 * @desc    Dapatkan semua sertifikat user
 * @route   GET /api/certificates
 * @access  Private
 */
export const getUserCertificates = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Dapatkan semua sertifikat user
    const certificates = await Certificate.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'thumbnail_url'],
          include: [
            {
              model: User,
              as: 'instructor',
              attributes: ['id', 'full_name']
            }
          ]
        }
      ],
      order: [['issue_date', 'DESC']]
    });
    
    res.json({
      success: true,
      data: certificates
    });
  } catch (error) {
    console.error('Get user certificates error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Dapatkan sertifikat berdasarkan ID
 * @route   GET /api/certificates/:id
 * @access  Private
 */
export const getCertificateById = async (req, res) => {
  try {
    const certificateId = req.params.id;
    
    // Dapatkan sertifikat
    const certificate = await Certificate.findByPk(certificateId, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'full_name', 'email']
        },
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title'],
          include: [
            {
              model: User,
              as: 'instructor',
              attributes: ['id', 'full_name']
            }
          ]
        }
      ]
    });
    
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Sertifikat tidak ditemukan'
      });
    }
    
    // Cek akses: hanya user yang memiliki sertifikat, instructor kursus, atau admin yang bisa melihat
    if (
      certificate.user_id !== req.user.id && 
      certificate.course.instructor_id !== req.user.id && 
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak'
      });
    }
    
    res.json({
      success: true,
      data: certificate
    });
  } catch (error) {
    console.error('Get certificate by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Generate sertifikat untuk user
 * @route   POST /api/certificates/generate
 * @access  Private (Admin, Instructor)
 */
export const generateCertificate = async (req, res) => {
    try {
      const { user_id, course_id } = req.body;
      
      if (!user_id || !course_id) {
        return res.status(400).json({
          success: false,
          message: 'User ID dan Course ID wajib diisi'
        });
      }
      
      // Cek apakah user ada
      const user = await User.findByPk(user_id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User tidak ditemukan'
        });
      }
      
      // Cek apakah kursus ada
      const course = await Course.findByPk(course_id);
      
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Kursus tidak ditemukan'
        });
      }
      
      // Cek apakah user adalah instructor kursus atau admin
      if (course.instructor_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Akses ditolak. Anda bukan instructor kursus ini'
        });
      }
      
      // Cek apakah user telah menyelesaikan kursus
      const enrollment = await Enrollment.findOne({
        where: {
          user_id,
          course_id,
          completion_status: 'completed'
        }
      });
      
      if (!enrollment && req.user.role !== 'admin') {
        return res.status(400).json({
          success: false,
          message: 'User belum menyelesaikan kursus ini'
        });
      }
      
      // Cek apakah sertifikat sudah ada
      const existingCertificate = await Certificate.findOne({
        where: {
          user_id,
          course_id
        }
      });
      
      if (existingCertificate) {
        return res.status(400).json({
          success: false,
          message: 'Sertifikat untuk user dan kursus ini sudah ada',
          data: existingCertificate
        });
      }
      
      // Generate sertifikat
      const certificateUrl = await generateCertificatePdf(user, course);
      
      // Simpan sertifikat ke database
      const certificate = await Certificate.create({
        user_id,
        course_id,
        issue_date: new Date(),
        expiration_date: null, // Tidak ada tanggal kedaluwarsa
        certificate_url: certificateUrl
      });
      
      // Tambahkan notifikasi untuk user
      await Notification.create({
        user_id,
        type: 'certificate',
        message: `Selamat! Anda telah mendapatkan sertifikat untuk kursus "${course.title}"`,
        is_read: false,
        created_at: new Date()
      });
      
      res.status(201).json({
        success: true,
        message: 'Sertifikat berhasil digenerate',
        data: certificate
      });
    } catch (error) {
      console.error('Generate certificate error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
  
  /**
   * @desc    Download sertifikat
   * @route   GET /api/certificates/:id/download
   * @access  Private
   */
  export const downloadCertificate = async (req, res) => {
    try {
      const certificateId = req.params.id;
      
      // Dapatkan sertifikat
      const certificate = await Certificate.findByPk(certificateId, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'full_name']
          },
          {
            model: Course,
            as: 'course',
            attributes: ['id', 'title']
          }
        ]
      });
      
      if (!certificate) {
        return res.status(404).json({
          success: false,
          message: 'Sertifikat tidak ditemukan'
        });
      }
      
      // Cek akses: hanya user yang memiliki sertifikat, instructor kursus, atau admin yang bisa download
      if (
        certificate.user_id !== req.user.id && 
        certificate.course.instructor_id !== req.user.id && 
        req.user.role !== 'admin'
      ) {
        return res.status(403).json({
          success: false,
          message: 'Akses ditolak'
        });
      }
      
      // Cek apakah file sertifikat ada
      let certificatePath = path.join(__dirname, '..', 'public', certificate.certificate_url);
      
      if (!fs.existsSync(certificatePath)) {
        // Jika file tidak ada, generate ulang
        const newCertificateUrl = await generateCertificatePdf(certificate.user, certificate.course);
      
        // Update URL sertifikat
        await certificate.update({
          certificate_url: newCertificateUrl
        });
      
        // Update certificatePath
        certificatePath = path.join(__dirname, '..', 'public', newCertificateUrl);
      }
      
      // Download file
      const fileName = `Sertifikat_${certificate.course.title}_${certificate.user.full_name}.pdf`;
      
      res.download(certificatePath, fileName, (err) => {
        if (err) {
          console.error('Download certificate error:', err);
          return res.status(500).json({
            success: false,
            message: 'Error saat download sertifikat'
          });
        }
      });
    } catch (error) {
      console.error('Download certificate error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
  
  /**
   * @desc    Verifikasi sertifikat
   * @route   POST /api/certificates/verify
   * @access  Public
   */
  export const verifyCertificate = async (req, res) => {
    try {
      const { certificate_id } = req.body;
      
      if (!certificate_id) {
        return res.status(400).json({
          success: false,
          message: 'ID Sertifikat wajib diisi'
        });
      }
      
      // Dapatkan sertifikat
      const certificate = await Certificate.findByPk(certificate_id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'full_name']
          },
          {
            model: Course,
            as: 'course',
            attributes: ['id', 'title']
          }
        ]
      });
      
      if (!certificate) {
        return res.status(404).json({
          success: false,
          message: 'Sertifikat tidak valid atau tidak ditemukan'
        });
      }
      
      res.json({
        success: true,
        message: 'Sertifikat valid',
        data: {
          certificateId: certificate.id,
          userName: certificate.user.full_name,
          courseTitle: certificate.course.title,
          issueDate: certificate.issue_date,
          expirationDate: certificate.expiration_date
        }
      });
    } catch (error) {
      console.error('Verify certificate error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
  
  /**
   * Helper function to generate certificate PDF
   * @param {Object} user - User data
   * @param {Object} course - Course data
   * @returns {String} Certificate URL
   */
  async function generateCertificatePdf(user, course) {
    return new Promise((resolve, reject) => {
      try {
        // Create directory if not exists
        const certDir = path.join(__dirname, '..', 'public', 'uploads', 'certificates');
        if (!fs.existsSync(certDir)) {
          fs.mkdirSync(certDir, { recursive: true });
        }
        
        // Create certificate filename
        const timestamp = Date.now();
        const fileName = `certificate_${user.id}_${course.id}_${timestamp}.pdf`;
        const filePath = path.join(certDir, fileName);
        
        // Create a new PDF
        const doc = new PDFDocument({
          layout: 'landscape',
          size: 'A4',
          margin: 50
        });
        
        // Pipe PDF to file
        doc.pipe(fs.createWriteStream(filePath));
        
        // Add content to PDF
        // Set background color
        doc.rect(0, 0, doc.page.width, doc.page.height).fill('#f6f6f6');
        
        // Add border
        doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
           .lineWidth(3)
           .stroke('#0077B6');
        
        // Add logo
        // doc.image(path.join(__dirname, '..', 'public', 'assets', 'logo.png'), doc.page.width / 2 - 50, 60, {
        //   width: 100
        // });
        
        // Add certificate title
        doc.font('Helvetica-Bold')
           .fontSize(30)
           .fillColor('#0077B6')
           .text('SERTIFIKAT', doc.page.width / 2, 150, {
             align: 'center'
           });
        
        // Add course completion text
        doc.font('Helvetica')
           .fontSize(16)
           .fillColor('#333333')
           .text('Diberikan kepada:', doc.page.width / 2, 200, {
             align: 'center'
           });
        
        // Add user name
        doc.font('Helvetica-Bold')
           .fontSize(24)
           .fillColor('#0077B6')
           .text(user.full_name, doc.page.width / 2, 240, {
             align: 'center'
           });
        
        // Add completion text
        doc.font('Helvetica')
           .fontSize(16)
           .fillColor('#333333')
           .text('atas keberhasilannya menyelesaikan kursus:', doc.page.width / 2, 290, {
             align: 'center'
           });
        
        // Add course title
        doc.font('Helvetica-Bold')
           .fontSize(20)
           .fillColor('#0077B6')
           .text(course.title, doc.page.width / 2, 330, {
             align: 'center'
           });
        
        // Add issue date
        const issueDate = new Date();
        doc.font('Helvetica')
           .fontSize(14)
           .fillColor('#555555')
           .text(`Diterbitkan pada: ${issueDate.toLocaleDateString('id-ID', {
             day: 'numeric',
             month: 'long',
             year: 'numeric'
           })}`, doc.page.width / 2, 380, {
             align: 'center'
           });
        
        // Add verification text
        doc.fontSize(12)
           .fillColor('#777777')
           .text(`Nomor Sertifikat: ${user.id}-${course.id}-${timestamp}`, doc.page.width / 2, 420, {
             align: 'center'
           });
        
        // Add signature line
        doc.moveTo(doc.page.width / 2 - 100, 480)
           .lineTo(doc.page.width / 2 + 100, 480)
           .stroke('#0077B6');
        
        // Add signature text
        doc.font('Helvetica')
           .fontSize(14)
           .fillColor('#333333')
           .text('Instruktur Kursus', doc.page.width / 2, 490, {
             align: 'center'
           });
        
        // Finalize PDF
        doc.end();
        
        // Return certificate URL
        const certificateUrl = `/uploads/certificates/${fileName}`;
        resolve(certificateUrl);
      } catch (error) {
        reject(error);
      }
    });
  }