const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

module.exports = {
  PORT: process.env.PORT || 5000,
  JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret_key_here_change_this_in_production',
  DB_PATH: process.env.DB_PATH || path.join(__dirname, '..', 'pos_system.db'),
  NODE_ENV: process.env.NODE_ENV || 'development'
};
