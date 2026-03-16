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
// Accepts both old format (customer_id, event_date, event_time) and new billing form format
exports.createBooking = (req, res) => {
  const {
    customer_id,
    customer_name,
    customer_mobile,
    mobile_number,
    customer_address,
    address,
    email,
    total_amount,
    advance_paid,
    advance_amount,
    payment_status,
    event_date,
    event_time,
    status,
    services,
  } = req.body;

  // Determine mobile and address (handle both old and new field names)
  const finalMobile = customer_mobile || mobile_number;
  const finalAddress = customer_address || address;
  const finalTotal = total_amount || 0;
  const finalAdvance = advance_paid || (payment_status === 'advance' ? advance_amount : 0) || 0;

  // Validation: mobile_number and address are mandatory
  if (!finalMobile || !finalMobile.trim()) {
    return res.status(400).json({
      message: "Customer mobile number is mandatory for booking!",
    });
  }

  if (!finalAddress || !finalAddress.trim()) {
    return res.status(400).json({
      message: "Customer address is mandatory for booking!",
    });
  }

  if (!finalTotal || finalTotal <= 0) {
    return res.status(400).json({ message: "Valid total amount is required!" });
  }

  try {
    let customerId = customer_id;

    // If customer_id is not provided, try to find or create customer
    if (!customerId) {
      if (!customer_name) {
        return res.status(400).json({ message: "Customer name is required!" });
      }

      // Try to find customer by name and mobile
      const existingCustomer = db
        .prepare("SELECT id FROM customers WHERE customer_name = ? OR mobile_number = ?")
        .get(customer_name, finalMobile);

      if (existingCustomer) {
        customerId = existingCustomer.id;
      } else {
        // Create new customer if doesn't exist
        const insertCustomer = db.prepare(
          "INSERT INTO customers (customer_name, mobile_number, email, address) VALUES (?, ?, ?, ?)"
        );
        const customerResult = insertCustomer.run(customer_name, finalMobile, email || null, finalAddress);
        customerId = customerResult.lastID;
      }
    } else {
      // Verify customer exists
      const customer = db
        .prepare("SELECT id FROM customers WHERE id = ?")
        .get(customerId);

      if (!customer) {
        return res.status(404).json({ message: "Customer not found!" });
      }
    }

    // Use provided date/time or default to today
    const finalDate = event_date || new Date().toISOString().split('T')[0];
    const finalTime = event_time || new Date().toLocaleTimeString('en-US', { hour12: false });
    const finalStatus = status || "Pending";

    const stmt = db.prepare(`
      INSERT INTO bookings 
      (customer_id, customer_mobile, customer_address, total_amount, advance_paid, event_date, event_time, status, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      customerId,
      finalMobile,
      finalAddress,
      finalTotal,
      finalAdvance,
      finalDate,
      finalTime,
      finalStatus,
      req.user?.id || 1  // Default to user 1 if not authenticated
    );

    res.status(201).json({
      data: {
        id: result.lastID,
        customer_id: customerId,
        customer_mobile: finalMobile,
        customer_address: finalAddress,
        total_amount: finalTotal,
        advance_paid: finalAdvance,
        event_date: finalDate,
        event_time: finalTime,
        status: finalStatus,
        booking_date: new Date().toISOString(),
      },
      message: "Bill created successfully!"
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
