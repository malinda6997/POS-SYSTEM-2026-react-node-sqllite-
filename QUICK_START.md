# Quick Start Guide - Shine Art Studio POS System

## 🚀 Getting Started in 5 Minutes

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Start the Server
```bash
npm start
```
You should see:
```
✔️ Database & Tables Ready!
🚀 Server on http://localhost:5000
```

### Step 3: Test with Postman/Insomnia

#### 1️⃣ Register a User
**POST** `http://localhost:5000/api/auth/register`
```json
{
  "username": "admin",
  "password": "admin123",
  "role": "admin",
  "full_name": "Admin User"
}
```

#### 2️⃣ Login
**POST** `http://localhost:5000/api/auth/login`
```json
{
  "username": "admin",
  "password": "admin123"
}
```
**Copy the `token` from response** ⬅️ You'll need this!

#### 3️⃣ Set Authorization Header
In Postman/Insomnia:
- Click **Authorization** tab
- Choose **Bearer Token**
- Paste your token

#### 4️⃣ Test Other Endpoints

**Create a Customer:**
```
POST http://localhost:5000/api/customers
{
  "customer_name": "Ahmed Hassan",
  "mobile_number": "+94-700000000",
  "address": "123 Main St, Colombo"
}
```

**Create a Booking:**
```
POST http://localhost:5000/api/bookings
{
  "customer_id": 1,
  "customer_mobile": "+94-700000000",
  "customer_address": "123 Main St, Colombo",
  "total_amount": 15000,
  "advance_paid": 5000,
  "event_date": "2026-05-15",
  "event_time": "10:00",
  "status": "Pending"
}
```

**Create a Frame:**
```
POST http://localhost:5000/api/frames
{
  "frame_name": "Silver Frame 8x10",
  "buying_price": 500,
  "selling_price": 1200,
  "quantity": 20
}
```

**Create an Expense:**
```
POST http://localhost:5000/api/expenses
{
  "expense_name": "Studio Rent",
  "price": 50000
}
```

**Get Dashboard Summary:**
```
GET http://localhost:5000/api/dashboard/summary
```

---

## 📋 Important Rules to Remember

### ⚠️ Booking Validation (MANDATORY)
When creating a booking, you **MUST** provide:
- `customer_mobile` (cannot be empty)
- `customer_address` (cannot be empty)
- `total_amount` (must be > 0)
- `event_date` and `event_time`

❌ This will FAIL:
```json
{
  "customer_id": 1,
  "customer_mobile": "",  // ❌ EMPTY!
  "customer_address": "",  // ❌ EMPTY!
  "total_amount": 15000,
  "event_date": "2026-05-15",
  "event_time": "10:00"
}
```

✅ This will SUCCEED:
```json
{
  "customer_id": 1,
  "customer_mobile": "+94-700000000",  // ✅ Provided
  "customer_address": "123 Main St",   // ✅ Provided
  "total_amount": 15000,
  "event_date": "2026-05-15",
  "event_time": "10:00"
}
```

### 📌 Inventory & Frames
- When you **sell a frame**, the quantity automatically decreases
- You cannot sell more than available stock
- Profit margin = (selling_price - buying_price)

### 👤 Expenses Auto-Fill
- You don't need to provide `user_name` when creating an expense
- It's automatically captured from your JWT token (logged-in user)
- The current timestamp is also auto-filled

---

## 🎯 Key Endpoints Cheat Sheet

| Operation | Method | Endpoint |
|-----------|--------|----------|
| **Auth** |
| Register | POST | `/api/auth/register` |
| Login | POST | `/api/auth/login` |
| **Customers** |
| List All | GET | `/api/customers` |
| Get One | GET | `/api/customers/:id` |
| Create | POST | `/api/customers` |
| Update | PUT | `/api/customers/:id` |
| Delete | DELETE | `/api/customers/:id` |
| **Bookings** |
| List All | GET | `/api/bookings` |
| List Pending | GET | `/api/bookings/pending` |
| Create | POST | `/api/bookings` |
| Update | PUT | `/api/bookings/:id` |
| Generate Invoice | POST | `/api/bookings/:id/generate-invoice` |
| Generate Bill (Thermal) | POST | `/api/bookings/:id/generate-thermal-bill` |
| **Frames (Inventory)** |
| List All | GET | `/api/frames` |
| Get Summary | GET | `/api/frames/summary/overview` |
| Create | POST | `/api/frames` |
| Add Stock | POST | `/api/frames/:id/add-stock` |
| Sell (Auto-decrement) | POST | `/api/frames/:id/sell` |
| **Expenses** |
| List All | GET | `/api/expenses` |
| Create | POST | `/api/expenses` |
| Summary | GET | `/api/expenses/summary` |
| **Dashboard** |
| Summary | GET | `/api/dashboard/summary` |
| Monthly Analytics | GET | `/api/dashboard/monthly-analytics` |
| Pending Tasks | GET | `/api/dashboard/pending-tasks` |
| Customer Stats | GET | `/api/dashboard/customer-stats` |

---

## 🗂️ Database File Location

Your SQLite database is automatically created at:
```
backend/data/shine_art_pro.db
```

**Note:** Don't delete this file! It contains all your data.

---

## 📄 Documentation Files

- **API_DOCUMENTATION.md** - Complete API reference with examples
- **IMPLEMENTATION_SUMMARY.md** - What was built and how
- **This file (QUICK_START.md)** - Get started quickly

---

## 🆘 Common Issues & Solutions

### Issue: "Token not found" error
**Solution:** Make sure you're including the Authorization header with your JWT token
```
Authorization: Bearer <your-token-here>
```

### Issue: "Customer mobile number is mandatory for booking!"
**Solution:** You must provide `customer_mobile` when creating a booking. It cannot be empty!

### Issue: "Insufficient stock! Available: X, Requested: Y"
**Solution:** You tried to sell more frames than available. Check inventory first!

### Issue: "Cannot delete customer with existing bookings!"
**Solution:** You can only delete customers with no bookings. The customer has bookings.

### Issue: "Cannot delete category with existing services!"
**Solution:** Delete all services in the category first, then delete the category.

---

## 📊 Sample Workflow

### 1. Setup Phase
```
1. Register admin user
2. Login and get token
3. Create service categories (Wedding, Portrait, etc.)
4. Create services under each category
5. Add photo frames to inventory
```

### 2. Customer Phase
```
1. Create customer (name only is OK)
2. Update customer with mobile & address if missing
```

### 3. Booking Phase
```
1. Create booking with mobile and address (MANDATORY!)
2. Track advance payment
3. Update status as event progresses
4. Generate professional invoice
```

### 4. Sales Phase
```
1. Sell frames from inventory
2. System auto-decrements stock
3. Check low stock alerts
```

### 5. Finance Phase
```
1. Record expenses automatically
2. System captures your name from JWT
3. Check expense summary
```

### 6. Reporting Phase
```
1. View dashboard summary
2. Analyze monthly revenue vs expenses
3. Check customer statistics
4. Identify pending bookings
```

---

## 🔐 Security Notes

✅ Passwords are hashed - never stored in plain text
✅ Tokens expire after 24 hours - login again to continue
✅ All sensitive operations require authentication
✅ Database uses SQLite with proper relationships

---

## 🚀 Ready to Build Frontend?

The backend API is fully ready! You can now:

1. **Setup React/Vue Frontend**
2. **Use the /api/... endpoints** from your frontend
3. **Include JWT token** in all protected requests
4. **Display data** from analytics endpoints on dashboard

See **API_DOCUMENTATION.md** for complete endpoint reference.

---

## 📞 Need Help?

Refer to:
- **API_DOCUMENTATION.md** - For endpoint details
- **IMPLEMENTATION_SUMMARY.md** - For architecture details
- Error messages from API responses - They're descriptive!

---

**Happy coding! 🎉**
