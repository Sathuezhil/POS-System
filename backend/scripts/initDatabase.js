const database = require('../database/database');
const config = require('../config');

const initDatabase = async () => {
  try {
    console.log('🔄 Initializing database...');
    console.log(`📁 Database path: ${config.DB_PATH}`);
    
    await database.connect();
    console.log('✅ Database initialized successfully');
    
    // Test database connection
    const result = await database.get('SELECT COUNT(*) as count FROM users');
    console.log(`👥 Users in database: ${result.count}`);
    
    const categories = await database.get('SELECT COUNT(*) as count FROM categories');
    console.log(`📂 Categories in database: ${categories.count}`);
    
    const products = await database.get('SELECT COUNT(*) as count FROM products');
    console.log(`📦 Products in database: ${products.count}`);
    
    console.log('🎉 Database initialization completed!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  } finally {
    await database.close();
  }
};

// Run if called directly
if (require.main === module) {
  initDatabase();
}

module.exports = initDatabase;
