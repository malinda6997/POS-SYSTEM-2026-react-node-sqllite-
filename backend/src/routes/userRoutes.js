const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// Get all users
router.get("/", userController.getAllUsers);

// Get single user
router.get("/:id", userController.getUserById);

// Create new user
router.post("/", userController.createUser);

// Update user
router.put("/:id", userController.updateUser);

// Toggle user status (disable/enable)
router.patch("/:id/status", userController.toggleUserStatus);

// Delete user
router.delete("/:id", userController.deleteUser);

module.exports = router;
