const express = require("express");
const router = express.Router();
const serviceController = require("../controllers/serviceController");
const authMiddleware = require("../middleware/authMiddleware");

// All routes require authentication
router.use(authMiddleware);

// ===== SERVICE CATEGORIES =====

// Get all service categories
router.get("/categories", serviceController.getAllServiceCategories);

// Create service category
router.post("/categories", serviceController.createServiceCategory);

// Update service category
router.put("/categories/:id", serviceController.updateServiceCategory);

// Delete service category
router.delete("/categories/:id", serviceController.deleteServiceCategory);

// ===== SERVICES =====

// Get all services
router.get("/", serviceController.getAllServices);

// Get services by category
router.get("/category/:category_id", serviceController.getServicesByCategory);

// Create service
router.post("/", serviceController.createService);

// Update service
router.put("/:id", serviceController.updateService);

// Delete service
router.delete("/:id", serviceController.deleteService);

module.exports = router;
