import express from 'express';
const router = express.Router();
import * as categoryController from '../controllers/categoryController.js';
import auth from '../middleware/auth.js';
import roleAuth from '../middleware/roleAuth.js';

/**
 * @route   GET /api/categories
 * @desc    Get all categories
 * @access  Public
 */
router.get('/', categoryController.getAllCategories);

/**
 * @route   GET /api/categories/:id
 * @desc    Get category by ID
 * @access  Public
 */
router.get('/:id', categoryController.getCategoryById);

/**
 * @route   POST /api/categories
 * @desc    Create a new category
 * @access  Private (Admin only)
 */
router.post('/', auth, roleAuth('admin'), categoryController.createCategory);

/**
 * @route   PUT /api/categories/:id
 * @desc    Update category
 * @access  Private (Admin only)
 */
router.put('/:id', auth, roleAuth('admin'), categoryController.updateCategory);

/**
 * @route   DELETE /api/categories/:id
 * @desc    Delete category
 * @access  Private (Admin only)
 */
router.delete('/:id', auth, roleAuth('admin'), categoryController.deleteCategory);

export default router;