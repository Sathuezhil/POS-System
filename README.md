# POS System - Complete Backend Integration

A comprehensive Point of Sale (POS) system built with Electron, React, and Node.js backend with SQLite3 database.

## Features

### Backend Features
- **RESTful API** with Express.js
- **SQLite3 Database** with comprehensive schema
- **JWT Authentication** with role-based access control
- **Complete CRUD operations** for all entities
- **Inventory management** with stock tracking
- **Sales processing** with receipt generation
- **Customer management** with loyalty points
- **User management** with role-based permissions
- **Settings management** for store configuration
- **Data validation** and error handling
- **Security middleware** (Helmet, CORS)

### Frontend Features
- **Modern React UI** with styled-components
- **Role-based navigation** (Admin/Cashier)
- **Real-time data** from backend APIs
- **Responsive design** for desktop and mobile
- **Electron desktop app** support

## Database Schema

The system uses SQLite3 with the following tables:
- **users** - User accounts and authentication
- **categories** - Product categories
- **products** - Product catalog with inventory
- **customers** - Customer information and loyalty
- **sales** - Sales transactions
- **sale_items** - Individual items in each sale
- **inventory_movements** - Stock tracking
- **settings** - System configuration

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Install frontend dependencies:**
   ```bash
   npm install
   ```

2. **Install backend dependencies:**
   ```bash
   npm run install-backend
   ```

3. **Initialize the database:**
   ```bash
   npm run init-db
   ```

4. **Start the development environment:**
   ```bash
   npm run dev
   ```

This will start:
- React frontend on http://localhost:3000
- Backend API on http://localhost:5000
- Electron desktop app

### Manual Setup

If you prefer to run components separately:

1. **Start the backend:**
   ```bash
   npm run backend-dev
   ```

2. **Start the frontend:**
   ```bash
   npm start
   ```

3. **Start Electron (in another terminal):**
   ```bash
   npm run electron
   ```

## Default Credentials

- **Admin:** username: `admin`, password: `admin123`
- **Cashier:** username: `cashier`, password: `cashier123`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/logout` - Logout

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `PATCH /api/products/:id/stock` - Update stock

### Sales
- `GET /api/sales` - Get all sales
- `GET /api/sales/:id` - Get single sale
- `POST /api/sales` - Create sale
- `GET /api/sales/dashboard/summary` - Sales summary
- `POST /api/sales/:id/refund` - Process refund

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Customers
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `GET /api/customers/search/quick` - Quick search

### Users (Admin only)
- `GET /api/users` - Get all users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Settings (Admin only)
- `GET /api/settings` - Get all settings
- `PUT /api/settings` - Update settings

## Database Location

The SQLite database is stored at: `C:\sqlite\pos_system.db`

## Configuration

Backend configuration is in `backend/config.js`:
- Port: 5000 (default)
- Database path: `C:\sqlite\pos_system.db`
- JWT secret: Change in production

## Development

### Backend Development
```bash
cd backend
npm run dev  # Uses nodemon for auto-restart
```

### Frontend Development
```bash
npm start  # React development server
```

### Database Management
```bash
npm run init-db  # Initialize/reset database
```

## Production Build

1. **Build React app:**
   ```bash
   npm run build
   ```

2. **Build Electron app:**
   ```bash
   npm run build-electron
   ```

## Troubleshooting

### Database Issues
- Ensure the `C:\sqlite\` directory exists
- Check file permissions for database access
- Run `npm run init-db` to reset database

### API Connection Issues
- Verify backend is running on port 5000
- Check CORS configuration in `backend/server.js`
- Ensure frontend is running on port 3000

### Authentication Issues
- Clear browser localStorage
- Check JWT token in browser dev tools
- Verify backend JWT secret configuration

## Security Notes

- Change default JWT secret in production
- Use HTTPS in production
- Implement proper user password policies
- Regular database backups recommended

## License

MIT License - see LICENSE file for details
