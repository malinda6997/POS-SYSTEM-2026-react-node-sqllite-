const express = require("express");
const router = express.Router();
const roleFeatureController = require("../controllers/roleFeatureController");

// Get all available features
router.get("/available", roleFeatureController.getAvailableFeatures);

// Get all role features
router.get("/", roleFeatureController.getAllRoleFeatures);

// Get features for specific role
router.get("/:role", roleFeatureController.getRoleFeatures);

// Update features for specific role
router.put("/:role", roleFeatureController.updateRoleFeatures);

module.exports = router;
