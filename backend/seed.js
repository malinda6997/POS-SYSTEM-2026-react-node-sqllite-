const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "data/shine_art_pro.db"));

const seedData = () => {
  // Clear existing data
  db.exec("DELETE FROM services");
  db.exec("DELETE FROM service_categories");

  // Insert Service Categories
  const categories = [
    { category_name: "Photography", base_price: 5000 },
    { category_name: "Videography", base_price: 8000 },
    { category_name: "Editing", base_price: 2000 },
    { category_name: "Printing", base_price: 500 },
  ];

  const insertCategory = db.prepare(
    "INSERT INTO service_categories (category_name, base_price) VALUES (?, ?)"
  );

  let categoryIds = [];
  categories.forEach((cat) => {
    const info = insertCategory.run(cat.category_name, cat.base_price);
    categoryIds.push(info.lastInsertRowid);
  });

  console.log("✓ Categories created:", categoryIds);

  // Insert Services
  const services = [
    { categoryId: categoryIds[0], name: "Portrait Session", price: 5000 },
    { categoryId: categoryIds[0], name: "Family Photoshoot", price: 8000 },
    { categoryId: categoryIds[0], name: "Wedding Photography", price: 20000 },
    { categoryId: categoryIds[1], name: "Event Video", price: 10000 },
    { categoryId: categoryIds[1], name: "Wedding Video", price: 25000 },
    { categoryId: categoryIds[2], name: "Photo Editing", price: 2000 },
    { categoryId: categoryIds[2], name: "Video Editing", price: 5000 },
    { categoryId: categoryIds[3], name: "4x6 Prints", price: 500 },
    { categoryId: categoryIds[3], name: "Canvas Printing", price: 1500 },
  ];

  const insertService = db.prepare(
    "INSERT INTO services (category_id, service_name, price, duration) VALUES (?, ?, ?, ?)"
  );

  services.forEach((svc) => {
    insertService.run(svc.categoryId, svc.name, svc.price, 60);
  });

  console.log("✓ Services created");

  // Insert Sample Customers
  const insertCustomer = db.prepare(
    "INSERT INTO customers (customer_name, mobile_number, address) VALUES (?, ?, ?)"
  );

  const customers = [
    { name: "John Doe", phone: "0771234567", address: "123 Main St, Colombo" },
    { name: "Jane Smith", phone: "0772345678", address: "456 Park Ave, Colombo" },
    { name: "Ahmed Hassan", phone: "0773456789", address: "789 Oak Rd, Colombo" },
    { name: "Maria Garcia", phone: "0774567890", address: "321 Pine St, Colombo" },
  ];

  customers.forEach((cust) => {
    insertCustomer.run(cust.name, cust.phone, cust.address);
  });

  console.log("✓ Sample customers created");
  console.log("\n✅ Database seeded successfully!");
  console.log("You can now use the Billing page with sample data.");

  db.close();
};

try {
  seedData();
} catch (err) {
  console.error("❌ Seeding failed:", err.message);
  process.exit(1);
}
