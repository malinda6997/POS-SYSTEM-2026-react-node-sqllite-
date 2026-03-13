const { db } = require("../config/database");

// Get all bookings
exports.getAllBookings = (req, res) => {
  try {
    const bookings = db
      .prepare(`
        SELECT 
          b.*,
          c.customer_name,
          u.full_name as staff_name
        FROM bookings b
        LEFT JOIN customers c ON b.customer_id = c.id
        LEFT JOIN users u ON b.created_by = u.id
      `)
      .all();
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get booking by ID
exports.getBookingById = (req, res) => {
  const { id } = req.params;
  try {
    const booking = db
      .prepare(`
        SELECT 
          b.*,
          c.customer_name,
          u.full_name as staff_name
        FROM bookings b
        LEFT JOIN customers c ON b.customer_id = c.id
        LEFT JOIN users u ON b.created_by = u.id
        WHERE b.id = ?
      `)
      .get(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found!" });
    }
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a new booking
// IMPORTANT: mobile_number and address are MANDATORY
exports.createBooking = (req, res) => {
  const {
    customer_id,
    customer_mobile,
    customer_address,
    total_amount,
    advance_paid,
    event_date,
    event_time,
    status,
  } = req.body;

  // Validation: mobile_number and address are mandatory
  if (!customer_mobile || !customer_mobile.trim()) {
    return res.status(400).json({
      message: "Customer mobile number is mandatory for booking!",
    });
  }

  if (!customer_address || !customer_address.trim()) {
    return res.status(400).json({
      message: "Customer address is mandatory for booking!",
    });
  }

  if (!customer_id) {
    return res.status(400).json({ message: "Customer ID is required!" });
  }

  if (!total_amount || total_amount <= 0) {
    return res.status(400).json({ message: "Valid total amount is required!" });
  }

  if (!event_date || !event_time) {
    return res.status(400).json({
      message: "Event date and time are required!",
    });
  }

  try {
    // Verify customer exists
    const customer = db
      .prepare("SELECT id FROM customers WHERE id = ?")
      .get(customer_id);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found!" });
    }

    const stmt = db.prepare(`
      INSERT INTO bookings 
      (customer_id, customer_mobile, customer_address, total_amount, advance_paid, event_date, event_time, status, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      customer_id,
      customer_mobile,
      customer_address,
      total_amount,
      advance_paid || 0,
      event_date,
      event_time,
      status || "Pending",
      req.user.id
    );

    res.status(201).json({
      id: result.lastID,
      customer_id,
      customer_mobile,
      customer_address,
      total_amount,
      advance_paid: advance_paid || 0,
      event_date,
      event_time,
      status: status || "Pending",
      booking_date: new Date().toISOString(),
      created_by: req.user.id,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update booking
exports.updateBooking = (req, res) => {
  const { id } = req.params;
  const {
    customer_mobile,
    customer_address,
    total_amount,
    advance_paid,
    event_date,
    event_time,
    status,
  } = req.body;

  // Validate mandatory fields if updated
  if (customer_mobile !== undefined && (!customer_mobile || !customer_mobile.trim())) {
    return res.status(400).json({
      message: "Customer mobile number cannot be empty!",
    });
  }

  if (customer_address !== undefined && (!customer_address || !customer_address.trim())) {
    return res.status(400).json({
      message: "Customer address cannot be empty!",
    });
  }

  try {
    const updateFields = [];
    const values = [];

    if (customer_mobile !== undefined) {
      updateFields.push("customer_mobile = ?");
      values.push(customer_mobile);
    }
    if (customer_address !== undefined) {
      updateFields.push("customer_address = ?");
      values.push(customer_address);
    }
    if (total_amount !== undefined) {
      updateFields.push("total_amount = ?");
      values.push(total_amount);
    }
    if (advance_paid !== undefined) {
      updateFields.push("advance_paid = ?");
      values.push(advance_paid);
    }
    if (event_date !== undefined) {
      updateFields.push("event_date = ?");
      values.push(event_date);
    }
    if (event_time !== undefined) {
      updateFields.push("event_time = ?");
      values.push(event_time);
    }
    if (status !== undefined) {
      updateFields.push("status = ?");
      values.push(status);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: "No fields to update!" });
    }

    values.push(id);
    const stmt = db.prepare(
      `UPDATE bookings SET ${updateFields.join(", ")} WHERE id = ?`
    );
    stmt.run(...values);

    res.json({ message: "Booking updated successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete booking
exports.deleteBooking = (req, res) => {
  const { id } = req.params;

  try {
    db.prepare("DELETE FROM bookings WHERE id = ?").run(id);
    res.json({ message: "Booking deleted successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get pending bookings
exports.getPendingBookings = (req, res) => {
  try {
    const bookings = db
      .prepare(`
        SELECT 
          b.*,
          c.customer_name,
          u.full_name as staff_name
        FROM bookings b
        LEFT JOIN customers c ON b.customer_id = c.id
        LEFT JOIN users u ON b.created_by = u.id
        WHERE b.status = 'Pending'
        ORDER BY b.event_date ASC
      `)
      .all();
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
