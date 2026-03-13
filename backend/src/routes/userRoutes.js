const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

// Get all users
router.get("/", userController.getAllUsers);

// Get single user
router.get("/:id", userController.getUserById);

// Create new user
router.post("/", userController.createUser);

// Update user profile (protected)
router.put("/profile", authMiddleware, userController.updateUserProfile);

// Update user
router.put("/:id", userController.updateUser);

// Toggle user status (disable/enable)
router.patch("/:id/status", userController.toggleUserStatus);

// Delete user
router.delete("/:id", userController.deleteUser);

module.exports = router;
