import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Plus, Trash2, TrendingDown } from 'lucide-react';
import Layout from '../components/Layout';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';

const Expenses = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const [newExpense, setNewExpense] = useState({
    expense_name: '',
    price: '',
    expense_date: new Date().toISOString().split('T')[0],
  });

  // Fetch expenses
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [expRes, sumRes] = await Promise.all([
          api.get('/expenses'),
          api.get('/expenses/summary'),
        ]);
        setExpenses(expRes.data || []);
        setSummary(sumRes.data || {});
        setError('');
      } catch (err) {
        setError('Failed to load expenses');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Add new expense
  const handleAddExpense = async () => {
    if (!newExpense.expense_name.trim() || !newExpense.price) {
      setError('Expense name and price are required');
      return;
    }
    try {
      const res = await api.post('/expenses', {
        expense_name: newExpense.expense_name,
        price: parseFloat(newExpense.price),
        expense_date: newExpense.expense_date,
      });
      setExpenses([res.data, ...expenses]);
      setNewExpense({
        expense_name: '',
        price: '',
        expense_date: new Date().toISOString().split('T')[0],
      });
      setShowForm(false);
      setError('');
    } catch (err) {
      setError('Failed to add expense');
      console.error(err);
    }
  };

  // Delete expense
  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      await api.delete(`/expenses/${expenseId}`);
      setExpenses(expenses.filter(e => e.id !== expenseId));
      setError('');
    } catch (err) {
      setError('Failed to delete expense');
      console.error(err);
    }
  };

  // Filter expenses by date range
  const filteredExpenses = expenses.filter(exp => {
    const expDate = exp.expense_date.split('T')[0];
    return expDate >= dateRange.startDate && expDate <= dateRange.endDate;
  });

  const filteredTotal = filteredExpenses.reduce((sum, exp) => sum + (parseFloat(exp.price) || 0), 0);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-slate-400">Loading expenses...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Error Alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-gray-100 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center gap-2 text-gray-700 dark:text-gray-400"
        >
          <AlertCircle size={18} />
          {error}
        </motion.div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-100">Expenses</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-gray-700 dark:bg-gray-600 hover:bg-gray-800 dark:hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition"
        >
          <Plus size={20} /> New Expense
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
          >
            <div className="text-gray-600 dark:text-gray-400 text-sm">Total Expenses</div>
            <div className="text-2xl font-bold text-gray-700 dark:text-gray-300 mt-1">Rs. {summary.total_expenses?.toFixed(2) || '0.00'}</div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">All time</div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
          >
            <div className="text-gray-600 dark:text-gray-400 text-sm">This Month</div>
            <div className="text-2xl font-bold text-gray-700 dark:text-gray-300 mt-1">Rs. {summary.this_month_expenses?.toFixed(2) || '0.00'}</div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">Current month</div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
          >
            <div className="text-gray-600 dark:text-gray-400 text-sm">Date Range Total</div>
            <div className="text-2xl font-bold text-gray-700 dark:text-gray-300 mt-1">Rs. {filteredTotal.toFixed(2)}</div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">{dateRange.startDate} to {dateRange.endDate}</div>
          </motion.div>
        </motion.div>
      )}

      {/* New Expense Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-100 dark:bg-gray-900/30 p-4 rounded-lg mb-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Expense name"
              value={newExpense.expense_name}
              onChange={(e) => setNewExpense({ ...newExpense, expense_name: e.target.value })}
              className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-500"
            />
            <input
              type="number"
              placeholder="Price"
              value={newExpense.price}
              onChange={(e) => setNewExpense({ ...newExpense, price: e.target.value })}
              className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-500"
            />
            <input
              type="date"
              value={newExpense.expense_date}
              onChange={(e) => setNewExpense({ ...newExpense, expense_date: e.target.value })}
              className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div className="text-xs text-slate-400 mt-2">User: {user?.username} (auto-captured)</div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleAddExpense}
              className="bg-gray-700 dark:bg-gray-600 hover:bg-gray-800 dark:hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition"
            >
              Save
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-4 py-2 rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Date Range Filter */}
      <div className="bg-white dark:bg-gray-900/30 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Start Date</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-700"
            />
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {filteredExpenses.length} expenses • Total: <span className="text-gray-700 dark:text-gray-300 font-semibold">Rs. {filteredTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
      >
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <th className="px-4 py-3 text-left text-gray-900 dark:text-white font-semibold">Expense Name</th>
              <th className="px-4 py-3 text-left text-gray-900 dark:text-white font-semibold">Price</th>
              <th className="px-4 py-3 text-left text-gray-900 dark:text-white font-semibold">User</th>
              <th className="px-4 py-3 text-left text-gray-900 dark:text-white font-semibold">Date</th>
              <th className="px-4 py-3 text-center text-gray-900 dark:text-white font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.length > 0 ? (
              filteredExpenses.map((expense, idx) => (
                <motion.tr
                  key={expense.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                >
                  <td className="px-4 py-3 text-gray-900 dark:text-white font-semibold flex items-center gap-2">
                    <TrendingDown size={16} className="text-gray-600 dark:text-gray-400" />
                    {expense.expense_name}
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300 font-semibold">Rs. {parseFloat(expense.price).toFixed(2)}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{expense.username || 'N/A'}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{new Date(expense.expense_date).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleDeleteExpense(expense.id)}
                      className="text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition p-1"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-gray-600 dark:text-gray-400">
                  No expenses in this date range
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </motion.div>
    </Layout>
  );
};

export default Expenses;
