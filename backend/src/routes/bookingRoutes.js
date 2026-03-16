const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const authMiddleware = require("../middleware/authMiddleware");
const { generateThermalBill, generateA4Invoice } = require("../utils/pdfService");
const { db } = require("../config/database");

// Get all bookings - PUBLIC
router.get("/", bookingController.getAllBookings);

// Get pending bookings - PUBLIC
router.get("/pending", bookingController.getPendingBookings);

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
