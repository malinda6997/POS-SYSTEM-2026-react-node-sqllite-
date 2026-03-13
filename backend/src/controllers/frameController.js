const { db } = require("../config/database");

// Get all photo frames
exports.getAllFrames = (req, res) => {
  try {
    const frames = db
      .prepare("SELECT * FROM photo_frames ORDER BY frame_name ASC")
      .all();
    res.json(frames);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single frame
exports.getFrameById = (req, res) => {
  const { id } = req.params;
  try {
    const frame = db
      .prepare("SELECT * FROM photo_frames WHERE id = ?")
      .get(id);
    if (!frame) {
      return res.status(404).json({ message: "Frame not found!" });
    }
    res.json(frame);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create new frame
exports.createFrame = (req, res) => {
  const { frame_name, buying_price, selling_price, quantity } = req.body;

  if (!frame_name || !buying_price || !selling_price) {
    return res.status(400).json({
      message: "Frame name, buying price, and selling price are required!",
    });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO photo_frames (frame_name, buying_price, selling_price, quantity)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(frame_name, buying_price, selling_price, quantity || 0);
    res.status(201).json({
      id: result.lastID,
      frame_name,
      buying_price,
      selling_price,
      quantity: quantity || 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update frame details
exports.updateFrame = (req, res) => {
  const { id } = req.params;
  const { frame_name, buying_price, selling_price } = req.body;

  try {
    const stmt = db.prepare(`
      UPDATE photo_frames 
      SET frame_name = ?, buying_price = ?, selling_price = ? 
      WHERE id = ?
    `);
    stmt.run(frame_name, buying_price, selling_price, id);
    res.json({ message: "Frame updated successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add stock to a frame
exports.addStock = (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity <= 0) {
    return res.status(400).json({
      message: "Valid quantity is required!",
    });
  }

  try {
    const frame = db
      .prepare("SELECT quantity FROM photo_frames WHERE id = ?")
      .get(id);

    if (!frame) {
      return res.status(404).json({ message: "Frame not found!" });
    }

    const newQuantity = frame.quantity + quantity;
    const stmt = db.prepare(
      "UPDATE photo_frames SET quantity = ? WHERE id = ?"
    );
    stmt.run(newQuantity, id);

    res.json({
      message: "Stock added successfully!",
      new_quantity: newQuantity,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Sell frame (automatically decrements quantity)
exports.sellFrame = (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity <= 0) {
    return res.status(400).json({
      message: "Valid quantity is required!",
    });
  }

  try {
    const frame = db
      .prepare("SELECT quantity, selling_price FROM photo_frames WHERE id = ?")
      .get(id);

    if (!frame) {
      return res.status(404).json({ message: "Frame not found!" });
    }

    if (frame.quantity < quantity) {
      return res.status(400).json({
        message: `Insufficient stock! Available: ${frame.quantity}, Requested: ${quantity}`,
      });
    }

    const newQuantity = frame.quantity - quantity;
    const totalRevenue = frame.selling_price * quantity;

    const stmt = db.prepare(
      "UPDATE photo_frames SET quantity = ? WHERE id = ?"
    );
    stmt.run(newQuantity, id);

    res.json({
      message: "Frame sold successfully!",
      quantity_sold: quantity,
      new_quantity: newQuantity,
      unit_price: frame.selling_price,
      total_revenue: totalRevenue,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete frame
exports.deleteFrame = (req, res) => {
  const { id } = req.params;

  try {
    db.prepare("DELETE FROM photo_frames WHERE id = ?").run(id);
    res.json({ message: "Frame deleted successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get inventory summary (low stock alert)
exports.getInventorySummary = (req, res) => {
  try {
    const lowStockThreshold = req.query.threshold || 5;
    
    const summary = db
      .prepare(`
        SELECT 
          id,
          frame_name,
          quantity,
          buying_price,
          selling_price,
          (selling_price - buying_price) as profit_per_unit,
          (quantity * selling_price) as total_value,
          CASE 
            WHEN quantity <= ? THEN 'Low Stock'
            WHEN quantity = 0 THEN 'Out of Stock'
            ELSE 'In Stock'
          END as status
        FROM photo_frames
        ORDER BY quantity ASC
      `)
      .all(lowStockThreshold);

    const totalInventoryValue = summary.reduce((sum, frame) => sum + (frame.total_value || 0), 0);

    res.json({
      frames: summary,
      total_frames: summary.length,
      total_inventory_value: totalInventoryValue,
      low_stock_count: summary.filter(f => f.status === 'Low Stock').length,
      out_of_stock_count: summary.filter(f => f.status === 'Out of Stock').length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
