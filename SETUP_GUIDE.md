# POS System Backend-Frontend Integration Guide

## Overview
This guide explains how to properly connect the backend and frontend, and use the application with Sri Lankan Rupee (LKR) currency.

## Prerequisites
- Node.js (v14+) installed
- npm package manager

## Backend Setup & Database

### 1. Start the Backend Server
```bash
cd "f:\2026 All Projects\New Pos System\POS System\backend"
npm start
```

**Expected Output:**
```
✔️ Database & Tables Ready!
✔️ Default admin user created (admin/admin123)
✔️ Dummy staff users created
✔️ Dummy service categories created
✔️ Dummy services created
✔️ Dummy photo frames created
✔️ Dummy customers created
✔️ Dummy bookings created
✔️ Dummy expenses created
🚀 Server on http://localhost:5000
```

### 2. Database Details
- **Location:** `backend/data/shine_art_pro.db` (SQLite)
- **Auto-initialized** with seed data on first run
- **Currency:** All prices in Sri Lankan Rupees (LKR)

### 3. Backend API Endpoints
The backend runs on `http://localhost:5000/api` with these main routes:

| Route | Purpose |
|-------|---------|
| `/api/auth` | User authentication (login/register) |
| `/api/customers` | Customer management |
| `/api/bookings` | Event bookings |
| `/api/services` | Services & categories |
| `/api/frames` | Photo frames inventory |
| `/api/expenses` | Expense tracking |
| `/api/dashboard` | Dashboard metrics |

## Frontend Setup

### 1. Start the Frontend Server
```bash
cd "f:\2026 All Projects\New Pos System\POS System\frontend"
npm run dev
```

**Expected Output:**
```
  VITE v4.5.0  ready in XXX ms

  ➜  Local:   http://localhost:5176/
  ➜  press h to show help
```

### 2. Default Login Credentials
```
Username: admin
Password: admin123
```

### 3. Frontend Configuration
- **API Base URL:** `http://localhost:5000/api` (configured in `src/utils/api.js`)
- **Port:** `5176`
- **Auto token refresh** from localStorage

## Currency Implementation

### LKR Formatting
All prices throughout the app use the `formatLKR` utility functions:

**Import:**
```javascript
import { formatLKR, formatLKRShort, formatLKRTable } from '../utils/currency';
```

**Usage:**
```javascript
formatLKR(12500)           // "Rs. 12,500.00"
formatLKRShort(1500000)    // "Rs. 1.5M"
formatLKRTable(5000)       // "Rs. 5,000"
```

### Pages Using LKR
- ✅ Dashboard (KPI cards, metrics, profit/loss)
- ✅ Billing (service prices, thermal receipt)
- ✅ Reports (stats cards, financial summary)
- ✅ Bill History (bill amounts)
- ✅ Expenses (expense tracking)
- ✅ Booking amounts (pending orders)

## Database Seed Data

### Services (LKR Prices)
| Service | Price |
|---------|-------|
| Professional Photoshoot | Rs. 7,500 |
| Bridal Close-up | Rs. 5,000 |
| 4K Videography | Rs. 12,000 |
| Drone Coverage | Rs. 8,000 |
| Photo Editing (50 photos) | Rs. 5,000 |
| Video Editing | Rs. 4,000 |
| Luxury Album (20 pages) | Rs. 8,000 |
| Premium Photo Book | Rs. 6,000 |

### Sample Customers
- Emma Wilson (+94-771-234567) - Colombo 5
- James Chen (+94-772-345678) - Kandy
- Sofia Garcia (+94-773-456789) - Galle
- Alex Thompson (+94-774-567890) - Colombo 3
- Maria Santos (+94-775-678901) - Negombo
- David Kim (+94-776-789012) - Colombo 7
- Lisa Anderson (+94-777-890123) - Colombo 4
- Michael Brown (+94-778-901234) - Kandy

### Sample Data Includes
- 8 customers with Sri Lankan addresses
- 8 bookings with various statuses (Pending, Confirmed, Completed)
- 8 expenses (Studio Rent, Equipment, Software, etc.)
- 8 photo frames for inventory

## Working with Data

### Adding Data via Frontend
1. **Login** with admin credentials
2. **Navigate** to relevant pages:
   - **Customers:** View/add customer records
   - **Services:** Create/manage services
   - **Bookings:** Create event bookings
   - **Billing:** Generate bills (creates bookings)
   - **Inventory:** Manage photo frames
   - **Expenses:** Track business expenses

### All data is saved to the SQLite database automatically

## Troubleshooting

### Backend Issues
```bash
# If getting "database locked" errors, remove old database:
rm "f:\2026 All Projects\New Pos System\POS System\backend\data\shine_art_pro.db"
# Restart backend - new database will be created with fresh data
```

### Frontend Issues
```bash
# If frontend can't connect to backend:
1. Ensure backend is running on port 5000
2. Check http://localhost:5000/api/health
3. Clear browser cache and reload
```

### Port Conflicts
- Backend: Change `PORT` in backend `.env` file
- Frontend: Backend automatically uses next available port (5177, 5178, etc.)

## Architecture

```
POS System
├── Backend (Express.js + SQLite)
│   ├── API Routes
│   ├── Database (shine_art_pro.db)
│   └── Seed Data (LKR prices)
├── Frontend (React 19 + Vite)
│   ├── Pages (Dashboard, Billing, Reports, etc.)
│   ├── Currency Utility (LKR formatting)
│   └── API Client (Axios with JWT)
└── Network
    └── http://localhost:5000/api
```

## Next Steps
1. Run backend: `npm start` (in /backend)
2. Run frontend: `npm run dev` (in /frontend)
3. Open http://localhost:5176 in browser
4. Login with admin/admin123
5. Start adding data through the frontend interface

---

**Note:** All monetary values are in Sri Lankan Rupees (Rs./LKR). The system is fully configured for Sri Lankan market with proper currency formatting and localization.
