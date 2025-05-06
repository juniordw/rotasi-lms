import { Discussion, Comment, User, Course, Lesson } from '../models/index.js';
import { Op } from 'sequelize';
import { validateDiscussion, validateComment } from '../utils/validators.js';

/**
 * @desc    Dapatkan semua diskusi dalam kursus
 * @route   GET /api/discussions/course/:courseId
 * @access  Private (Enrolled User, Instructor, Admin)
 */
export const getCourseDiscussions = async (req, res) => {
  try {
    res.status(501).json({
      success: false,
      message: "Fitur ini belum diimplementasikan",
    });
  } catch (error) {
    console.error("Get course discussions error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc    Dapatkan semua diskusi dalam lesson
 * @route   GET /api/discussions/lesson/:lessonId
 * @access  Private (Enrolled User, Instructor, Admin)
 */
export const getLessonDiscussions = async (req, res) => {
  try {
    res.status(501).json({
      success: false,
      message: "Fitur ini belum diimplementasikan",
    });
  } catch (error) {
    console.error("Get lesson discussions error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc    Dapatkan detail diskusi dengan komentar
 * @route   GET /api/discussions/:id
 * @access  Private (Enrolled User, Instructor, Admin)
 */
export const getDiscussionById = async (req, res) => {
  try {
    res.status(501).json({
      success: false,
      message: "Fitur ini belum diimplementasikan",
    });
  } catch (error) {
    console.error("Get discussion by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc    Buat diskusi baru
 * @route   POST /api/discussions
 * @access  Private (Enrolled User, Instructor, Admin)
 */
export const createDiscussion = async (req, res) => {
  try {
    res.status(501).json({
      success: false,
      message: "Fitur ini belum diimplementasikan",
    });
  } catch (error) {
    console.error("Create discussion error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc    Tambah komentar ke diskusi
 * @route   POST /api/discussions/:id/comments
 * @access  Private (Enrolled User, Instructor, Admin)
 */
export const addComment = async (req, res) => {
  try {
    res.status(501).json({
      success: false,
      message: "Fitur ini belum diimplementasikan",
    });
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
