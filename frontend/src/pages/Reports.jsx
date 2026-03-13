import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Download, TrendingUp, Users, DollarSign, PieChart } from 'lucide-react';
import Layout from '../components/Layout';
import api from '../utils/api';
import { formatLKR, formatLKRShort } from '../utils/currency';

const Reports = () => {
  const [reportType, setReportType] = useState('financial');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statsData, setStatsData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReportData();
  }, [reportType]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const [billsRes, invoicesRes, expensesRes, customersRes] = await Promise.all([
        api.get('/bookings'),
        api.get('/invoices'),
        api.get('/expenses'),
        api.get('/customers'),
      ]);

      const bills = billsRes.data.data || [];
      const invoices = invoicesRes.data.data || [];
      const expenses = expensesRes.data.data || [];
      const customers = customersRes.data.data || [];

      setStatsData({
        totalBills: bills.length,
        billAmount: bills.reduce((sum, b) => sum + (b.total_amount || b.amount || 0), 0),
        totalInvoices: invoices.length,
        invoiceAmount: invoices.reduce((sum, i) => sum + (i.total_amount || i.amount || 0), 0),
        totalExpenses: expenses.reduce((sum, e) => sum + (e.amount || 0), 0),
        expenseCount: expenses.length,
        totalCustomers: customers.length,
        registeredCustomers: customers.filter((c) => c.is_registered).length,
      });
    } catch (err) {
      console.error('Error fetching report data:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = () => {
    alert('Report generation feature coming soon! PDF export will download the selected report.');
  };

  const reportTypes = [
    { id: 'financial', name: 'Financial Report', icon: DollarSign, color: 'from-gray-600 to-gray-700' },
    { id: 'executive', name: 'Executive Report', icon: TrendingUp, color: 'from-purple-600 to-pink-600' },
    { id: 'staff', name: 'Staff Report', icon: Users, color: 'from-green-600 to-emerald-600' },
    { id: 'expense', name: 'Expense Report', icon: BarChart3, color: 'from-red-600 to-orange-600' },
  ];

  const selectedReport = reportTypes.find((r) => r.id === reportType);
  const SelectedIcon = selectedReport?.icon;

  return (
    <Layout>
      <div className="space-y-6 p-6 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Generate comprehensive business reports</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={generateReport}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition font-medium shadow-lg"
          >
            <Download size={20} />
            Export PDF
          </motion.button>
        </motion.div>

        {/* Report Type Selection */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          {reportTypes.map((report) => {
            const Icon = report.icon;
            const isSelected = reportType === report.id;
            return (
              <motion.button
                key={report.id}
                onClick={() => setReportType(report.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 rounded-xl transition ${ isSelected ? `bg-gradient-to-br ${report.color} text-white shadow-lg` : 'bg-black dark:bg-black text-white border border-gray-800 hover:border-gray-700 dark:hover:border-gray-700'}`}
              >
                <Icon size={24} className="mx-auto mb-2" />
                <p className="font-semibold text-sm">{report.name}</p>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Date Range Filter */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex flex-col md:flex-row gap-4 bg-black dark:bg-black p-6 rounded-xl shadow-lg border border-gray-800"
        >
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">From Date</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-500 transition"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">To Date</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-500 transition"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchReportData}
              className="px-6 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition font-medium"
            >
              Refresh
            </button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {/* Bills Card */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Bills</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{statsData.totalBills || 0}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{formatLKR(statsData.billAmount || 0)}</p>
              </div>
              <div className="p-3 bg-gray-100 dark:bg-gray-900/20 rounded-lg">
                <BarChart3 size={24} className="text-gray-600 dark:text-gray-400" />
              </div>
            </div>
          </div>

          {/* Invoices Card */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Invoices</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{statsData.totalInvoices || 0}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{formatLKR(statsData.invoiceAmount || 0)}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <DollarSign size={24} className="text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          {/* Expenses Card */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Expenses</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{statsData.expenseCount || 0}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{formatLKR(statsData.totalExpenses || 0)}</p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <TrendingUp size={24} className="text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>

          {/* Customers Card */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Customers</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{statsData.totalCustomers || 0}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {statsData.registeredCustomers || 0} Registered
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Users size={24} className="text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Profit/Loss Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-gray-600 to-gray-700 rounded-xl p-8 shadow-lg text-white"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <p className="text-gray-200 text-sm font-medium">Total Revenue</p>
              <p className="text-4xl font-bold mt-2">
                {formatLKR((statsData.billAmount || 0) + (statsData.invoiceAmount || 0))}
              </p>
            </div>
            <div>
              <p className="text-gray-200 text-sm font-medium">Total Expenses</p>
              <p className="text-4xl font-bold mt-2">{formatLKR(statsData.totalExpenses || 0)}</p>
            </div>
            <div>
              <p className="text-gray-200 text-sm font-medium">Net Profit/Loss</p>
              <p className={`text-4xl font-bold mt-2 ${
                ((statsData.billAmount || 0) + (statsData.invoiceAmount || 0) - (statsData.totalExpenses || 0)) >= 0
                  ? 'text-green-300'
                  : 'text-red-300'
              }`}>
                {formatLKR((statsData.billAmount || 0) + (statsData.invoiceAmount || 0) - (statsData.totalExpenses || 0))}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Report Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="border border-gray-200 dark:border-gray-700 rounded-xl p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            {SelectedIcon && <SelectedIcon size={28} className="text-gray-600 dark:text-gray-400" />}
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedReport?.name}</h2>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">Loading report data...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border-l-4 border-gray-500 pl-4">
                <p className="text-gray-600 dark:text-gray-400 text-sm">Transactions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {statsData.totalBills + statsData.totalInvoices}
                </p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <p className="text-gray-600 dark:text-gray-400 text-sm">Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  ${((statsData.billAmount || 0) + (statsData.invoiceAmount || 0)).toFixed(2)}
                </p>
              </div>
              <div className="border-l-4 border-purple-500 pl-4">
                <p className="text-gray-600 dark:text-gray-400 text-sm">Expenses</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  ${(statsData.totalExpenses || 0).toFixed(2)}
                </p>
              </div>
              <div className="border-l-4 border-orange-500 pl-4">
                <p className="text-gray-600 dark:text-gray-400 text-sm">Customers</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {statsData.totalCustomers}
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
};

export default Reports;
