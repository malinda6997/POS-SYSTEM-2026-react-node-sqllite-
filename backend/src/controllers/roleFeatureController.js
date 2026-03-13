const { db } = require("../config/database");

// Define all available features
const AVAILABLE_FEATURES = [
  { id: "dashboard", label: "Dashboard", icon: "BarChart3" },
  { id: "bookings", label: "Bookings Management", icon: "Calendar" },
  { id: "customers", label: "Customers Management", icon: "Users" },
  { id: "inventory", label: "Inventory Management", icon: "Package" },
  { id: "services", label: "Services Management", icon: "Zap" },
  { id: "expenses", label: "Expenses Management", icon: "TrendingDown" },
  { id: "billing", label: "Billing & Invoices", icon: "FileText" },
  { id: "reports", label: "Reports & Analytics", icon: "BarChart3" },
  { id: "users", label: "Users Management", icon: "Shield" },
  { id: "settings", label: "Settings", icon: "Settings" },
];

// Get all available features
const getAvailableFeatures = (req, res) => {
  res.json(AVAILABLE_FEATURES);
};

// Get features for a specific role
const getRoleFeatures = (req, res) => {
  try {
    const { role } = req.params;

    const stmt = db.prepare("SELECT features FROM role_features WHERE role = ?");
    const result = stmt.get(role);

    if (!result) {
      // Return default features for the role
      const defaultFeatures = getDefaultFeaturesForRole(role);
      return res.json({
        role,
        features: defaultFeatures,
      });
    }

    try {
      const features = JSON.parse(result.features);
      res.json({
        role,
        features,
      });
    } catch (e) {
      console.error("Error parsing features:", e);
      const defaultFeatures = getDefaultFeaturesForRole(role);
      res.status(200).json({
        role,
        features: defaultFeatures,
      });
    }
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "Error fetching role features" });
  }
};

// Get default features for role
const getDefaultFeaturesForRole = (role) => {
  const defaults = {
    Administrator: [
      "dashboard",
      "bookings",
      "customers",
      "inventory",
      "services",
      "expenses",
      "billing",
      "reports",
      "users",
      "settings",
    ],
    admin: ["dashboard", "bookings", "customers", "inventory", "services", "billing", "reports"],
    staff: ["dashboard", "bookings", "customers", "services"],
  };
  return defaults[role] || defaults.staff;
};

// Update features for a specific role
const updateRoleFeatures = (req, res) => {
  try {
    const { role } = req.params;
    const { features } = req.body;

    if (!Array.isArray(features)) {
      return res.status(400).json({ message: "Features must be an array" });
    }

    const featuresJson = JSON.stringify(features);

    // Check if role exists in table
    const checkStmt = db.prepare("SELECT id FROM role_features WHERE role = ?");
    const existing = checkStmt.get(role);

    if (!existing) {
      // Insert new role features
      const insertStmt = db.prepare("INSERT INTO role_features (role, features) VALUES (?, ?)");
      insertStmt.run(role, featuresJson);
      return res.status(201).json({ message: "Role features created successfully", role, features });
    } else {
      // Update existing role features
      const updateStmt = db.prepare("UPDATE role_features SET features = ? WHERE role = ?");
      updateStmt.run(featuresJson, role);
      return res.json({ message: "Role features updated successfully", role, features });
    }
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "Error updating role features" });
  }
};

// Get all role features
const getAllRoleFeatures = (req, res) => {
  try {
    const stmt = db.prepare("SELECT role, features FROM role_features");
    const results = stmt.all();

    const roleFeatures = {};
    results.forEach((row) => {
      try {
        roleFeatures[row.role] = JSON.parse(row.features);
      } catch (e) {
        roleFeatures[row.role] = getDefaultFeaturesForRole(row.role);
      }
    });

    // Add default for roles not in database
    const roles = ["Administrator", "admin", "staff"];
    roles.forEach((role) => {
      if (!roleFeatures[role]) {
        roleFeatures[role] = getDefaultFeaturesForRole(role);
      }
    });

    res.json(roleFeatures);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "Error fetching role features" });
  }
};



module.exports = {
  getAvailableFeatures,
  getRoleFeatures,
  updateRoleFeatures,
  getAllRoleFeatures,
  getDefaultFeaturesForRole,
};
