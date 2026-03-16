const express = require("express");
const path = require("path");
const fs = require("fs");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const authMiddleware = require("../middleware/authMiddleware");
const { generateThermalBill, generateProfessionalThermalBill, generateA4Invoice } = require("../utils/pdfService");
const { db } = require("../config/database");

// Get all bookings - PUBLIC
router.get("/", bookingController.getAllBookings);

// Get pending bookings - PUBLIC
router.get("/pending", bookingController.getPendingBookings);

// Generate professional thermal bill - PUBLIC (must be before /:id routes)
router.post("/generate-bill", async (req, res) => {
  try {
    const billData = req.body;
    
    // Validate required fields
    if (!billData.customer_name || !billData.total_amount) {
      return res.status(400).json({
        message: "Customer name and total amount are required!",
      });
    }

    // Set default values
    billData.id = billData.id || 1;
    billData.date = billData.date || new Date();
    billData.services = billData.services || [];

    const filePath = await generateProfessionalThermalBill(billData);
    
    // Return success with file download info
    res.json({
      data: {
        success: true,
        message: "Bill generated successfully!",
        file_path: filePath,
        file_name: path.basename(filePath)
      }
    });
  } catch (err) {
    console.error("Bill generation error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Download bill file - PUBLIC
router.get("/download-bill/:filename", (req, res) => {
  try {
    const filename = req.params.filename;
    // Validate filename to prevent directory traversal
    if (filename.includes("..") || filename.includes("/")) {
      return res.status(400).json({ error: "Invalid filename" });
    }
    
    const { invoicesDir } = require("../utils/pdfService");
    const filepath = path.join(invoicesDir, filename);
    
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: "File not found" });
    }
    
    res.download(filepath);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get booking by ID - PUBLIC
router.get("/:id", bookingController.getBookingById);

// Create new booking - PUBLIC (allows billing form to create bookings without auth)
router.post("/", bookingController.createBooking);

// Update booking - PROTECTED
router.put("/:id", authMiddleware, bookingController.updateBooking);

// Delete booking - PROTECTED
router.delete("/:id", authMiddleware, bookingController.deleteBooking);


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

module.exports = router;
