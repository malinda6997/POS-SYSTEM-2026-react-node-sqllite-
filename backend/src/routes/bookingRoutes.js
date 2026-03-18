const express = require("express");
const path = require("path");
const fs = require("fs");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const authMiddleware = require("../middleware/authMiddleware");
const { generateThermalBill, generateProfessionalThermalBill, generateA4Invoice, invoicesDir } = require("../utils/pdfService");
const { db } = require("../config/database");

// ========== GET ROUTES ==========
// Get all bookings - PUBLIC
router.get("/", bookingController.getAllBookings);

// Get pending bookings - PUBLIC
router.get("/pending", bookingController.getPendingBookings);

// Download bill file - PUBLIC
router.get("/download-bill/:filename", (req, res) => {
  try {
    const filename = req.params.filename;
    // Validate filename to prevent directory traversal
    if (filename.includes("..") || filename.includes("/")) {
      return res.status(400).json({ error: "Invalid filename" });
    }
    
    const filepath = path.join(invoicesDir, filename);
    
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: "File not found" });
    }
    
    res.download(filepath);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get booking by ID - PUBLIC (MUST come after specific named routes)
router.get("/:id", bookingController.getBookingById);

// ========== POST ROUTES ==========
// Create new booking - PUBLIC
router.post("/", bookingController.createBooking);

// Generate professional thermal bill - PUBLIC
router.post("/generate-bill-now", async (req, res) => {
  try {
    console.log("📄 Bill generation request received");
    const billData = req.body;
    
    // Validate required fields
    if (!billData.customer_name || !billData.total_amount) {
      console.log("❌ Missing required fields:", { customer_name: billData.customer_name, total_amount: billData.total_amount });
      return res.status(400).json({
        data: null,
        message: "Customer name and total amount are required!",
        error: "VALIDATION_ERROR"
      });
    }

    // Validate booking ID
    if (!billData.id) {
      console.log("❌ Booking ID is required");
      return res.status(400).json({
        data: null,
        message: "Booking ID is required!",
        error: "MISSING_BOOKING_ID"
      });
    }

    // Set default values
    billData.date = billData.date || new Date();
    billData.services = billData.services || [];

    console.log("📝 Generating bill for:", billData.customer_name, "Booking ID:", billData.id);
    const filePath = await generateProfessionalThermalBill(billData);
    const fileName = path.basename(filePath);
    console.log("✅ Bill generated at:", filePath);
    
    // Update booking with bill file reference
    try {
      db.prepare(`
        UPDATE bookings 
        SET bill_file_name = ?, bill_generated_at = ? 
        WHERE id = ?
      `).run(fileName, new Date().toISOString(), billData.id);
      console.log("✅ Booking record updated with bill file reference");
    } catch (dbErr) {
      console.error("⚠️ Warning: Could not update booking record:", dbErr.message);
      // Continue anyway - bill was generated successfully
    }
    
    // Return success with file download info
    res.json({
      data: {
        success: true,
        message: "Bill generated successfully!",
        booking_id: billData.id,
        file_path: filePath,
        file_name: fileName
      }
    });
  } catch (err) {
    console.error("❌ Bill generation error:", err);
    res.status(500).json({
      data: null,
      message: "Failed to generate bill",
      error: err.message
    });
  }
});

// Generate thermal bill (80mm format)
router.post("/:id/generate-thermal-bill", async (req, res) => {
  try {
    const booking = db
      .prepare(`
        SELECT 
          b.*,
          c.customer_name
        FROM bookings b
        LEFT JOIN customers c ON b.customer_id = c.id
        WHERE b.id = ?
      `)
      .get(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found!" });
    }

    const filePath = await generateThermalBill(booking);
    res.json({
      message: "Thermal bill generated successfully!",
      file_path: filePath,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generate A4 invoice
router.post("/:id/generate-invoice", async (req, res) => {
  try {
    const booking = db
      .prepare(`
        SELECT 
          b.*,
          c.customer_name
        FROM bookings b
        LEFT JOIN customers c ON b.customer_id = c.id
        WHERE b.id = ?
      `)
      .get(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found!" });
    }

    const filePath = await generateA4Invoice(booking);
    res.json({
      message: "Invoice generated successfully!",
      file_path: filePath,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== PUT ROUTES ==========
// Update booking - PROTECTED
router.put("/:id", authMiddleware, bookingController.updateBooking);

// ========== DELETE ROUTES ==========
// Delete booking - PROTECTED
router.delete("/:id", authMiddleware, bookingController.deleteBooking);

module.exports = router;
