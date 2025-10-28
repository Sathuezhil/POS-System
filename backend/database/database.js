const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const config = require('../config');

class Database {
  constructor() {
    this.db = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(config.DB_PATH, (err) => {
        if (err) {
          console.error('Error opening database:', err.message);
          reject(err);
        } else {
          console.log('Connected to SQLite database at:', config.DB_PATH);
          // Enable foreign keys
          this.db.run('PRAGMA foreign_keys = ON', (err) => {
            if (err) {
              console.error('Error enabling foreign keys:', err.message);
              reject(err);
            } else {
              this.initializeTables().then(resolve).catch(reject);
            }
          });
        }
      });
    });
  }

  async initializeTables() {
    // Check if old sales table exists with old schema
    const oldSalesTable = await this.get(`
      SELECT sql FROM sqlite_master 
      WHERE type='table' AND name='sales' AND sql LIKE '%cashier_id%'
    `);
    
    if (oldSalesTable) {
      console.log('⚠️  Old database schema detected. Migrating...');
      // Drop old tables
      await this.run('DROP TABLE IF EXISTS sales');
      await this.run('DROP TABLE IF EXISTS sale_items');
      await this.run('DROP TABLE IF EXISTS inventory_movements');
      console.log('✅ Old tables removed');
    }
    
    const tables = [
      // Users table
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'cashier',
        full_name VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Categories table
      `CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Products table
      `CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        sku VARCHAR(100) UNIQUE,
        barcode VARCHAR(100) UNIQUE,
        category_id INTEGER,
        price DECIMAL(10,2) NOT NULL,
        cost_price DECIMAL(10,2),
        stock_quantity INTEGER DEFAULT 0,
        min_stock_level INTEGER DEFAULT 0,
        unit VARCHAR(20) DEFAULT 'pcs',
        image_url VARCHAR(500),
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id)
      )`,

      // Customers table
      `CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100),
        phone VARCHAR(20),
        address TEXT,
        loyalty_points INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Sales table
      `CREATE TABLE IF NOT EXISTS sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sale_number VARCHAR(50) UNIQUE NOT NULL,
        customer_id INTEGER,
        user_id INTEGER NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL,
        tax_amount DECIMAL(10,2) DEFAULT 0,
        discount_amount DECIMAL(10,2) DEFAULT 0,
        total_amount DECIMAL(10,2) NOT NULL,
        payment_method VARCHAR(20) NOT NULL,
        payment_status VARCHAR(20) DEFAULT 'completed',
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )`,

      // Sale items table
      `CREATE TABLE IF NOT EXISTS sale_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sale_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id)
      )`,

      // Inventory movements table
      `CREATE TABLE IF NOT EXISTS inventory_movements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        movement_type VARCHAR(20) NOT NULL, -- 'in', 'out', 'adjustment'
        quantity INTEGER NOT NULL,
        reference_type VARCHAR(50), -- 'sale', 'purchase', 'adjustment'
        reference_id INTEGER,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id)
      )`,

      // Settings table
      `CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key VARCHAR(100) UNIQUE NOT NULL,
        value TEXT,
        description TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    for (const table of tables) {
      await this.run(table);
    }

    // Insert default data
    await this.insertDefaultData();
  }

  async insertDefaultData() {
    // Check if admin user exists
    const adminExists = await this.get('SELECT id FROM users WHERE role = ?', ['admin']);
    
    if (!adminExists) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await this.run(
        `INSERT INTO users (username, email, password, role, full_name) VALUES (?, ?, ?, ?, ?)`,
        ['admin', 'admin@pos.com', hashedPassword, 'admin', 'System Administrator']
      );
    }

    // Ensure a default cashier account exists for first-time login/testing
    const cashierExists = await this.get('SELECT id FROM users WHERE username = ?', ['cashier']);
    if (!cashierExists) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('cashier123', 10);
      await this.run(
        `INSERT INTO users (username, email, password, role, full_name) VALUES (?, ?, ?, ?, ?)`,
        ['cashier', 'cashier@pos.com', hashedPassword, 'cashier', 'Default Cashier']
      );
    }

    // Insert default categories
    const categories = [
      ['Electronics', 'Electronic devices and accessories'],
      ['Clothing', 'Apparel and fashion items'],
      ['Food & Beverages', 'Food and drink items'],
      ['Books', 'Books and educational materials'],
      ['Home & Garden', 'Home improvement and garden supplies']
    ];

    for (const [name, description] of categories) {
      await this.run(
        `INSERT OR IGNORE INTO categories (name, description) VALUES (?, ?)`,
        [name, description]
      );
    }

    // Insert default settings
    const settings = [
      ['store_name', 'POS System Store', 'Store name'],
      ['store_address', '123 Main Street, City', 'Store address'],
      ['store_phone', '+1-234-567-8900', 'Store phone number'],
      ['tax_rate', '0.08', 'Default tax rate (8%)'],
      ['currency', 'USD', 'Default currency'],
      ['receipt_footer', 'Thank you for your business!', 'Receipt footer text']
    ];

    for (const [key, value, description] of settings) {
      await this.run(
        `INSERT OR IGNORE INTO settings (key, value, description) VALUES (?, ?, ?)`,
        [key, value, description]
      );
    }
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            reject(err);
          } else {
            console.log('Database connection closed');
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }
}

module.exports = new Database();
