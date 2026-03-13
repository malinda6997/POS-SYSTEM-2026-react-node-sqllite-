import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, Users, TrendingUp, AlertCircle, CheckCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
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

  const kpiCards = [
    {
      title: 'Total Revenue',
      value: `£${(revenue / 1000).toFixed(1)}k`,
      trend: revenueTrend,
      icon: DollarSign,
      color: 'from-emerald-500 to-teal-600',
    },
    {
      title: 'Active Customers',
      value: summary?.customers?.total || 0,
      trend: customerTrend,
      icon: Users,
      color: 'from-blue-500 to-indigo-600',
    },
    {
      title: 'Net Profit',
      value: `£${(profit / 1000).toFixed(1)}k`,
      trend: 5.3,
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-600',
    },
    {
      title: 'Pending Orders',
      value: pendingTasks?.pending_booking_count || 0,
      trend: -2.1,
      icon: AlertCircle,
      color: 'from-amber-500 to-orange-600',
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
          <button className="mt-4 md:mt-0 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
            Generate Report
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpiCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{card.title}</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{card.value}</p>
                    <div className="flex items-center gap-1 mt-2">
                      {card.trend >= 0 ? (
                        <>
                          <ArrowUpRight size={16} className="text-green-600" />
                          <span className="text-sm font-medium text-green-600">+{card.trend}%</span>
                        </>
                      ) : (
                        <>
                          <ArrowDownRight size={16} className="text-red-600" />
                          <span className="text-sm font-medium text-red-600">{card.trend}%</span>
                        </>
                      )}
                      <span className="text-xs text-gray-500 dark:text-gray-400">vs last month</span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                    <Icon size={24} className="text-white" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Area Chart */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-6 shadow-sm"
          >
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Monthly Performance</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Revenue and expenses overview for the current year</p>
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
                <XAxis dataKey="month" stroke="#9ca3af" className="dark:font-gray-400" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    color: '#000'
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
            className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-6 shadow-sm"
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Key Metrics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Revenue</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">£{(revenue / 1000).toFixed(1)}k</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Expenses</span>
                <span className="font-bold text-red-600 dark:text-red-400">£{(expenses / 1000).toFixed(1)}k</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Net Profit</span>
                <span className="font-bold text-green-600 dark:text-green-400">£{(profit / 1000).toFixed(1)}k</span>
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
                <a href="/bookings" className="text-sm text-blue-600 hover:underline font-medium">View all</a>
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
                        <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded">
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
                <a href="/inventory" className="text-sm text-blue-600 hover:underline font-medium">View all</a>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {pendingTasks.low_stock_frames?.length ? (
                  pendingTasks.low_stock_frames.slice(0, 5).map((frame, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border border-gray-200 dark:border-slate-700 rounded-lg bg-red-50/50 dark:bg-red-900/10">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">{frame.frame_name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Qty: {frame.quantity}</p>
                      </div>
                      <div className="text-right">
                        <AlertCircle size={18} className="text-red-600 inline" />
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
