const { db } = require("../config/database");
const bcrypt = require("bcryptjs");

// Get all users
const getAllUsers = (req, res) => {
  try {
    console.log("GET /users - Fetching all users");
    const stmt = db.prepare("SELECT id, username, full_name, role, is_active, created_at FROM users");
    const results = stmt.all();
    console.log("Users fetched:", results.length);
    res.json(results);
  } catch (err) {
    console.error("getAllUsers Error:", err.message, err.stack);
    res.status(500).json({ message: "Error fetching users: " + err.message });
  }
};

// Get single user
const getUserById = (req, res) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare("SELECT id, username, full_name, role, is_active, created_at FROM users WHERE id = ?");
    const result = stmt.get(id);
    
    if (!result) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(result);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "Error fetching user" });
  }
};

// Create new user
const createUser = (req, res) => {
  try {
    const { username, password, full_name, role } = req.body;

    if (!username || !password || !full_name || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if username exists
    const checkStmt = db.prepare("SELECT id FROM users WHERE username = ?");
    const existing = checkStmt.get(username);

    if (existing) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    const insertStmt = db.prepare(
      "INSERT INTO users (username, password, full_name, role, is_active, created_at) VALUES (?, ?, ?, ?, 1, datetime('now'))"
    );
    const result = insertStmt.run(username, hashedPassword, full_name, role);

    res.status(201).json({
      id: result.lastID,
      username,
      full_name,
      role,
      is_active: 1,
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "Error creating user: " + err.message });
  }
};

// Update user
const updateUser = (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, role, password } = req.body;

    if (!full_name || !role) {
      return res.status(400).json({ message: "Name and role are required" });
    }

    let query = "UPDATE users SET full_name = ?, role = ?";
    let values = [full_name, role];

    if (password && password.trim() !== "") {
      const hashedPassword = bcrypt.hashSync(password, 10);
      query += ", password = ?";
      values.push(hashedPassword);
    }

    query += " WHERE id = ?";
    values.push(id);

    const stmt = db.prepare(query);
    const result = stmt.run(...values);

    if (result.changes === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User updated successfully" });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "Error updating user" });
  }
};

// Disable/Enable user
const toggleUserStatus = (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    if (typeof is_active !== "boolean" && is_active !== 0 && is_active !== 1) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const stmt = db.prepare("UPDATE users SET is_active = ? WHERE id = ?");
    const result = stmt.run(is_active ? 1 : 0, id);

    if (result.changes === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: `User ${is_active ? "enabled" : "disabled"} successfully` });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "Error updating user status" });
  }
};

// Delete user
const deleteUser = (req, res) => {
  try {
    const { id } = req.params;

    const stmt = db.prepare("DELETE FROM users WHERE id = ?");
    const result = stmt.run(id);

    if (result.changes === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "Error deleting user" });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  toggleUserStatus,
  deleteUser,
};
