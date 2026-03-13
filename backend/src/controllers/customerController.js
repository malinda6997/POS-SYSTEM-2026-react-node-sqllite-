const { db } = require("../config/database");

// Get all customers
exports.getAllCustomers = (req, res) => {
  try {
    const customers = db
      .prepare("SELECT * FROM customers")
      .all();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get customer by ID
exports.getCustomerById = (req, res) => {
  const { id } = req.params;
  try {
    const customer = db
      .prepare("SELECT * FROM customers WHERE id = ?")
      .get(id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found!" });
    }
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a new customer
exports.createCustomer = (req, res) => {
  const { customer_name, mobile_number, address } = req.body;

  if (!customer_name) {
    return res.status(400).json({ message: "Customer name is required!" });
  }

  try {
    const stmt = db.prepare(
      "INSERT INTO customers (customer_name, mobile_number, address) VALUES (?, ?, ?)"
    );
    const result = stmt.run(customer_name, mobile_number || null, address || null);
    res.status(201).json({
      id: result.lastID,
      customer_name,
      mobile_number: mobile_number || null,
      address: address || null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update customer
exports.updateCustomer = (req, res) => {
  const { id } = req.params;
  const { customer_name, mobile_number, address } = req.body;

  try {
    const stmt = db.prepare(
      "UPDATE customers SET customer_name = ?, mobile_number = ?, address = ? WHERE id = ?"
    );
    stmt.run(customer_name, mobile_number || null, address || null, id);
    res.json({ message: "Customer updated successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete customer
exports.deleteCustomer = (req, res) => {
  const { id } = req.params;

  try {
    // Check if customer has bookings
    const booking = db
      .prepare("SELECT id FROM bookings WHERE customer_id = ?")
      .get(id);

    if (booking) {
      return res.status(400).json({
        message: "Cannot delete customer with existing bookings!",
      });
    }

    db.prepare("DELETE FROM customers WHERE id = ?").run(id);
    res.json({ message: "Customer deleted successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
