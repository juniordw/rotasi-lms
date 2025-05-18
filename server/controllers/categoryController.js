import { Category, Course } from '../models/index.js';
import { validateCategory } from '../utils/validators.js';

/**
 * @desc    Create a new category
 * @route   POST /api/categories
 * @access  Private (Admin only)
 */
export const createCategory = async (req, res) => {
  try {
    // Validate input
    const { error } = validateCategory(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { name, description, parent_category_id } = req.body;

    // Check if category with same name already exists
    const existingCategory = await Category.findOne({
      where: { name }
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Kategori dengan nama yang sama sudah ada'
      });
    }

    // Create category
    const category = await Category.create({
      name,
      description,
      parent_category_id
    });

    res.status(201).json({
      success: true,
      message: 'Kategori berhasil dibuat',
      data: category
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get all categories
 * @route   GET /api/categories
 * @access  Public
 */
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get all categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get category by ID
 * @route   GET /api/categories/:id
 * @access  Public
 */
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Kategori tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Get category by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Update category
 * @route   PUT /api/categories/:id
 * @access  Private (Admin only)
 */
export const updateCategory = async (req, res) => {
  try {
    // Validate input
    const { error } = validateCategory(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { name, description, parent_category_id } = req.body;

    // Check if category exists
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Kategori tidak ditemukan'
      });
    }

    // Check if name will be changed and if new name already exists
    if (name !== category.name) {
      const existingCategory = await Category.findOne({
        where: { name }
      });

      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Kategori dengan nama yang sama sudah ada'
        });
      }
    }

    // Update category
    await category.update({
      name,
      description,
      parent_category_id
    });

    res.json({
      success: true,
      message: 'Kategori berhasil diupdate',
      data: category
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Delete category
 * @route   DELETE /api/categories/:id
 * @access  Private (Admin only)
 */
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Kategori tidak ditemukan'
      });
    }

    // Check if category is used in any course
    const courseCount = await Course.count({
      where: { category_id: req.params.id }
    });

    if (courseCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Kategori tidak dapat dihapus karena sedang digunakan dalam kursus'
      });
    }

    // Check if category has children
    const childrenCount = await Category.count({
      where: { parent_category_id: req.params.id }
    });

    if (childrenCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Kategori tidak dapat dihapus karena memiliki sub-kategori'
      });
    }

    // Delete category
    await category.destroy();

    res.json({
      success: true,
      message: 'Kategori berhasil dihapus'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};