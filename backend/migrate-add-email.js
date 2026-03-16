const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "data/shine_art_pro.db"));

try {
  // Check if email column already exists
  const tableInfo = db.pragma("table_info(customers)");
  const columnNames = tableInfo.map(col => col.name);
  
  if (!columnNames.includes("email")) {
    console.log("Adding email column to customers table...");
    db.exec("ALTER TABLE customers ADD COLUMN email TEXT");
    console.log("✓ Email column added successfully!");
  } else {
    console.log("✓ Email column already exists!");
  }
  
  db.close();
  console.log("Migration completed successfully!");
} catch (err) {
  console.error("Migration failed:", err.message);
  process.exit(1);
}
