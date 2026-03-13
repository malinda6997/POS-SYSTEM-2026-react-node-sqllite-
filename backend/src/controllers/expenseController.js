const { db } = require("../config/database");

// Get all expenses
exports.getAllExpenses = (req, res) => {
  try {
    const expenses = db
      .prepare("SELECT * FROM expenses ORDER BY expense_date DESC")
      .all();
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get expenses by date range
exports.getExpensesByDateRange = (req, res) => {
  const { start_date, end_date } = req.query;

  if (!start_date || !end_date) {
    return res.status(400).json({
      message: "start_date and end_date query parameters are required!",
    });
  }

  try {
    const expenses = db
      .prepare(`
        SELECT * FROM expenses 
        WHERE DATE(expense_date) BETWEEN ? AND ?
        ORDER BY expense_date DESC
      `)
      .all(start_date, end_date);
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get expenses by user
exports.getExpensesByUser = (req, res) => {
  const { user_name } = req.params;

  try {
    const expenses = db
      .prepare(`
        SELECT * FROM expenses 
        WHERE user_name = ?
        ORDER BY expense_date DESC
      `)
      .all(user_name);
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create expense
// IMPORTANT: User name is automatically captured from JWT token
exports.createExpense = (req, res) => {
  const { expense_name, price } = req.body;

  if (!expense_name || !price) {
    return res.status(400).json({
      message: "Expense name and price are required!",
    });
  }

  if (price <= 0) {
    return res.status(400).json({
      message: "Price must be greater than 0!",
    });
  }

  try {
    // Get full_name from the logged-in user
    const user = db
      .prepare("SELECT full_name FROM users WHERE id = ?")
      .get(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    const stmt = db.prepare(
      "INSERT INTO expenses (expense_name, price, user_name, expense_date) VALUES (?, ?, ?, CURRENT_TIMESTAMP)"
    );
    const result = stmt.run(expense_name, price, user.full_name);

    res.status(201).json({
      id: result.lastID,
      expense_name,
      price,
      user_name: user.full_name,
      expense_date: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update expense
exports.updateExpense = (req, res) => {
  const { id } = req.params;
  const { expense_name, price } = req.body;

  try {
    const stmt = db.prepare(
      "UPDATE expenses SET expense_name = ?, price = ? WHERE id = ?"
    );
    stmt.run(expense_name, price, id);
    res.json({ message: "Expense updated successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete expense
exports.deleteExpense = (req, res) => {
  const { id } = req.params;

  try {
    db.prepare("DELETE FROM expenses WHERE id = ?").run(id);
    res.json({ message: "Expense deleted successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get expense summary for a date range
exports.getExpenseSummary = (req, res) => {
  const { start_date, end_date } = req.query;

  let query = "SELECT * FROM expenses";
  const params = [];

  if (start_date && end_date) {
    query += " WHERE DATE(expense_date) BETWEEN ? AND ?";
    params.push(start_date, end_date);
  }

  try {
    const expenses = db.prepare(query).all(...params);

    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.price, 0);
    const expensesByUser = {};
    const expensesByName = {};

    expenses.forEach((exp) => {
      expensesByUser[exp.user_name] = (expensesByUser[exp.user_name] || 0) + exp.price;
      expensesByName[exp.expense_name] = (expensesByName[exp.expense_name] || 0) + exp.price;
    });

    res.json({
      total_expenses: totalExpenses,
      expense_count: expenses.length,
      expenses_by_user: expensesByUser,
      expenses_by_type: expensesByName,
      date_range: start_date && end_date ? { start: start_date, end: end_date } : "All time",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
