# Shine Art Studio POS System - API Documentation

## Overview
A professional POS system for a photography studio with complete handling of authentication, service management, inventory, customer bookings with strict validation, expense tracking, and professional invoicing.

## Quick Start

### Install Dependencies
```bash
cd backend
npm install
```

### Run Server
```bash
npm start
```

Server runs on `http://localhost:5000`

---

## API Endpoints

### 1. AUTHENTICATION (Public Routes - No Auth Required)

#### Register User
`POST /api/auth/register`
```json
{
  "username": "john_doe",
  "password": "secure_password",
  "role": "admin",
  "full_name": "John Doe"
}
```

#### Login
`POST /api/auth/login`
```json
{
  "username": "john_doe",
  "password": "secure_password"
}
```
**Response includes JWT token to use in Authorization header:**
```
Authorization: Bearer <token>
```

---

### 2. CUSTOMERS (Protected Routes)

#### Get All Customers
`GET /api/customers`

#### Get Customer by ID
`GET /api/customers/:id`

#### Create Customer
`POST /api/customers`
```json
{
  "customer_name": "Ahmed Hassan",
  "mobile_number": "+94-7XX-XXXXXX",
  "address": "123 Main St, City"
}
```
⚠️ **Note:** Only `customer_name` is required. Mobile and address can be added later, but both are **mandatory for creating a booking**.

#### Update Customer
`PUT /api/customers/:id`
```json
{
  "customer_name": "Ahmed Hassan Updated",
  "mobile_number": "+94-7XX-XXXXXX",
  "address": "456 New St, City"
}
```

#### Delete Customer
`DELETE /api/customers/:id`
⚠️ Cannot delete customer with existing bookings.

---

### 3. BOOKINGS (Protected Routes)

#### Get All Bookings
`GET /api/bookings`

#### Get Pending Bookings
`GET /api/bookings/pending`

#### Get Booking by ID
`GET /api/bookings/:id`

#### Create Booking ⭐ IMPORTANT
`POST /api/bookings`
```json
{
  "customer_id": 1,
  "customer_mobile": "+94-7XX-XXXXXX",
  "customer_address": "123 Main St, City",
  "total_amount": 15000,
  "advance_paid": 5000,
  "event_date": "2026-04-15",
  "event_time": "10:00",
  "status": "Pending"
}
```
**⚠️ MANDATORY VALIDATION:**
- `customer_mobile` is **REQUIRED**
- `customer_address` is **REQUIRED**
- Both must be non-empty strings
- `total_amount` must be > 0
- API enforces these rules!

#### Update Booking
`PUT /api/bookings/:id`
```json
{
  "status": "Confirmed",
  "advance_paid": 7500
}
```

#### Delete Booking
`DELETE /api/bookings/:id`

#### Generate Thermal Bill (80mm Format)
`POST /api/bookings/:id/generate-thermal-bill`
**Response:** File path to the generated PDF

#### Generate A4 Invoice
`POST /api/bookings/:id/generate-invoice`
**Response:** File path to the generated PDF

---

### 4. SERVICES (Protected Routes)

#### Get All Services
`GET /api/services`

#### Get Services by Category
`GET /api/services/category/:category_id`

#### Create Service
`POST /api/services`
```json
{
  "category_id": 1,
  "service_name": "Wedding Photography",
  "price": 25000
}
```

#### Update Service
`PUT /api/services/:id`
```json
{
  "service_name": "Premium Wedding Photography",
  "price": 30000
}
```

#### Delete Service
`DELETE /api/services/:id`

---

### Service Categories

#### Get All Categories
`GET /api/services/categories`

#### Create Category
`POST /api/services/categories`
```json
{
  "category_name": "Wedding Services",
  "base_price": 20000
}
```

#### Update Category
`PUT /api/services/categories/:id`
```json
{
  "category_name": "Premium Wedding Services",
  "base_price": 25000
}
```

#### Delete Category
`DELETE /api/services/categories/:id`
⚠️ Cannot delete category with existing services.

---

### 5. INVENTORY - PHOTO FRAMES (Protected Routes)

#### Get All Frames
`GET /api/frames`

#### Get Frame by ID
`GET /api/frames/:id`

#### Get Inventory Summary (with Low Stock Alerts)
`GET /api/frames/summary/overview?threshold=5`

**Response includes:**
- All frames with status (In Stock, Low Stock, Out of Stock)
- Total inventory value
- Low stock count
- Out of stock count

#### Create Frame
`POST /api/frames`
```json
{
  "frame_name": "Silver Frame 8x10",
  "buying_price": 500,
  "selling_price": 1200,
  "quantity": 20
}
```

#### Update Frame
`PUT /api/frames/:id`
```json
{
  "frame_name": "Silver Frame 8x10 Premium",
  "buying_price": 550,
  "selling_price": 1300
}
```

#### Add Stock
`POST /api/frames/:id/add-stock`
```json
{
  "quantity": 10
}
```

#### Sell Frame ⭐ (Auto-decrements inventory)
`POST /api/frames/:id/sell`
```json
{
  "quantity": 3
}
```
**Response includes:**
- Quantity sold
- New remaining quantity
- Total revenue from sale
⚠️ Validates stock availability before selling!

#### Delete Frame
`DELETE /api/frames/:id`

---

### 6. EXPENSES (Protected Routes)

#### Get All Expenses
`GET /api/expenses`

#### Get Expenses by Date Range
`GET /api/expenses/by-date?start_date=2026-03-01&end_date=2026-03-31`

#### Get Expenses by User
`GET /api/expenses/by-user/:user_name`

#### Get Expense Summary
`GET /api/expenses/summary`
**Optional:** `?start_date=2026-03-01&end_date=2026-03-31`

#### Create Expense ⭐ (Auto-captures user)
`POST /api/expenses`
```json
{
  "expense_name": "Studio Rent",
  "price": 50000
}
```
**⚠️ AUTOMATIC:**
- User name is **automatically captured** from JWT token
- Expense date is **automatically set** to current timestamp
- No need to provide user_name in request!

#### Update Expense
`PUT /api/expenses/:id`
```json
{
  "expense_name": "Monthly Rent Updated",
  "price": 55000
}
```

#### Delete Expense
`DELETE /api/expenses/:id`

---

### 7. DASHBOARD ANALYTICS (Protected Routes)

#### Get Dashboard Summary
`GET /api/dashboard/summary`
**Returns:**
- Total Revenue
- Total Expenses
- Profit
- Profit Margin
- Booking statistics
- Customer count
- Inventory value

#### Get Monthly Revenue vs Expenses
`GET /api/dashboard/monthly-analytics?year=2026`
**Returns:** Month-by-month breakdown of revenue, expenses, and profit

#### Get Service Category Revenue
`GET /api/dashboard/service-revenue`

#### Get Frame Sales Overview
`GET /api/dashboard/frame-sales`
**Returns:** All frames with stock value and profit margin

#### Get Pending Tasks
`GET /api/dashboard/pending-tasks`
**Returns:**
- List of pending bookings with customer details
- List of low stock frames (quantity ≤ 5)

#### Get Customer Statistics
`GET /api/dashboard/customer-stats`
**Returns:**
- Total customers
- Active customers
- New customers this month
- Top 10 customers by spending

#### Get Booking Status Distribution
`GET /api/dashboard/booking-distribution`
**Returns:** Count and revenue by booking status (Pending, Confirmed, Completed, Cancelled)

---

## Database Schema

### users
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin', 'staff')),
  full_name TEXT NOT NULL
);
```

### customers
```sql
CREATE TABLE customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_name TEXT NOT NULL,
  mobile_number TEXT,
  address TEXT
);
```

### bookings
```sql
CREATE TABLE bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL,
  customer_mobile TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  total_amount REAL NOT NULL,
  advance_paid REAL DEFAULT 0,
  event_date DATE NOT NULL,
  event_time TEXT NOT NULL,
  booking_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'Pending',
  created_by INTEGER NOT NULL
);
```

### services & service_categories
```sql
CREATE TABLE service_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_name TEXT NOT NULL,
  base_price REAL DEFAULT 0
);

CREATE TABLE services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL,
  service_name TEXT NOT NULL,
  price REAL NOT NULL
);
```

### photo_frames
```sql
CREATE TABLE photo_frames (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  frame_name TEXT NOT NULL,
  buying_price REAL NOT NULL,
  selling_price REAL NOT NULL,
  quantity INTEGER DEFAULT 0
);
```

### expenses
```sql
CREATE TABLE expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  expense_name TEXT NOT NULL,
  price REAL NOT NULL,
  user_name TEXT NOT NULL,
  expense_date DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## Key Features Implemented

✅ **Authentication & Authorization**
- JWT-based authentication
- Password hashing with bcryptjs
- Role-based access (admin/staff)
- Protected routes with middleware

✅ **Customer Management**
- Create customers with minimal initial info
- Update customer details
- Customer-booking relationship management

✅ **Booking System**
- **STRICT VALIDATION:** Mobile number and address mandatory
- Advance payment tracking
- Booking status management
- Event date/time scheduling

✅ **Service Management**
- Service categories with base pricing
- Individual service pricing
- Flexible pricing model

✅ **Inventory Management**
- Stock tracking with buying/selling prices
- Automatic stock decrement on sales
- Low stock alerts
- Inventory value calculations

✅ **Expense Tracking**
- Automatic user capture from JWT
- Date range queries
- User-wise expense tracking
- Expense category analysis

✅ **Professional Invoicing**
- Thermal bills (80mm format) for quick transactions
- A4 invoices with professional branding
- Automatic PDF generation

✅ **Analytics & Reporting**
- Monthly revenue vs expense charts
- Customer statistics
- Pending tasks dashboard
- Service category performance
- Frame inventory analysis
- Booking status distribution

---

## Response Format

All successful API responses follow this format:
```json
{
  "data": {},
  "message": "Operation successful"
}
```

Error responses:
```json
{
  "error": "Error message",
  "status": 400
}
```

---

## Error Handling

- **400 Bad Request:** Invalid input or missing mandatory fields
- **401 Unauthorized:** Missing or invalid JWT token
- **404 Not Found:** Resource not found
- **500 Server Error:** Database or server error

---

## Testing with Postman

1. **Register a user:**
   - POST to `/api/auth/register`
   - Note the response (will not include token on register)

2. **Login:**
   - POST to `/api/auth/login`
   - Copy the `token` from response

3. **Set Authorization:**
   - In Postman, go to "Authorization" tab
   - Select "Bearer Token"
   - Paste your token

4. **Test protected routes:**
   - All other endpoints now work with the token

---

## Security Considerations

✅ JWT tokens expire in 24 hours
✅ Passwords hashed with bcryptjs (10 rounds)
✅ CORS enabled for frontend integration
✅ Database queries use parameterized statements (SQLite)
✅ User authentication required for all sensitive operations
