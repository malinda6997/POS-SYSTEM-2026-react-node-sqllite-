const { db } = require("../config/database");

// ===== SERVICE CATEGORIES =====

// Get all service categories
exports.getAllServiceCategories = (req, res) => {
  try {
    const categories = db
      .prepare("SELECT * FROM service_categories")
      .all();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create service category
exports.createServiceCategory = (req, res) => {
  const { category_name, base_price } = req.body;

  if (!category_name) {
    return res.status(400).json({ message: "Category name is required!" });
  }

  try {
    const stmt = db.prepare(
      "INSERT INTO service_categories (category_name, base_price) VALUES (?, ?)"
    );
    const result = stmt.run(category_name, base_price || 0);
    res.status(201).json({
      id: result.lastID,
      category_name,
      base_price: base_price || 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update service category
exports.updateServiceCategory = (req, res) => {
  const { id } = req.params;
  const { category_name, base_price } = req.body;

  try {
    const stmt = db.prepare(
      "UPDATE service_categories SET category_name = ?, base_price = ? WHERE id = ?"
    );
    stmt.run(category_name, base_price, id);
    res.json({ message: "Category updated successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete service category
exports.deleteServiceCategory = (req, res) => {
  const { id } = req.params;

  try {
    // Check if category has services
    const service = db
      .prepare("SELECT id FROM services WHERE category_id = ?")
      .get(id);

    if (service) {
      return res.status(400).json({
        message: "Cannot delete category with existing services!",
      });
    }

    db.prepare("DELETE FROM service_categories WHERE id = ?").run(id);
    res.json({ message: "Category deleted successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ===== SERVICES =====

// Get all services
exports.getAllServices = (req, res) => {
  try {
    const services = db
      .prepare(`
        SELECT 
          s.*,
          sc.category_name
        FROM services s
        LEFT JOIN service_categories sc ON s.category_id = sc.id
      `)
      .all();
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get services by category
exports.getServicesByCategory = (req, res) => {
  const { category_id } = req.params;
  try {
    const services = db
      .prepare(`
        SELECT 
          s.*,
          sc.category_name
        FROM services s
        LEFT JOIN service_categories sc ON s.category_id = sc.id
        WHERE s.category_id = ?
      `)
      .all(category_id);
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create service
exports.createService = (req, res) => {
  const { category_id, service_name, price } = req.body;

  if (!category_id || !service_name || !price) {
    return res.status(400).json({
      message: "Category ID, service name, and price are required!",
    });
  }

  try {
    // Verify category exists
    const category = db
      .prepare("SELECT id FROM service_categories WHERE id = ?")
      .get(category_id);

    if (!category) {
      return res.status(404).json({ message: "Category not found!" });
    }

    const stmt = db.prepare(
      "INSERT INTO services (category_id, service_name, price) VALUES (?, ?, ?)"
    );
    const result = stmt.run(category_id, service_name, price);
    res.status(201).json({
      id: result.lastID,
      category_id,
      service_name,
      price,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update service
exports.updateService = (req, res) => {
  const { id } = req.params;
  const { service_name, price } = req.body;

  try {
    const stmt = db.prepare(
      "UPDATE services SET service_name = ?, price = ? WHERE id = ?"
    );
    stmt.run(service_name, price, id);
    res.json({ message: "Service updated successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete service
exports.deleteService = (req, res) => {
  const { id } = req.params;

  try {
    db.prepare("DELETE FROM services WHERE id = ?").run(id);
    res.json({ message: "Service deleted successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
