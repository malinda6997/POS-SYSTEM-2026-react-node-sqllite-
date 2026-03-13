const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { initDatabase } = require("./config/database");
require("dotenv").config();

dotenv.config();
const app = express();
app.use(cors());

// Increase payload size limit to 50MB for avatar uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

initDatabase();

// ===== PUBLIC ROUTES (No Authentication Required) =====
app.use("/api/auth", require("./routes/authRoutes"));

// ===== PROTECTED ROUTES (Authentication Required) =====
app.use("/api/customers", require("./routes/customerRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/services", require("./routes/serviceRoutes"));
app.use("/api/frames", require("./routes/frameRoutes"));
app.use("/api/expenses", require("./routes/expenseRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/role-features", require("./routes/roleFeatureRoutes"));

// ===== HEALTH CHECK =====
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Shine Art Studio POS System is running!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server on http://localhost:${PORT}`);
});
