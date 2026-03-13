import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, Users, BookOpen, AlertCircle } from 'lucide-react';
import api from '../utils/api';
import Layout from '../components/Layout';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [pendingTasks, setPendingTasks] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      setError(err.message);
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <div className="text-2xl text-slate-500 dark:text-slate-400">Loading...</div>
        </div>
      </Layout>
    );
  }

  const cards = [
    {
      icon: DollarSign,
      label: 'Total Revenue',
      value: summary?.summary?.total_revenue || 0,
      color: 'from-green-500 to-green-600',
    },
    {
      icon: DollarSign,
      label: 'Total Expenses',
      value: summary?.summary?.total_expenses || 0,
      color: 'from-red-500 to-red-600',
    },
    {
      icon: DollarSign,
      label: 'Net Profit',
      value: summary?.summary?.profit || 0,
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: Users,
      label: 'Total Customers',
      value: summary?.customers?.total || 0,
      color: 'from-purple-500 to-purple-600',
    },
  ];

  const pieData = [
    { name: 'Profit', value: summary?.summary?.profit || 0, fill: '#10b981' },
    { name: 'Expenses', value: summary?.summary?.total_expenses || 0, fill: '#ef4444' },
  ];

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {/* Page Title */}
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Welcome back! Here's your business overview.</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">{card.label}</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                      {typeof card.value === 'number' ? `Rs. ${card.value.toFixed(0)}` : card.value}
                    </p>
                  </div>
                  <div className={`bg-gradient-to-br ${card.color} p-4 rounded-lg`}>
                    <Icon className="text-white" size={32} />
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Revenue vs Expenses</h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Legend />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" />
                <Area type="monotone" dataKey="expenses" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpenses)" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Pie Chart */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Profit Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: Rs. ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `Rs. ${value.toFixed(0)}`} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Pending Tasks */}
        {pendingTasks && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Pending Bookings */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <BookOpen className="text-amber-500 mr-2" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Pending Bookings ({pendingTasks.pending_booking_count})
                </h2>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {pendingTasks.pending_bookings?.length ? (
                  pendingTasks.pending_bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg border-l-4 border-amber-500"
                    >
                      <p className="font-semibold text-slate-900 dark:text-white">{booking.customer_name}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{booking.event_date} at {booking.event_time}</p>
                      <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">Rs. {booking.total_amount}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 dark:text-slate-400">No pending bookings</p>
                )}
              </div>
            </div>

            {/* Low Stock Items */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <AlertCircle className="text-red-500 mr-2" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Low Stock Items ({pendingTasks.low_stock_count})
                </h2>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {pendingTasks.low_stock_frames?.length ? (
                  pendingTasks.low_stock_frames.map((frame) => (
                    <div
                      key={frame.id}
                      className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg border-l-4 border-red-500"
                    >
                      <p className="font-semibold text-slate-900 dark:text-white">{frame.frame_name}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Qty: {frame.quantity}</p>
                      <p className="text-sm font-semibold text-red-600 dark:text-red-400">Value: Rs. {frame.stock_value}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 dark:text-slate-400">All items in stock</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </Layout>
  );
};

export default Dashboard;
