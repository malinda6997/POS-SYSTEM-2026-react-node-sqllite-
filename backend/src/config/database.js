const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const dataDir = path.join(__dirname, "../../data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

const db = new Database(path.join(dataDir, "shine_art_pro.db"));

const initDatabase = () => {
  db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL CHECK(role IN ('admin', 'staff')),
            full_name TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS service_categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category_name TEXT NOT NULL,
            base_price REAL DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS services (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category_id INTEGER NOT NULL,
            service_name TEXT NOT NULL,
            price REAL NOT NULL,
            FOREIGN KEY (category_id) REFERENCES service_categories(id)
        );

        CREATE TABLE IF NOT EXISTS photo_frames (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            frame_name TEXT NOT NULL,
            buying_price REAL NOT NULL,
            selling_price REAL NOT NULL,
            quantity INTEGER DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS customers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_name TEXT NOT NULL,
            mobile_number TEXT,
            address TEXT
        );

        CREATE TABLE IF NOT EXISTS bookings (
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
            created_by INTEGER NOT NULL,
            FOREIGN KEY (customer_id) REFERENCES customers(id),
            FOREIGN KEY (created_by) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS expenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            expense_name TEXT NOT NULL,
            price REAL NOT NULL,
            user_name TEXT NOT NULL, -- Expense එක දාන කෙනාගේ නම
            expense_date DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);
  console.log("✔️ Database & Tables Ready!");
};

module.exports = { db, initDatabase };
