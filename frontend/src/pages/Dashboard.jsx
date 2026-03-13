import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, Users, TrendingUp, AlertCircle, CheckCircle, ArrowUpRight, ArrowDownRight, ShoppingCart, Award } from 'lucide-react';
import api from '../utils/api';
import Layout from '../components/Layout';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [pendingTasks, setPendingTasks] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [summaryRes, monthlyRes, tasksRes] = await Promise.all([
        api.get('/dashboard/summary'),
        api.get('/dashboard/monthly-analytics'),
        api.get('/dashboard/pending-tasks'),
      ]);

      setSummary(summaryRes.data);
      setMonthlyData(monthlyRes.data.data || []);
      setPendingTasks(tasksRes.data);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-96">
          <div className="text-gray-500 dark:text-gray-400">Loading...</div>
        </div>
      </Layout>
    );
  }

  const revenue = summary?.summary?.total_revenue || 0;
  const expenses = summary?.summary?.total_expenses || 0;
  const profit = summary?.summary?.profit || 0;
  const revenueTrend = 12.5;
  const customerTrend = 8.2;
  const totalBills = summary?.total_bills || 0;
  const totalInvoices = summary?.total_invoices || 0;

  const kpiCards = [
    {
      title: 'Total Revenue',
      value: `$${(revenue / 1000).toFixed(1)}k`,
      trend: revenueTrend,
      icon: DollarSign,
      color: 'bg-gray-700',
    },
    {
      title: 'Total Customers',
      value: summary?.customers?.total || 0,
      trend: customerTrend,
      icon: Users,
      color: 'bg-gray-700',
    },
    {
      title: 'Net Profit',
      value: `$${(profit / 1000).toFixed(1)}k`,
      trend: 5.3,
      icon: TrendingUp,
      color: 'bg-gray-700',
    },
    {
      title: 'Total Transactions',
      value: totalBills + totalInvoices,
      trend: 3.2,
      icon: ShoppingCart,
      color: 'bg-gray-700',
    },
    {
      title: 'Avg Order Value',
      value: totalBills + totalInvoices > 0 ? `$${((revenue / (totalBills + totalInvoices)) || 0).toFixed(0)}` : '$0',
      trend: 1.5,
      icon: Award,
      color: 'bg-gray-700',
    },
    {
      title: 'Pending Orders',
      value: pendingTasks?.pending_booking_count || 0,
      trend: -2.1,
      icon: AlertCircle,
      color: 'bg-gray-700',
    },
  ];

  return (
    <Layout>
      <div className="space-y-8 p-6">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome back! Here's what's happening today.</p>
          </div>
          <button className="mt-4 md:mt-0 px-4 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-800 transition dark:bg-gray-600 dark:hover:bg-gray-700">
            Generate Report
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {kpiCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-5 shadow-sm hover:shadow-md transition lg:col-span-2 md:col-span-1"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">{card.title}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{card.value}</p>
                    <div className="flex items-center gap-1 mt-2">
                      {card.trend >= 0 ? (
                        <>
                          <ArrowUpRight size={14} className="text-gray-600 dark:text-gray-400" />
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">+{card.trend}%</span>
                        </>
                      ) : (
                        <>
                          <ArrowDownRight size={14} className="text-gray-600 dark:text-gray-400" />
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{card.trend}%</span>
                        </>
                      )}
                      <span className="text-xs text-gray-500 dark:text-gray-400">vs month</span>
                    </div>
                  </div>
                  <div className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={20} className="text-white" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Area Chart */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 shadow-sm"
          >
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Revenue Trend</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Monthly performance overview</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData || []}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-slate-700" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #4b5563',
                    borderRadius: '8px',
                    color: '#fff'
                  }} 
                />
                <Legend />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="url(#colorRevenue)" name="Revenue" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Stats Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 shadow-sm lg:col-span-2"
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Key Metrics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg border border-gray-200 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Revenue</span>
                <span className="font-bold text-gray-900 dark:text-white">${(revenue / 1000).toFixed(1)}k</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg border border-gray-200 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Expenses</span>
                <span className="font-bold text-gray-900 dark:text-white">${(expenses / 1000).toFixed(1)}k</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg border border-gray-200 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Net Profit</span>
                <span className="font-bold text-gray-900 dark:text-white">${(profit / 1000).toFixed(1)}k</span>
              </div>
              <div className="border-t border-gray-200 dark:border-slate-700 pt-4 mt-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  Profit Margin: {revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : 0}%
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Additional Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart for Transactions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 shadow-sm"
          >
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Transaction Summary</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Bills vs Invoices comparison</p>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={[
                  { name: 'Bills', count: totalBills, amount: revenue * 0.4 },
                  { name: 'Invoices', count: totalInvoices, amount: revenue * 0.6 },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-slate-700" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #4b5563',
                    borderRadius: '8px',
                    color: '#fff'
                  }} 
                />
                <Legend />
                <Bar dataKey="count" fill="#4b5563" name="Count" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Expense Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 shadow-sm"
          >
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Financial Overview</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Revenue distribution</p>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Revenue', value: revenue },
                    { name: 'Expenses', value: expenses },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#6b7280" />
                  <Cell fill="#9ca3af" />
                </Pie>
                <Tooltip formatter={(value) => `$${(value / 1000).toFixed(1)}k`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex gap-4 justify-center mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-600"></div>
                <span className="text-gray-600 dark:text-gray-400">Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                <span className="text-gray-600 dark:text-gray-400">Expenses</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Activity & Pending Tasks */}
        {pendingTasks && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending Bookings */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Orders</h3>
                <a href="/bookings" className="text-sm text-gray-700 dark:text-gray-300 hover:underline font-medium">View all</a>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {pendingTasks.pending_bookings?.length ? (
                  pendingTasks.pending_bookings.slice(0, 5).map((booking, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border border-gray-200 dark:border-slate-700 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">{booking.customer_name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{booking.event_date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 dark:text-white">£{(booking.total_amount / 100).toFixed(2)}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                          Pending
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No pending orders</p>
                )}
              </div>
            </motion.div>

            {/* Low Stock Items */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Low Stock Items</h3>
                <a href="/inventory" className="text-sm text-gray-700 dark:text-gray-300 hover:underline font-medium">View all</a>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {pendingTasks.low_stock_frames?.length ? (
                  pendingTasks.low_stock_frames.slice(0, 5).map((frame, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-gray-900/30">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">{frame.frame_name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Qty: {frame.quantity}</p>
                      </div>
                      <div className="text-right">
                        <AlertCircle size={18} className="text-gray-600 dark:text-gray-400 inline" />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">All items in stock</p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
