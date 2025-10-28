const express = require('express');
const { body, validationResult } = require('express-validator');
const database = require('../database/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all customers
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 50, search = '' } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    let params = [];

    if (search) {
      whereClause += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    const customers = await database.all(`
      SELECT 
        c.*,
        COUNT(s.id) as total_purchases,
        COALESCE(SUM(s.total_amount), 0) as total_spent
      FROM customers c
      LEFT JOIN sales s ON c.id = s.customer_id
      ${whereClause}
      GROUP BY c.id
      ORDER BY c.name
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), parseInt(offset)]);

    // Get total count
    const countResult = await database.get(`
      SELECT COUNT(*) as total
      FROM customers c
      ${whereClause}
    `, params);

    res.json({
      customers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult.total,
        pages: Math.ceil(countResult.total / limit)
      }
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single customer
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const customer = await database.get(`
      SELECT 
        c.*,
        COUNT(s.id) as total_purchases,
        COALESCE(SUM(s.total_amount), 0) as total_spent
      FROM customers c
      LEFT JOIN sales s ON c.id = s.customer_id
      WHERE c.id = ?
      GROUP BY c.id
    `, [req.params.id]);

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Get recent purchases
    const recentPurchases = await database.all(`
      SELECT 
        s.id,
        s.sale_number,
        s.total_amount,
        s.created_at,
        u.full_name as cashier_name
      FROM sales s
      LEFT JOIN users u ON s.user_id = u.id
      WHERE s.customer_id = ?
      ORDER BY s.created_at DESC
      LIMIT 10
    `, [req.params.id]);

    res.json({ 
      customer,
      recent_purchases: recentPurchases
    });
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create customer
router.post('/', [
  authenticateToken,
  requireRole(['admin', 'cashier']),
  body('name').notEmpty().withMessage('Customer name is required'),
  body('email').optional().isEmail().withMessage('Invalid email format'),
  body('phone').optional().isLength({ min: 10, max: 20 }).withMessage('Phone number must be between 10 and 20 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phone, address } = req.body;

    // Check if email already exists
    if (email) {
      const existingCustomer = await database.get(
        'SELECT id FROM customers WHERE email = ?',
        [email]
      );

      if (existingCustomer) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    }

    const result = await database.run(
      'INSERT INTO customers (name, email, phone, address) VALUES (?, ?, ?, ?)',
      [name, email, phone, address]
    );

    const customer = await database.get('SELECT * FROM customers WHERE id = ?', [result.id]);

    res.status(201).json({ message: 'Customer created successfully', customer });
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update customer
router.put('/:id', [
  authenticateToken,
  requireRole(['admin', 'cashier']),
  body('name').notEmpty().withMessage('Customer name is required'),
  body('email').optional().isEmail().withMessage('Invalid email format'),
  body('phone').optional().isLength({ min: 10, max: 20 }).withMessage('Phone number must be between 10 and 20 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const customerId = req.params.id;
    const { name, email, phone, address, loyalty_points } = req.body;

    // Check if customer exists
    const existingCustomer = await database.get('SELECT id FROM customers WHERE id = ?', [customerId]);
    if (!existingCustomer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Check if email already exists (excluding current customer)
    if (email) {
      const duplicateCustomer = await database.get(
        'SELECT id FROM customers WHERE email = ? AND id != ?',
        [email, customerId]
      );

      if (duplicateCustomer) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    }

    await database.run(
      'UPDATE customers SET name = ?, email = ?, phone = ?, address = ?, loyalty_points = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, email, phone, address, loyalty_points, customerId]
    );

    const customer = await database.get('SELECT * FROM customers WHERE id = ?', [customerId]);

    res.json({ message: 'Customer updated successfully', customer });
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete customer
router.delete('/:id', [
  authenticateToken,
  requireRole(['admin'])
], async (req, res) => {
  try {
    const customerId = req.params.id;

    // Check if customer exists
    const existingCustomer = await database.get('SELECT id FROM customers WHERE id = ?', [customerId]);
    if (!existingCustomer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Check if customer has sales
    const salesCount = await database.get(
      'SELECT COUNT(*) as count FROM sales WHERE customer_id = ?',
      [customerId]
    );

    if (salesCount.count > 0) {
      return res.status(400).json({ 
        error: `Cannot delete customer. They have ${salesCount.count} sales records.` 
      });
    }

    await database.run('DELETE FROM customers WHERE id = ?', [customerId]);

    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search customers (for POS)
router.get('/search/quick', authenticateToken, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({ customers: [] });
    }

    const customers = await database.all(`
      SELECT id, name, email, phone, loyalty_points
      FROM customers
      WHERE name LIKE ? OR email LIKE ? OR phone LIKE ?
      ORDER BY name
      LIMIT 10
    `, [`%${q}%`, `%${q}%`, `%${q}%`]);

    res.json({ customers });
  } catch (error) {
    console.error('Search customers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
