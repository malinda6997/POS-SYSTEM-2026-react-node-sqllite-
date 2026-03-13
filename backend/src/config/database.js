const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");

const dataDir = path.join(__dirname, "../../data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

const db = new Database(path.join(dataDir, "shine_art_pro.db"));

const initDatabase = () => {
  db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL CHECK(role IN ('Administrator', 'admin', 'staff')),
            full_name TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
            duration INTEGER,
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
            username TEXT NOT NULL,
            expense_date DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);

  // Seed default admin user if doesn't exist
  try {
    const existingUser = db.prepare("SELECT id FROM users WHERE username = ?").get("admin");
    if (!existingUser) {
      const hashedPassword = bcrypt.hashSync("admin123", 10);
      db.prepare(
        "INSERT INTO users (username, password, role, full_name) VALUES (?, ?, ?, ?)"
      ).run("admin", hashedPassword, "Administrator", "Admin User");
      console.log("✔️ Default admin user created (admin/admin123)");
    }
  } catch (err) {
    console.error("Error seeding user:", err.message);
  }

  // Seed additional staff users
  try {
    const staffCount = db.prepare("SELECT COUNT(*) as count FROM users").get().count;
    if (staffCount === 1) {
      // Only admin exists, add more users
      const hashedPassword = bcrypt.hashSync("password123", 10);
      db.prepare(
        "INSERT INTO users (username, password, role, full_name) VALUES (?, ?, ?, ?)"
      ).run("staff1", hashedPassword, "staff", "John Smith");
      db.prepare(
        "INSERT INTO users (username, password, role, full_name) VALUES (?, ?, ?, ?)"
      ).run("manager1", hashedPassword, "admin", "Sarah Johnson");
      console.log("✔️ Dummy staff users created");
    }
  } catch (err) {
    console.error("Error seeding staff users:", err.message);
  }

  // Seed service categories
  try {
    const catCount = db.prepare("SELECT COUNT(*) as count FROM service_categories").get().count;
    if (catCount === 0) {
      db.prepare("INSERT INTO service_categories (category_name, base_price) VALUES (?, ?)").run("Photography", 5000);
      db.prepare("INSERT INTO service_categories (category_name, base_price) VALUES (?, ?)").run("Videography", 8000);
      db.prepare("INSERT INTO service_categories (category_name, base_price) VALUES (?, ?)").run("Editing", 3000);
      db.prepare("INSERT INTO service_categories (category_name, base_price) VALUES (?, ?)").run("Albums", 2000);
      console.log("✔️ Dummy service categories created");
    }
  } catch (err) {
    console.error("Error seeding categories:", err.message);
  }

  // Seed services
  try {
    const svcCount = db.prepare("SELECT COUNT(*) as count FROM services").get().count;
    if (svcCount === 0) {
      db.prepare("INSERT INTO services (category_id, service_name, price, duration) VALUES (?, ?, ?, ?)").run(1, "Professional Photoshoot", 7500, 480);
      db.prepare("INSERT INTO services (category_id, service_name, price, duration) VALUES (?, ?, ?, ?)").run(1, "Bridal Close-up", 5000, 240);
      db.prepare("INSERT INTO services (category_id, service_name, price, duration) VALUES (?, ?, ?, ?)").run(2, "4K Videography", 12000, 600);
      db.prepare("INSERT INTO services (category_id, service_name, price, duration) VALUES (?, ?, ?, ?)").run(2, "Drone Coverage", 8000, 300);
      db.prepare("INSERT INTO services (category_id, service_name, price, duration) VALUES (?, ?, ?, ?)").run(3, "Photo Editing (50 photos)", 5000, 120);
      db.prepare("INSERT INTO services (category_id, service_name, price, duration) VALUES (?, ?, ?, ?)").run(3, "Video Editing", 4000, 240);
      db.prepare("INSERT INTO services (category_id, service_name, price, duration) VALUES (?, ?, ?, ?)").run(4, "Luxury Album (20 pages)", 8000, 0);
      db.prepare("INSERT INTO services (category_id, service_name, price, duration) VALUES (?, ?, ?, ?)").run(4, "Premium Photo Book", 6000, 0);
      console.log("✔️ Dummy services created");
    }
  } catch (err) {
    console.error("Error seeding services:", err.message);
  }

  // Seed photo frames (inventory)
  try {
    const frameCount = db.prepare("SELECT COUNT(*) as count FROM photo_frames").get().count;
    if (frameCount === 0) {
      db.prepare("INSERT INTO photo_frames (frame_name, buying_price, selling_price, quantity) VALUES (?, ?, ?, ?)").run("Wooden Frame 8x10", 500, 1200, 15);
      db.prepare("INSERT INTO photo_frames (frame_name, buying_price, selling_price, quantity) VALUES (?, ?, ?, ?)").run("Metallic Frame 5x7", 350, 850, 22);
      db.prepare("INSERT INTO photo_frames (frame_name, buying_price, selling_price, quantity) VALUES (?, ?, ?, ?)").run("Glass Frame 12x16", 1200, 2500, 8);
      db.prepare("INSERT INTO photo_frames (frame_name, buying_price, selling_price, quantity) VALUES (?, ?, ?, ?)").run("Acrylic Print 11x14", 800, 1800, 12);
      db.prepare("INSERT INTO photo_frames (frame_name, buying_price, selling_price, quantity) VALUES (?, ?, ?, ?)").run("Canvas Print 16x20", 900, 2200, 10);
      db.prepare("INSERT INTO photo_frames (frame_name, buying_price, selling_price, quantity) VALUES (?, ?, ?, ?)").run("Silver Frame 6x8", 400, 950, 3);
      db.prepare("INSERT INTO photo_frames (frame_name, buying_price, selling_price, quantity) VALUES (?, ?, ?, ?)").run("Black Frame 10x12", 600, 1400, 7);
      db.prepare("INSERT INTO photo_frames (frame_name, buying_price, selling_price, quantity) VALUES (?, ?, ?, ?)").run("Wall Mount Display", 1500, 3500, 5);
      console.log("✔️ Dummy photo frames created");
    }
  } catch (err) {
    console.error("Error seeding frames:", err.message);
  }

  // Seed customers
  try {
    const custCount = db.prepare("SELECT COUNT(*) as count FROM customers").get().count;
    if (custCount === 0) {
      db.prepare("INSERT INTO customers (customer_name, mobile_number, address) VALUES (?, ?, ?)").run("Emma Wilson", "+94-771-234567", "123 Oak Street, Colombo 5");
      db.prepare("INSERT INTO customers (customer_name, mobile_number, address) VALUES (?, ?, ?)").run("James Chen", "+94-772-345678", "456 Elm Avenue, Kandy");
      db.prepare("INSERT INTO customers (customer_name, mobile_number, address) VALUES (?, ?, ?)").run("Sofia Garcia", "+94-773-456789", "789 Maple Lane, Galle");
      db.prepare("INSERT INTO customers (customer_name, mobile_number, address) VALUES (?, ?, ?)").run("Alex Thompson", "+94-774-567890", "321 Pine Road, Colombo 3");
      db.prepare("INSERT INTO customers (customer_name, mobile_number, address) VALUES (?, ?, ?)").run("Maria Santos", "+94-775-678901", "654 Birch Street, Negombo");
      db.prepare("INSERT INTO customers (customer_name, mobile_number, address) VALUES (?, ?, ?)").run("David Kim", "+94-776-789012", "987 Cedar Avenue, Colombo 7");
      db.prepare("INSERT INTO customers (customer_name, mobile_number, address) VALUES (?, ?, ?)").run("Lisa Anderson", "+94-777-890123", "159 Spruce Lane, Colombo 4");
      db.prepare("INSERT INTO customers (customer_name, mobile_number, address) VALUES (?, ?, ?)").run("Michael Brown", "+94-778-901234", "753 Ash Street, Kandy");
      console.log("✔️ Dummy customers created");
    }
  } catch (err) {
    console.error("Error seeding customers:", err.message);
  }

  // Seed bookings
  try {
    const bookCount = db.prepare("SELECT COUNT(*) as count FROM bookings").get().count;
    if (bookCount === 0) {
      const adminId = db.prepare("SELECT id FROM users WHERE username = ?").get("admin").id;
      
      db.prepare("INSERT INTO bookings (customer_id, customer_mobile, customer_address, total_amount, advance_paid, event_date, event_time, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").run(1, "+94-771-234567", "123 Oak Street, Colombo 5", 35000, 15000, "2026-03-25", "18:00", "Pending", adminId);
      db.prepare("INSERT INTO bookings (customer_id, customer_mobile, customer_address, total_amount, advance_paid, event_date, event_time, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").run(2, "+94-772-345678", "456 Elm Avenue, Kandy", 45000, 20000, "2026-04-10", "17:30", "Confirmed", adminId);
      db.prepare("INSERT INTO bookings (customer_id, customer_mobile, customer_address, total_amount, advance_paid, event_date, event_time, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").run(3, "+94-773-456789", "789 Maple Lane, Galle", 55000, 25000, "2026-04-20", "19:00", "Completed", adminId);
      db.prepare("INSERT INTO bookings (customer_id, customer_mobile, customer_address, total_amount, advance_paid, event_date, event_time, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").run(4, "+94-774-567890", "321 Pine Road, Colombo 3", 28000, 10000, "2026-05-05", "18:30", "Pending", adminId);
      db.prepare("INSERT INTO bookings (customer_id, customer_mobile, customer_address, total_amount, advance_paid, event_date, event_time, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").run(5, "+94-775-678901", "654 Birch Street, Negombo", 42000, 20000, "2026-05-15", "17:00", "Confirmed", adminId);
      db.prepare("INSERT INTO bookings (customer_id, customer_mobile, customer_address, total_amount, advance_paid, event_date, event_time, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").run(6, "+94-776-789012", "987 Cedar Avenue, Colombo 7", 38000, 15000, "2026-06-01", "19:30", "Pending", adminId);
      db.prepare("INSERT INTO bookings (customer_id, customer_mobile, customer_address, total_amount, advance_paid, event_date, event_time, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").run(7, "+94-777-890123", "159 Spruce Lane, Colombo 4", 50000, 25000, "2026-06-10", "18:00", "Completed", adminId);
      db.prepare("INSERT INTO bookings (customer_id, customer_mobile, customer_address, total_amount, advance_paid, event_date, event_time, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").run(8, "+94-778-901234", "753 Ash Street, Kandy", 32000, 12000, "2026-06-20", "17:30", "Pending", adminId);
      console.log("✔️ Dummy bookings created");
    }
  } catch (err) {
    console.error("Error seeding bookings:", err.message);
  }

  // Seed expenses
  try {
    const expCount = db.prepare("SELECT COUNT(*) as count FROM expenses").get().count;
    if (expCount === 0) {
      db.prepare("INSERT INTO expenses (expense_name, price, username, expense_date) VALUES (?, ?, ?, ?)").run("Studio Rent", 25000, "admin", "2026-03-01");
      db.prepare("INSERT INTO expenses (expense_name, price, username, expense_date) VALUES (?, ?, ?, ?)").run("Equipment Maintenance", 5000, "admin", "2026-03-05");
      db.prepare("INSERT INTO expenses (expense_name, price, username, expense_date) VALUES (?, ?, ?, ?)").run("Software License", 8000, "admin", "2026-03-08");
      db.prepare("INSERT INTO expenses (expense_name, price, username, expense_date) VALUES (?, ?, ?, ?)").run("Travel & Transportation", 3500, "staff1", "2026-03-10");
      db.prepare("INSERT INTO expenses (expense_name, price, username, expense_date) VALUES (?, ?, ?, ?)").run("Printing & Materials", 4200, "staff1", "2026-03-12");
      db.prepare("INSERT INTO expenses (expense_name, price, username, expense_date) VALUES (?, ?, ?, ?)").run("Props & Backdrop", 6000, "manager1", "2026-03-15");
      db.prepare("INSERT INTO expenses (expense_name, price, username, expense_date) VALUES (?, ?, ?, ?)").run("Lighting Equipment", 12000, "admin", "2026-03-18");
      db.prepare("INSERT INTO expenses (expense_name, price, username, expense_date) VALUES (?, ?, ?, ?)").run("Internet & Phone", 2500, "admin", "2026-03-20");
      console.log("✔️ Dummy expenses created");
    }
  } catch (err) {
    console.error("Error seeding expenses:", err.message);
  }

  console.log("✔️ Database & Tables Ready!");
};

module.exports = { db, initDatabase };
