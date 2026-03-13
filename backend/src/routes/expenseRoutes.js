const express = require("express");
const router = express.Router();
const expenseController = require("../controllers/expenseController");
const authMiddleware = require("../middleware/authMiddleware");

// All routes require authentication
router.use(authMiddleware);

// Get all expenses
router.get("/", expenseController.getAllExpenses);

// Get expenses by date range
router.get("/by-date", expenseController.getExpensesByDateRange);

// Get expenses by user
router.get("/by-user/:user_name", expenseController.getExpensesByUser);

// Get expense summary
router.get("/summary", expenseController.getExpenseSummary);

// Create expense (automatically captures logged-in user)
router.post("/", expenseController.createExpense);

// Update expense
router.put("/:id", expenseController.updateExpense);

// Delete expense
router.delete("/:id", expenseController.deleteExpense);

module.exports = router;
