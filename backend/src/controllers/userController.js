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
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    // Check if username exists
    const checkStmt = db.prepare("SELECT id FROM users WHERE username = ?");
    const existing = checkStmt.get(username);

    if (existing) {
      return res.status(400).json({ message: "This username is already registered in the system" });
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
      return res.status(400).json({ message: "Name and role are mandatory" });
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

// Update user profile (for logged-in users)
const updateUserProfile = (req, res) => {
  try {
    console.log("=== UPDATE PROFILE START ===");
    console.log("updateUserProfile - req.user:", req.user);
    console.log("updateUserProfile - req.body:", req.body);
    
    const userId = req.user?.id; // From auth middleware

    if (!userId) {
      console.log("updateUserProfile - No userId found in TOKEN");
      return res.status(401).json({ message: "Unauthorized - No user ID found in token" });
    }

    const { first_name, last_name, email, bio, avatar } = req.body;
    console.log("updateUserProfile - Extracted fields:", { first_name, last_name, email, bio, avatar });

    let query = "UPDATE users SET ";
    let values = [];
    let updates = [];

    // Build UPDATE query dynamically based on provided fields
    if (first_name !== undefined && first_name !== null) {
      updates.push("first_name = ?");
      values.push(first_name);
      console.log("Adding first_name to update");
    }
    if (last_name !== undefined && last_name !== null) {
      updates.push("last_name = ?");
      values.push(last_name);
      console.log("Adding last_name to update");
    }
    if (email !== undefined && email !== null) {
      updates.push("email = ?");
      values.push(email);
      console.log("Adding email to update");
    }
    if (bio !== undefined && bio !== null) {
      updates.push("bio = ?");
      values.push(bio);
      console.log("Adding bio to update");
    }
    if (avatar !== undefined && avatar !== null) {
      updates.push("avatar = ?");
      values.push(avatar);
      console.log("Adding avatar to update");
    }

    if (updates.length === 0) {
      console.log("updateUserProfile - No fields provided for update");
      return res.status(400).json({ message: "No fields to update" });
    }

    query += updates.join(", ");
    query += " WHERE id = ?";
    values.push(userId);

    console.log("updateUserProfile - Final Query:", query);
    console.log("updateUserProfile - Final Values:", values);

    const stmt = db.prepare(query);
    const result = stmt.run(...values);

    console.log("updateUserProfile - DB Result:", result);

    if (result.changes === 0) {
      console.log("updateUserProfile - User not found with ID:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch updated user data
    const updatedUser = db.prepare(
      "SELECT id, username, first_name, last_name, email, full_name, role, bio, avatar FROM users WHERE id = ?"
    ).get(userId);

    console.log("updateUserProfile - Updated user:", updatedUser);
    console.log("=== UPDATE PROFILE END (SUCCESS) ===");

    res.json({ 
      message: "Profile updated successfully", 
      user: updatedUser 
    });
  } catch (err) {
    console.error("=== UPDATE PROFILE ERROR ===");
    console.error("Error message:", err.message);
    console.error("Error stack:", err.stack);
    res.status(500).json({ message: "Error updating profile: " + err.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  toggleUserStatus,
  deleteUser,
  updateUserProfile,
};
