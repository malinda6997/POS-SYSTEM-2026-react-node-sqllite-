const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController");
const authMiddleware = require("../middleware/authMiddleware");

// Get all customers - Public endpoint for billing form
router.get("/", customerController.getAllCustomers);

// Get customer by ID - Public endpoint
router.get("/:id", customerController.getCustomerById);

// Create new customer - Public endpoint for billing form
router.post("/", customerController.createCustomer);

// Update customer - Public endpoint for billing form
router.put("/:id", customerController.updateCustomer);

// Delete customer - Requires authentication
router.delete("/:id", authMiddleware, customerController.deleteCustomer);

module.exports = router;
