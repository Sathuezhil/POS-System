const express = require('express');
const { body, validationResult } = require('express-validator');
const database = require('../database/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Generate unique sale number
const generateSaleNumber = async () => {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  
  // Get count of sales today
  const result = await database.get(`
    SELECT COUNT(*) as count 
    FROM sales 
    WHERE DATE(created_at) = DATE('now')
  `);
  
  const sequence = String(result.count + 1).padStart(4, '0');
  return `SALE-${dateStr}-${sequence}`;
};

// Get all sales
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 50, start_date, end_date, user_id } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    let params = [];

    if (start_date) {
      whereClause += ' AND DATE(s.created_at) >= ?';
      params.push(start_date);
    }

    if (end_date) {
      whereClause += ' AND DATE(s.created_at) <= ?';
      params.push(end_date);
    }

    if (user_id) {
      whereClause += ' AND s.user_id = ?';
      params.push(user_id);
    }

    const sales = await database.all(`
      SELECT 
        s.*,
        u.full_name as cashier_name,
        c.name as customer_name
      FROM sales s
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN customers c ON s.customer_id = c.id
      ${whereClause}
      ORDER BY s.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), parseInt(offset)]);

    // Get total count
    const countResult = await database.get(`
      SELECT COUNT(*) as total
      FROM sales s
      ${whereClause}
    `, params);

    res.json({
      sales,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult.total,
        pages: Math.ceil(countResult.total / limit)
      }
    });
  } catch (error) {
    console.error('Get sales error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single sale with items
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const sale = await database.get(`
      SELECT 
        s.*,
        u.full_name as cashier_name,
        c.name as customer_name
      FROM sales s
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN customers c ON s.customer_id = c.id
      WHERE s.id = ?
    `, [req.params.id]);

    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    // Get sale items
    const items = await database.all(`
      SELECT 
        si.*,
        p.name as product_name,
        p.sku,
        p.barcode
      FROM sale_items si
      JOIN products p ON si.product_id = p.id
      WHERE si.sale_id = ?
      ORDER BY si.id
    `, [req.params.id]);

    res.json({ sale, items });
  } catch (error) {
    console.error('Get sale error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new sale
router.post('/', [
  authenticateToken,
  requireRole(['admin', 'cashier']),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.product_id').isInt().withMessage('Product ID must be an integer'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  body('payment_method').isIn(['cash', 'card', 'upi', 'other']).withMessage('Invalid payment method')
], async (req, res) => {
  try {
    console.log('Creating sale with data:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      items,
      customer_id,
      subtotal,
      tax_amount = 0,
      discount_amount = 0,
      total_amount,
      payment_method,
      notes
    } = req.body;

    // Validate all products exist and have sufficient stock
    for (const item of items) {
      const product = await database.get(
        'SELECT id, name, price, stock_quantity FROM products WHERE id = ?',
        [item.product_id]
      );

      if (!product) {
        return res.status(400).json({ error: `Product with ID ${item.product_id} not found` });
      }

      if (product.stock_quantity < item.quantity) {
        return res.status(400).json({ 
          error: `Insufficient stock for ${product.name}. Available: ${product.stock_quantity}, Required: ${item.quantity}` 
        });
      }
    }

    // Generate sale number
    const sale_number = await generateSaleNumber();

    // Start transaction
    console.log('Inserting sale with:', {
      sale_number, customer_id, user_id: req.user.id, subtotal, tax_amount,
      discount_amount, total_amount, payment_method, notes
    });
    
    const saleResult = await database.run(`
      INSERT INTO sales (
        sale_number, customer_id, user_id, subtotal, tax_amount, 
        discount_amount, total_amount, payment_method, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      sale_number, customer_id, req.user.id, subtotal, tax_amount,
      discount_amount, total_amount, payment_method, notes
    ]);

    const saleId = saleResult.id;

    // Insert sale items and update stock
    for (const item of items) {
      const product = await database.get('SELECT price FROM products WHERE id = ?', [item.product_id]);
      
      if (!product) {
        console.error(`Product with ID ${item.product_id} not found in database`);
        throw new Error(`Product with ID ${item.product_id} not found`);
      }
      
      const unit_price = product.price;
      const total_price = unit_price * item.quantity;

      // Insert sale item
      await database.run(`
        INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, total_price)
        VALUES (?, ?, ?, ?, ?)
      `, [saleId, item.product_id, item.quantity, unit_price, total_price]);

      // Update product stock
      await database.run(`
        UPDATE products 
        SET stock_quantity = stock_quantity - ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [item.quantity, item.product_id]);

      // Record inventory movement
      await database.run(`
        INSERT INTO inventory_movements (product_id, movement_type, quantity, reference_type, reference_id)
        VALUES (?, 'out', ?, 'sale', ?)
      `, [item.product_id, item.quantity, saleId]);
    }

    // Get complete sale data
    const sale = await database.get(`
      SELECT 
        s.*,
        u.full_name as cashier_name,
        c.name as customer_name
      FROM sales s
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN customers c ON s.customer_id = c.id
      WHERE s.id = ?
    `, [saleId]);

    const saleItems = await database.all(`
      SELECT 
        si.*,
        p.name as product_name,
        p.sku,
        p.barcode
      FROM sale_items si
      JOIN products p ON si.product_id = p.id
      WHERE si.sale_id = ?
      ORDER BY si.id
    `, [saleId]);

    res.status(201).json({
      message: 'Sale created successfully',
      sale,
      items: saleItems
    });
  } catch (error) {
    console.error('Create sale error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Get sales summary/dashboard data
router.get('/dashboard/summary', authenticateToken, async (req, res) => {
  try {
    const { period = 'today' } = req.query;
    
    let dateFilter = '';
    switch (period) {
      case 'today':
        dateFilter = "DATE(created_at) = DATE('now')";
        break;
      case 'week':
        dateFilter = "DATE(created_at) >= DATE('now', '-7 days')";
        break;
      case 'month':
        dateFilter = "DATE(created_at) >= DATE('now', 'start of month')";
        break;
      case 'year':
        dateFilter = "DATE(created_at) >= DATE('now', 'start of year')";
        break;
      default:
        dateFilter = "DATE(created_at) = DATE('now')";
    }

    // Get sales summary
    const summary = await database.get(`
      SELECT 
        COUNT(*) as total_sales,
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COALESCE(AVG(total_amount), 0) as average_sale,
        COALESCE(SUM(tax_amount), 0) as total_tax,
        COALESCE(SUM(discount_amount), 0) as total_discount
      FROM sales
      WHERE ${dateFilter}
    `);

    // Get top selling products
    const topProducts = await database.all(`
      SELECT 
        p.name,
        p.sku,
        SUM(si.quantity) as total_quantity,
        SUM(si.total_price) as total_revenue
      FROM sale_items si
      JOIN products p ON si.product_id = p.id
      JOIN sales s ON si.sale_id = s.id
      WHERE ${dateFilter}
      GROUP BY p.id, p.name, p.sku
      ORDER BY total_quantity DESC
      LIMIT 10
    `);

    // Get sales by hour (for today only)
    let salesByHour = [];
    if (period === 'today') {
      salesByHour = await database.all(`
        SELECT 
          strftime('%H', created_at) as hour,
          COUNT(*) as sales_count,
          COALESCE(SUM(total_amount), 0) as revenue
        FROM sales
        WHERE ${dateFilter}
        GROUP BY strftime('%H', created_at)
        ORDER BY hour
      `);
    }

    res.json({
      summary,
      top_products: topProducts,
      sales_by_hour: salesByHour
    });
  } catch (error) {
    console.error('Get sales summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Refund sale
router.post('/:id/refund', [
  authenticateToken,
  requireRole(['admin', 'cashier']),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required for refund'),
  body('items.*.item_id').isInt().withMessage('Item ID must be an integer'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const saleId = req.params.id;
    const { items, reason } = req.body;

    // Check if sale exists
    const sale = await database.get('SELECT * FROM sales WHERE id = ?', [saleId]);
    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    // Validate refund items
    for (const item of items) {
      const saleItem = await database.get(
        'SELECT * FROM sale_items WHERE id = ? AND sale_id = ?',
        [item.item_id, saleId]
      );

      if (!saleItem) {
        return res.status(400).json({ error: `Sale item with ID ${item.item_id} not found` });
      }

      if (item.quantity > saleItem.quantity) {
        return res.status(400).json({ 
          error: `Refund quantity (${item.quantity}) cannot exceed original quantity (${saleItem.quantity})` 
        });
      }
    }

    // Process refund
    let totalRefundAmount = 0;

    for (const item of items) {
      const saleItem = await database.get(
        'SELECT * FROM sale_items WHERE id = ? AND sale_id = ?',
        [item.item_id, saleId]
      );

      const refundAmount = (saleItem.unit_price * item.quantity);
      totalRefundAmount += refundAmount;

      // Update sale item quantity
      await database.run(
        'UPDATE sale_items SET quantity = quantity - ? WHERE id = ?',
        [item.quantity, item.item_id]
      );

      // Restore stock
      await database.run(`
        UPDATE products 
        SET stock_quantity = stock_quantity + ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [item.quantity, saleItem.product_id]);

      // Record inventory movement
      await database.run(`
        INSERT INTO inventory_movements (product_id, movement_type, quantity, reference_type, reference_id, notes)
        VALUES (?, 'in', ?, 'refund', ?, ?)
      `, [saleItem.product_id, item.quantity, saleId, reason || 'Refund']);
    }

    // Update sale total
    await database.run(
      'UPDATE sales SET total_amount = total_amount - ? WHERE id = ?',
      [totalRefundAmount, saleId]
    );

    res.json({
      message: 'Refund processed successfully',
      refund_amount: totalRefundAmount
    });
  } catch (error) {
    console.error('Refund sale error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
