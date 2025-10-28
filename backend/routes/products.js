const express = require('express');
const { body, validationResult } = require('express-validator');
const database = require('../database/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all products
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 50, search = '', category = '', in_stock = false } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = '';
    let params = [];
    let conditions = [];

    if (search) {
      conditions.push('p.name LIKE ?');
      const searchTerm = `%${search}%`;
      params.push(searchTerm);
    }

    if (category) {
      conditions.push('c.name = ?');
      params.push(category);
    }

    if (in_stock === 'true') {
      conditions.push('p.stock_quantity > 0');
    }

    if (conditions.length > 0) {
      whereClause = 'WHERE ' + conditions.join(' AND ');
    }

    const products = await database.all(`
      SELECT p.*, c.name as category_name, p.image_url as image_path 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
      ORDER BY p.name
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), parseInt(offset)]);

    // Get total count
    const countResult = await database.get(`
      SELECT COUNT(*) as total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
    `, params);

    res.json({
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult.total,
        pages: Math.ceil(countResult.total / limit)
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single product
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const product = await database.get(`
      SELECT p.*, p.image_url as image_path FROM products p WHERE p.id = ?
    `, [req.params.id]);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ product });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create product
router.post('/', [
  authenticateToken,
  requireRole(['admin']),
  body('name').notEmpty().withMessage('Product name is required'),
  body('price').isDecimal().withMessage('Price must be a valid decimal'),
  body('category_id').optional().isInt().withMessage('Category ID must be an integer'),
  body('sku').optional().isLength({ min: 1 }).withMessage('SKU cannot be empty'),
  body('barcode').optional().isLength({ min: 1 }).withMessage('Barcode cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      description,
      sku,
      barcode,
      category_id,
      category, // Handle category name as well
      price,
      cost_price,
      stock_quantity,
      min_stock_level,
      unit,
      image_url
    } = req.body;

    // If category is provided as name, find or create the category_id
    let finalCategoryId = category_id;
    if (category && !category_id) {
      const categoryRecord = await database.get('SELECT id FROM categories WHERE name = ? AND is_active = 1', [category]);
      if (categoryRecord) {
        finalCategoryId = categoryRecord.id;
      } else {
        // Auto-create category when not found
        const inserted = await database.run(
          'INSERT INTO categories (name, description, is_active) VALUES (?, ?, 1)',
          [category, null]
        );
        finalCategoryId = inserted.id;
      }
    }

    // Check if SKU or barcode already exists
    if (sku) {
      const existingSku = await database.get('SELECT id FROM products WHERE sku = ?', [sku]);
      if (existingSku) {
        return res.status(400).json({ error: 'SKU already exists' });
      }
    }

    if (barcode) {
      const existingBarcode = await database.get('SELECT id FROM products WHERE barcode = ?', [barcode]);
      if (existingBarcode) {
        return res.status(400).json({ error: 'Barcode already exists' });
      }
    }

    const result = await database.run(`
      INSERT INTO products (
        name, price, category_id, stock_quantity, image_url
      ) VALUES (?, ?, ?, ?, ?)
    `, [
      name, price, finalCategoryId || null, stock_quantity || 0, image_url || null
    ]);

    // Get the created product
    const product = await database.get(`
      SELECT p.*, p.image_url as image_path FROM products p WHERE p.id = ?
    `, [result.id]);

    res.status(201).json({ message: 'Product created successfully', product });
  } catch (error) {
    console.error('Create product error:', error);
    console.error('Error details:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Update product
router.put('/:id', [
  authenticateToken,
  requireRole(['admin']),
  body('name').notEmpty().withMessage('Product name is required'),
  body('price').isDecimal().withMessage('Price must be a valid decimal')
], async (req, res) => {
  try {
    console.log('Update product request:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const productId = req.params.id;
    const {
      name,
      description,
      sku,
      barcode,
      category_id,
      category, // Handle category name as well
      price,
      cost_price,
      stock_quantity,
      min_stock_level,
      unit,
      image_url
    } = req.body;

    // If category is provided as name, find or create the category_id
    let finalCategoryId = category_id;
    if (category && !category_id) {
      const categoryRecord = await database.get('SELECT id FROM categories WHERE name = ? AND is_active = 1', [category]);
      if (categoryRecord) {
        finalCategoryId = categoryRecord.id;
      } else {
        const inserted = await database.run(
          'INSERT INTO categories (name, description, is_active) VALUES (?, ?, 1)',
          [category, null]
        );
        finalCategoryId = inserted.id;
      }
    }

    // Check if product exists
    const existingProduct = await database.get('SELECT id FROM products WHERE id = ?', [productId]);
    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // No SKU or barcode validation needed since those columns don't exist

    await database.run(`
      UPDATE products SET
        name = ?, price = ?, category_id = ?, stock_quantity = ?, image_url = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      name, price, finalCategoryId || null, stock_quantity || 0, image_url || null, 
      productId
    ]);

    // Get updated product
    const product = await database.get(`
      SELECT p.*, p.image_url as image_path FROM products p WHERE p.id = ?
    `, [productId]);

    res.json({ message: 'Product updated successfully', product });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete product (soft delete)
router.delete('/:id', [
  authenticateToken,
  requireRole(['admin'])
], async (req, res) => {
  try {
    const productId = req.params.id;

    // Check if product exists
    const existingProduct = await database.get('SELECT id FROM products WHERE id = ?', [productId]);
    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Hard delete (since no is_active column exists)
    await database.run('DELETE FROM products WHERE id = ?', [productId]);

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update stock quantity
router.patch('/:id/stock', [
  authenticateToken,
  requireRole(['admin']),
  body('quantity').isInt().withMessage('Quantity must be an integer'),
  body('movement_type').isIn(['in', 'out', 'adjustment']).withMessage('Invalid movement type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const productId = req.params.id;
    const { quantity, movement_type, notes } = req.body;

    // Get current stock
    const product = await database.get('SELECT stock_quantity FROM products WHERE id = ?', [productId]);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    let newQuantity = product.stock_quantity;
    if (movement_type === 'in') {
      newQuantity += quantity;
    } else if (movement_type === 'out') {
      newQuantity -= quantity;
    } else if (movement_type === 'adjustment') {
      newQuantity = quantity;
    }

    if (newQuantity < 0) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    // Update stock
    await database.run('UPDATE products SET stock_quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [newQuantity, productId]);

    // Record inventory movement
    await database.run(`
      INSERT INTO inventory_movements (product_id, movement_type, quantity, reference_type, notes)
      VALUES (?, ?, ?, 'adjustment', ?)
    `, [productId, movement_type, quantity, notes]);

    res.json({ 
      message: 'Stock updated successfully',
      new_quantity: newQuantity
    });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
