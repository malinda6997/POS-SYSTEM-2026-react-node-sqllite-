const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const authMiddleware = require("../middleware/authMiddleware");

// All routes require authentication
router.use(authMiddleware);

// Get dashboard summary
router.get("/summary", dashboardController.getDashboardSummary);

// Get monthly revenue vs expenses (for chart)
router.get("/monthly-analytics", dashboardController.getMonthlyRevenuExpenses);

// Get service category revenue
router.get("/service-revenue", dashboardController.getServiceCategoryRevenue);

// Get frame sales overview
router.get("/frame-sales", dashboardController.getFrameSalesOverview);

// Get pending tasks/bookings
router.get("/pending-tasks", dashboardController.getPendingTasks);

// Get customer statistics
router.get("/customer-stats", dashboardController.getCustomerStatistics);

// Get booking status distribution
router.get("/booking-distribution", dashboardController.getBookingStatusDistribution);

module.exports = router;
