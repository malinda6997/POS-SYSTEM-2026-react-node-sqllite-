const express = require("express");
const router = express.Router();
const frameController = require("../controllers/frameController");
const authMiddleware = require("../middleware/authMiddleware");

// All routes require authentication
router.use(authMiddleware);

// Get all frames
router.get("/", frameController.getAllFrames);

// Get frame by ID
router.get("/:id", frameController.getFrameById);

// Get inventory summary with low stock alerts
router.get("/summary/overview", frameController.getInventorySummary);

// Create new frame
router.post("/", frameController.createFrame);

// Update frame details
router.put("/:id", frameController.updateFrame);

// Add stock to a frame
router.post("/:id/add-stock", frameController.addStock);

// Sell frame (automatically decrements quantity)
router.post("/:id/sell", frameController.sellFrame);

// Delete frame
router.delete("/:id", frameController.deleteFrame);

module.exports = router;
