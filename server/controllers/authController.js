import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, RefreshToken, Enrollment, Notification, Course } from '../models/index.js';
import { Op } from 'sequelize';
import { validateRegistration, validateLogin } from '../utils/validators.js';
import crypto from 'crypto';

/**
 * @desc    Register user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res) => {
  try {
    // Validasi input menggunakan Joi
    const { error } = validateRegistration(req.body);
    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: error.details[0].message 
      });
    }

    // Ekstrak data dari body request
    const { username, email, password, full_name, department } = req.body;

    // Cek apakah email atau username sudah terdaftar
    // Menggunakan Sequelize Op.or untuk mencari email ATAU username yang sama
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { username }]
      }
    });

    // Jika user sudah ada, kirim response error
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'Email atau username sudah terdaftar' 
      });
    }

    // Generate salt untuk hash password
    const salt = await bcrypt.genSalt(10);
    // Hash password dengan salt
    const hashedPassword = await bcrypt.hash(password, salt);

    // Buat user baru dengan role default 'student'
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      full_name,
      department,
      role: 'student', // Default role
      created_at: new Date(),
      updated_at: new Date()
    });

    // Generate access token JWT
    const accessToken = jwt.sign(
      { 
        id: user.id, 
        role: user.role,
        username: user.username 
      },
      process.env.JWT_SECRET,
      { expiresIn: '15m' } // Access token berlaku 15 menit
    );

    // Generate refresh token
    const refreshToken = await generateRefreshToken(user.id);

    // Kirim response sukses dengan data user (tanpa password) dan token
    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        department: user.department
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res) => {
  try {
    // Validasi input menggunakan Joi
    const { error } = validateLogin(req.body);
    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: error.details[0].message 
      });
    }

    const { email, password } = req.body;

    // Cari user berdasarkan email
    const user = await User.findOne({ 
      where: { email },
      attributes: ['id', 'username', 'email', 'password', 'full_name', 'role', 'department']
    });
    
    // Jika user tidak ditemukan, kirim response error
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email atau password salah' 
      });
    }

    // Verifikasi password menggunakan bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email atau password salah' 
      });
    }

    // Generate access token JWT
    const accessToken = jwt.sign(
      { 
        id: user.id, 
        role: user.role,
        username: user.username
      },
      process.env.JWT_SECRET,
      { expiresIn: '15m' } // Access token berlaku 15 menit
    );

    // Generate refresh token
    const refreshToken = await generateRefreshToken(user.id);

    // Update last login timestamp
    await User.update(
      { last_login: new Date() },
      { where: { id: user.id } }
    );

    // Kirim response sukses dengan data user (tanpa password) dan token
    res.json({
      success: true,
      message: 'Login berhasil',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        department: user.department
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get current user info
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getCurrentUser = async (req, res) => {
  try {
    // Cari user berdasarkan id (dari token)
    // Exclude password dari hasil query
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User tidak ditemukan' 
      });
    }

// In authController.js, in the getCurrentUser function
const enrolledCourses = await Enrollment.findAll({
  where: { user_id: req.user.id },
  include: [
    {
      model: Course,
      as: 'course',  // Make sure this alias is specified
      attributes: ['id', 'title', 'description', 'thumbnail_url']
    }
  ]
});

    const notifications = await Notification.findAll({
      where: { 
        user_id: req.user.id,
        is_read: false
      },
      order: [['created_at', 'DESC']],
      limit: 10
    });

    res.json({
      success: true,
      user,
      enrolledCourses,
      notifications
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Fungsi helper untuk generate refresh token
 * @param {number} userId - ID user
 * @returns {string} Refresh token
 */
const generateRefreshToken = async (userId) => {
  // Generate random token dengan crypto
  const token = crypto.randomBytes(40).toString('hex');
  
  // Set tanggal expired (30 hari dari sekarang)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);
  
  // Hapus refresh token lama untuk user ini (opsional)
  await RefreshToken.destroy({ where: { user_id: userId } });
  
  // Simpan token baru ke database
  await RefreshToken.create({
    token,
    user_id: userId,
    expires_at: expiresAt,
    created_at: new Date()
  });
  
  return token;
};

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh-token
 * @access  Public (with refresh token)
 */
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ 
        success: false, 
        message: 'Refresh token diperlukan' 
      });
    }
    
    // Cari token di database dan pastikan belum expired
    const tokenDoc = await RefreshToken.findOne({ 
      where: { 
        token: refreshToken,
        expires_at: { [Op.gt]: new Date() } // Token belum expired
      }
    });
    
    if (!tokenDoc) {
      return res.status(401).json({ 
        success: false, 
        message: 'Refresh token tidak valid atau kedaluwarsa' 
      });
    }
    
    // Ambil data user
    const user = await User.findByPk(tokenDoc.user_id, {
      attributes: ['id', 'username', 'email', 'full_name', 'role', 'department']
    });
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User tidak ditemukan' 
      });
    }
    
    // Generate access token baru
    const accessToken = jwt.sign(
      { 
        id: user.id, 
        role: user.role,
        username: user.username
      },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    
    res.json({ 
      success: true, 
      accessToken 
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (refreshToken) {
      // Hapus refresh token dari database
      await RefreshToken.destroy({ where: { token: refreshToken } });
    }
    
    res.json({ 
      success: true, 
      message: 'Berhasil logout' 
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Validasi input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password lama dan baru diperlukan'
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password baru minimal 6 karakter'
      });
    }
    
    // Cari user berdasarkan id (dari token)
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }
    
    // Verifikasi password lama
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Password lama tidak sesuai'
      });
    }
    
    // Hash password baru
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password
    await User.update(
      { 
        password: hashedPassword,
        updated_at: new Date()
      },
      { where: { id: req.user.id } }
    );
    
    // Hapus semua refresh token yang ada (force login ulang)
    await RefreshToken.destroy({ where: { user_id: req.user.id } });
    
    res.json({
      success: true,
      message: 'Password berhasil diubah, silakan login kembali'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};