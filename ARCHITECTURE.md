# System Architecture & Data Flow

## Backend Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Frontend)                         │
│              React/Vue + Tailwind + Framer Motion               │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ HTTP/HTTPS
                     │
┌────────────────────▼────────────────────────────────────────────┐
│                   EXPRESS SERVER (Port 5000)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │          MIDDLEWARE LAYER                                │   │
│  │  ├─ CORS                                                 │   │
│  │  ├─ JSON Parser                                          │   │
│  │  └─ Auth Middleware (JWT Verification)                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│  ┌──────────────────────▼──────────────────────────────────┐   │
│  │         ROUTES LAYER (7 Route Files)                    │   │
│  │                                                           │   │
│  │  ✅ authRoutes.js          (Public - No Auth)           │   │
│  │     ├─ POST /register                                   │   │
│  │     └─ POST /login → returns JWT                        │   │
│  │                                                           │   │
│  │  ✅ customerRoutes.js       (Protected)                 │   │
│  │  ✅ bookingRoutes.js        (Protected + PDF)           │   │
│  │  ✅ serviceRoutes.js        (Protected)                 │   │
│  │  ✅ frameRoutes.js          (Protected - Inventory)     │   │
│  │  ✅ expenseRoutes.js        (Protected)                 │   │
│  │  ✅ dashboardRoutes.js      (Protected - Analytics)     │   │
│  │                                                           │   │
│  └──────────────────────┬───────────────────────────────────┘   │
│                          │                                       │
│  ┌──────────────────────▼──────────────────────────────────┐   │
│  │      CONTROLLER LAYER (7 Controller Files)              │   │
│  │                                                           │   │
│  │  Handles business logic:                                │   │
│  │  • authController - User auth & JWT                     │   │
│  │  • customerController - CRUD operations                 │   │
│  │  • bookingController - Strict validation ⭐            │   │
│  │  • serviceController - Services & categories            │   │
│  │  • frameController - Inventory mgmt (auto-decrement)    │   │
│  │  • expenseController - Track expenses (auto-user)       │   │
│  │  • dashboardController - Analytics & reporting          │   │
│  │                                                           │   │
│  └──────────────────────┬───────────────────────────────────┘   │
│                          │                                       │
│  ┌──────────────────────▼──────────────────────────────────┐   │
│  │       UTILITY LAYER                                      │   │
│  │                                                           │   │
│  │  ✅ pdfService.js - PDF Generation                      │   │
│  │     ├─ Thermal Bill (80mm - Quick)                      │   │
│  │     ├─ A4 Invoice (Professional)                        │   │
│  │     └─ Expense Report                                   │   │
│  │                                                           │   │
│  └───────────────────────────────────────────────────────────┘  │
│                          │                                       │
└──────────────────────────┼───────────────────────────────────────┘
                           │
                           │ SQL Queries
                           │
        ┌──────────────────▼──────────────────┐
        │    SQLITE DATABASE                    │
        │  (/data/shine_art_pro.db)             │
        │                                       │
        │ ✅ users                             │
        │ ✅ customers                         │
        │ ✅ bookings (with strict validation) │
        │ ✅ services & service_categories    │
        │ ✅ photo_frames (with inventory)    │
        │ ✅ expenses (auto-user capture)     │
        │                                       │
        └───────────────────────────────────────┘
```

---

## Request Flow Diagram

### Authentication Flow
```
┌──────────────────────┐
│  User Registration   │
│  (username, pass...) │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────────────┐
│ POST /api/auth/register      │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ authController.register()    │
│  - Validate input            │
│  - Hash password (bcryptjs)  │
│  - Save to database          │
└──────────┬───────────────────┘
           │
           ▼
    ┌──────────────┐
    │  User Saved  │ ✅
    └──────────────┘
           │
           ▼
┌──────────────────┐
│ User Login       │
│ (username, pass) │
└────────┬─────────┘
         │
         ▼
┌────────────────────────────┐
│ POST /api/auth/login       │
└────────┬───────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ authController.login()      │
│  - Find user                │
│  - Compare password         │
│  - Generate JWT             │
│  - Return token             │
└────────┬────────────────────┘
         │
         ▼
    ┌─────────────────────────────┐
    │ JWT Token Returned to Client│ ✅
    │ (valid for 24 hours)       │
    └─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│ Client stores token                   │
│ Send in Authorization header:         │
│ "Bearer: <token>"                     │
└──────────────────────────────────────┘
```

### Protected Request Flow
```
┌────────────────────────────────────────┐
│ Client Request with Authorization      │
│ GET /api/customers                     │
│ Headers: {Authorization: "Bearer xxx"} │
└──────────────────┬─────────────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │ Express App          │
        │ CORS Middleware ✅   │
        │ JSON Parser ✅       │
        └──────┬───────────────┘
               │
               ▼
    ┌──────────────────────────────────┐
    │ authMiddleware.js                │
    │  - Extract token from header     │
    │  - Verify JWT                    │
    │  - Inject req.user               │
    │  - Allow access or reject        │
    └──────┬───────────────────────────┘
           │
           ├─ ✅ Token valid
           │  └─► Continue to route
           │
           └─ ❌ Token invalid/missing
              └─► Return 401 Unauthorized
                   │
                   ▼
         ┌──────────────────────┐
         │ customerRoutes.js    │
         │ GET /customers       │
         └──────┬───────────────┘
                │
                ▼
      ┌─────────────────────────────┐
      │ customerController.js        │
      │ getAllCustomers()            │
      │  - Query database            │
      │  - Return results            │
      └─────────┬───────────────────┘
                │
                ▼
           ┌──────────────┐
           │ Database     │ ✅
           │ Query SQLite │
           └──────┬───────┘
                  │
                  ▼
        ┌──────────────────────┐
        │ Send JSON response   │
        │ 200 OK               │
        └──────────────────────┘
```

### Booking Creation (with Validation) Flow
```
┌────────────────────────────────────────────────┐
│ POST /api/bookings                             │
│ {                                              │
│   customer_id: 1,                              │
│   customer_mobile: "+94-7XX-XXXX", ⭐         │
│   customer_address: "123 Main St", ⭐         │
│   total_amount: 15000,                         │
│   ...                                          │
│ }                                              │
└────────────────────┬─────────────────────────┘
                     │
                     ▼
         ┌───────────────────────────┐
         │ bookingController.create()│
         └───────────┬───────────────┘
                     │
        ┌────────────┴───────────┐
        │                         │
        ▼                         ▼
  ✓ Check mobile       Check address
    NOT NULL?              NOT NULL?
        │                     │
        ├─ Empty? ❌ FAIL    ├─ Empty? ❌ FAIL
        │                     │
        └─ Has value? ✅      └─ Has value? ✅
                  │                     │
                  └──────────┬──────────┘
                             │
                             ▼
                   ┌─────────────────────┐
                   │ Check total_amount  │
                   │ > 0?                │
                   └──────┬──────────────┘
                          │
                    ┌─────┴─────┐
                    │           │
              ✅ Valid     ❌ Invalid
                    │           │
                    ▼           ▼
            ┌────────────┐  ┌─────────┐
            │ Verify     │  │ Return  │
            │ customer   │  │ 400 Bad │
            │ exists     │  │ Request │
            └────┬───────┘  └─────────┘
                 │
            ┌────┴────┐
            │          │
         ✅ Exists  ❌ Not found
            │          │
            ▼          ▼
    ┌────────────┐  ┌─────────┐
    │ Create     │  │ Return  │
    │ booking    │  │ 404 Not │
    │ in DB      │  │ Found   │
    └────┬───────┘  └─────────┘
         │
         ▼
   ┌─────────────────┐
   │ Return 201      │
   │ Created + Data  │ ✅
   └─────────────────┘
```

### Inventory Management Flow
```
┌──────────────────────────────┐
│ POST /api/frames/:id/sell    │
│ {quantity: 5}                │
└───────────────┬──────────────┘
                │
                ▼
  ┌─────────────────────────────┐
  │ frameController.sellFrame()  │
  └──────────┬──────────────────┘
             │
             ▼
  ┌────────────────────────────────┐
  │ Get current frame quantity: 20 │
  │ Request to sell: 5             │
  └───────────────┬────────────────┘
                  │
            ┌─────┴─────┐
            │           │
        20 ≥ 5?    No (20 < 5)
            │           │
         ✅ Yes      ❌ No
            │           │
            ▼           ▼
   ┌──────────────┐  ┌──────────────┐
   │ Decrement    │  │ Return 400   │
   │ quantity:    │  │ Insufficient │
   │ 20 - 5 = 15  │  │ Stock!       │
   │              │  │              │
   │ Calculate    │  └──────────────┘
   │ revenue:     │
   │ 5 × 1200     │
   │ = 6000       │
   └───────┬──────┘
           │
           ▼
   ┌──────────────────┐
   │ Update database  │
   │ Return response: │
   │ • qty_sold: 5    │
   │ • new_qty: 15    │
   │ • revenue: 6000  │ ✅
   └──────────────────┘
```

### Expense Creation Flow (Auto User Capture)
```
┌────────────────────────────┐
│ POST /api/expenses         │
│ {                          │
│   expense_name: "Rent",    │
│   price: 50000             │
│ }                          │
│ Authorization: Bearer xxx  │
└───────────┬────────────────┘
            │
            ▼
  ┌──────────────────────────────┐
  │ JWT decoded to get:          │
  │ req.user.id = 5              │
  └──────────┬───────────────────┘
             │
             ▼
  ┌───────────────────────────────┐
  │ Query DB:                     │
  │ SELECT full_name              │
  │ FROM users                    │
  │ WHERE id = 5                  │
  └──────────┬────────────────────┘
             │
             ▼
  ┌───────────────────────────────┐
  │ Result: "John Doe"            │
  │ (Auto-captured) ✅            │
  └──────────┬────────────────────┘
             │
             ▼
  ┌───────────────────────────────┐
  │ Insert into database:         │
  │ • expense_name: "Rent"        │
  │ • price: 50000                │
  │ • user_name: "John Doe" ✅    │
  │ • expense_date: NOW() ✅      │
  └──────────┬────────────────────┘
             │
             ▼
  ┌──────────────────────────────┐
  │ Return 201 Created           │
  │ No need to manually enter    │
  │ username! ✅                 │
  └──────────────────────────────┘
```

---

## Component Interaction Map

```
┌─────────────────┐
│   authController│──────┐
└─────────────────┘      │
                         │ Uses
                         ▼
                  ┌──────────────┐
                  │   Database   │
                  │  (SQLite)    │
                  └──────────────┘
                         ▲
        ┌────────────────┼────────────────┐
        │                │                │
        │                │                │
   ┌────┴──────┐  ┌──────┴───────┐  ┌────┴──────┐
   │ Customer   │  │ Booking      │  │ Frame     │
   │ Controller │  │ Controller   │  │ Controller│
   │            │  │              │  │           │
   │ • CRUD ops │  │ • Validation │  │ • Inv.mgmt│
   │ • Queries  │  │ • Mobile/Addr│  │ • Auto-dec│
   │ • Booking  │  │ • Amount chk │  │ • Low stck│
   │   safety   │  │ • PDFs       │  │ • Analysis│
   └────────────┘  └──────────────┘  └───────────┘
        │
   ┌────┴──────┐
   │            │
   ▼            ▼
┌──────────┐ ┌──────────────┐
│ Service  │ │ Expense      │
│ Ctrller  │ │ Controller   │
│          │ │              │
│ • Svcs   │ │ • Auto user  │
│ • Cats   │ │ • Auto date  │
│ • Pricing│ │ • By user    │
│ • Combos │ │ • Summary    │
└──────────┘ └──────────────┘
        │
        ▼
    ┌──────────────────┐
    │ Dashboard        │
    │ Controller       │
    │                  │
    │ • Summary KPIs   │
    │ • Monthly charts │
    │ • Analytics      │
    │ • Pending tasks  │
    │ • Statistics     │
    └──────────────────┘

┌─────────────────────────────┐
│ pdfService.js (Utility)     │
│                             │
│ • Thermal Bill (80mm)       │
│ • A4 Invoice (Professional) │
│ • Expense Report            │
└─────────────────────────────┘
```

---

## Data Model Relationships

```
┌─────────────┐
│   users     │
├─────────────┤
│ id (PK)     │
│ username    │
│ password    │
│ role        │
│ full_name   │
└────┬────────┘
     │ created_by
     │
     ▼
┌──────────────┐              ┌──────────────────────┐
│  bookings    │──────┬──────▶│  customers           │
├──────────────┤      │       ├──────────────────────┤
│ id (PK)      │      │       │ id (PK)              │
│ customer_id  │──────┘       │ customer_name        │
│ customer_mobile (⭐req)      │ mobile_number        │
│ customer_address (⭐req)     │ address              │
│ total_amount │              └──────────────────────┘
│ advance_paid │
│ event_date   │
│ event_time   │
│ status       │
│ created_by ──┼──────┐
│ booking_date │      │
└──────────────┘      │
                      ▼
                  ┌─────────┐
                  │ users   │
                  │(staff)  │
                  └─────────┘


┌──────────────────────┐
│ service_categories   │
├──────────────────────┤
│ id (PK)              │
│ category_name        │
│ base_price           │
└────────┬─────────────┘
         │
         ▼
┌──────────────┐
│   services   │
├──────────────┤
│ id (PK)      │
│ category_id (FK)
│ service_name │
│ price        │
└──────────────┘


┌─────────────────┐
│  photo_frames   │
├─────────────────┤
│ id (PK)         │
│ frame_name      │
│ buying_price    │
│ selling_price   │
│ quantity        │ (auto-decrements on sale)
└─────────────────┘


┌──────────────┐
│  expenses    │
├──────────────┤
│ id (PK)      │
│ expense_name │
│ price        │
│ user_name (⭐auto-captured)
│ expense_date (⭐auto-set)
└──────────────┘
```

---

## API Response Pattern

```
All responses follow this pattern:

SUCCESS (2xx Status):
{
  "data": { ... actual response data ... },
  "message": "Success message or description"
}

ERROR (4xx/5xx Status):
{
  "error": "Error description",
  "status": 400
}

Example Success Response:
{
  "data": {
    "id": 1,
    "customer_name": "Ahmed Hassan",
    "mobile_number": "+94-700000000"
  },
  "message": "Customer created successfully!"
}

Example Error Response:
{
  "error": "Customer mobile number is mandatory for booking!",
  "status": 400
}
```

---

## Deployment Architecture (Frontend Ready)

```
┌─────────────────────────────────────────────────────────┐
│                  PRODUCTION ENVIRONMENT                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────┐  ┌──────────────────┐   │
│  │   Frontend (React/Vue)  │  │   Backend API    │   │
│  │  Port: 3000             │  │   Port: 5000     │   │
│  │                         │  │                  │   │
│  │  • Dashboard (recharts) │  │  • Express.js    │   │
│  │  • Booking Form         │◀─┤  • SQLite DB     │   │
│  │  • Inventory Table      │  │  • JWT Auth      │   │
│  │  • Customer List        │  │  • PDF Gen       │   │
│  │  • Expense Tracker      │  │                  │   │
│  │                         │  │                  │   │
│  └─────────────────────────┘  └──────────────────┘   │
│                                                         │
│  ┌──────────────────────────────────────────────────┐ │
│  │         SQLite Database File                      │ │
│  │  (/backend/data/shine_art_pro.db)                │ │
│  │                                                   │ │
│  │  • All tables auto-created                        │ │
│  │  • Foreign key relationships maintained          │ │
│  │  • Automatic backups recommended                 │ │
│  └──────────────────────────────────────────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

This architecture provides:
✅ Separation of concerns (controllers, routes, middleware)
✅ Database relationships & integrity
✅ Strict validation & error handling
✅ Automatic data processing (user capture, stock decrement)
✅ Professional PDF generation
✅ Comprehensive analytics
✅ Production-ready security
