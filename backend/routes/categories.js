const express = require('express');
const { body, validationResult } = require('express-validator');
const database = require('../database/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all categories
router.get('/', authenticateToken, async (req, res) => {
  try {
    const categories = await database.all(`
      SELECT 
        c.*,
        COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.is_active = 1
      WHERE c.is_active = 1
      GROUP BY c.id
      ORDER BY c.name
    `);

    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single category
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const category = await database.get(`
      SELECT 
        c.*,
        COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.is_active = 1
      WHERE c.id = ? AND c.is_active = 1
      GROUP BY c.id
    `, [req.params.id]);

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ category });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create category
router.post('/', [
  authenticateToken,
  requireRole(['admin']),
  body('name').notEmpty().withMessage('Category name is required'),
  body('name').isLength({ min: 2, max: 100 }).withMessage('Category name must be between 2 and 100 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description } = req.body;

    // Check if category name already exists
    const existingCategory = await database.get(
      'SELECT id FROM categories WHERE name = ? AND is_active = 1',
      [name]
    );

    if (existingCategory) {
      return res.status(400).json({ error: 'Category name already exists' });
    }

    const result = await database.run(
      'INSERT INTO categories (name, description) VALUES (?, ?)',
      [name, description]
    );

    const category = await database.get('SELECT * FROM categories WHERE id = ?', [result.id]);

    res.status(201).json({ message: 'Category created successfully', category });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update category
router.put('/:id', [
  authenticateToken,
  requireRole(['admin']),
  body('name').notEmpty().withMessage('Category name is required'),
  body('name').isLength({ min: 2, max: 100 }).withMessage('Category name must be between 2 and 100 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const categoryId = req.params.id;
    const { name, description } = req.body;

    // Check if category exists
    const existingCategory = await database.get('SELECT id FROM categories WHERE id = ? AND is_active = 1', [categoryId]);
    if (!existingCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Check if new name already exists (excluding current category)
    const duplicateCategory = await database.get(
      'SELECT id FROM categories WHERE name = ? AND id != ? AND is_active = 1',
      [name, categoryId]
    );

    if (duplicateCategory) {
      return res.status(400).json({ error: 'Category name already exists' });
    }

    await database.run(
      'UPDATE categories SET name = ?, description = ? WHERE id = ?',
      [name, description, categoryId]
    );

    const category = await database.get('SELECT * FROM categories WHERE id = ?', [categoryId]);

    res.json({ message: 'Category updated successfully', category });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete category (soft delete)
router.delete('/:id', [
  authenticateToken,
  requireRole(['admin'])
], async (req, res) => {
  try {
    const categoryId = req.params.id;

    // Check if category exists
    const existingCategory = await database.get('SELECT id FROM categories WHERE id = ? AND is_active = 1', [categoryId]);
    if (!existingCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Check if category has products
    const productCount = await database.get(
      'SELECT COUNT(*) as count FROM products WHERE category_id = ? AND is_active = 1',
      [categoryId]
    );

    if (productCount.count > 0) {
      return res.status(400).json({ 
        error: `Cannot delete category. It has ${productCount.count} active products. Please move or delete the products first.` 
      });
    }

    // Soft delete
    await database.run('UPDATE categories SET is_active = 0 WHERE id = ?', [categoryId]);

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
