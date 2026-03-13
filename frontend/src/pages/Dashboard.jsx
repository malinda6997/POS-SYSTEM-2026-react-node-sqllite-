import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, Users, TrendingUp, AlertCircle, CheckCircle, ArrowUpRight, ArrowDownRight, ShoppingCart, Award } from 'lucide-react';
import api from '../utils/api';
import { formatLKR, formatLKRShort } from '../utils/currency';
import Layout from '../components/Layout';
import CustomTooltip from '../components/CustomTooltip';
import '../styles/lightning.css';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [pendingTasks, setPendingTasks] = useState(null);
  const [loading, setLoading] = useState(true);
  const [animationKey, setAnimationKey] = useState(0); // Trigger animations on data refresh

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
      setAnimationKey(prev => prev + 1); // Trigger animation restart
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

  // Sample sparkline data for each metric
  const sparklineData = [
    [{ value: 30 }, { value: 45 }, { value: 35 }, { value: 60 }, { value: 55 }, { value: 70 }],
    [{ value: 40 }, { value: 35 }, { value: 50 }, { value: 45 }, { value: 60 }, { value: 50 }],
    [{ value: 15 }, { value: 35 }, { value: 30 }, { value: 50 }, { value: 45 }, { value: 60 }],
  ];

  const kpiCards = [
    {
      title: 'Total Revenue',
      value: formatLKRShort(revenue),
      trend: revenueTrend,
      icon: DollarSign,
      iconColor: 'text-gray-500',
      sparklineColor: '#3b82f6',
      data: sparklineData[0],
    },
    {
      title: 'Total Customers',
      value: summary?.customers?.total || 0,
      trend: customerTrend,
      icon: Users,
      iconColor: 'text-emerald-500',
      sparklineColor: '#10b981',
      data: sparklineData[1],
    },
    {
      title: 'Total Orders',
      value: totalBills + totalInvoices,
      trend: 3.2,
      icon: ShoppingCart,
      iconColor: 'text-orange-500',
      sparklineColor: '#f59e0b',
      data: sparklineData[2],
    },
  ];

  return (
    <Layout>
      <div className="space-y-8 p-6">
        {/* Welcome Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Welcome back! Here's what's happening with your business today.</p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-4 md:mt-0 px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg font-semibold transition dark:from-gray-500 dark:to-gray-600"
          >
            Generate Report
          </motion.button>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {kpiCards.map((card, idx) => {
            const trendColor = card.trend >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400';
            return (
              <motion.div
                key={`kpi-${idx}-${animationKey}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                whileHover={{ y: -3, boxShadow: "0 20px 25px -5rgba(0, 0, 0, 0.1)" }}
                className="lightning-card border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 flex flex-col relative cursor-pointer group"
              >
                {/* Icon */}
                <div className="absolute top-6 right-6">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <card.icon size={24} className={card.iconColor} />
                  </div>
                </div>

                <div className="mb-4 pr-16">
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{card.value}</p>
                  <div className="flex items-center gap-2 mt-3">
                    {card.trend >= 0 ? (
                      <>
                        <ArrowUpRight size={16} className={trendColor} />
                        <span className={`text-sm font-semibold ${trendColor}`}>+{card.trend}%</span>
                      </>
                    ) : (
                      <>
                        <ArrowDownRight size={16} className={trendColor} />
                        <span className={`text-sm font-semibold ${trendColor}`}>{card.trend}%</span>
                      </>
                    )}
                    <span className="text-sm text-gray-500 dark:text-gray-400">vs last month</span>
                  </div>
                </div>

                {/* Sparkline Chart */}
                <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                  <ResponsiveContainer width="100%" height={50}>
                    <LineChart data={card.data} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke={card.sparklineColor} 
                        strokeWidth={2.5}
                        dot={false}
                        isAnimationActive={true}
                        animationDuration={800}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Area Chart */}
          <motion.div
            key={`area-${animationKey}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            whileHover={{ boxShadow: "0 20px 25px -5rgba(0, 0, 0, 0.1)" }}
            className="lightning-card lg:col-span-2 border border-gray-200 dark:border-gray-700 rounded-xl p-6 transition-all duration-300"
          >
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Performance Overview</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Monthly revenue, orders, and profit</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData || []}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.7} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.7} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.7} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-800" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#60a5fa', strokeWidth: 2 }} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="url(#colorRevenue)" name="Revenue" isAnimationActive={true} animationDuration={800} />
                <Area type="monotone" dataKey="profit" stroke="#10b981" fill="url(#colorProfit)" name="Profit" isAnimationActive={true} animationDuration={800} />
                <Area type="monotone" dataKey="orders" stroke="#f59e0b" fill="url(#colorOrders)" name="Orders" isAnimationActive={true} animationDuration={800} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Stats Card */}
          <motion.div
            key={`stats-${animationKey}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            whileHover={{ boxShadow: "0 20px 25px -5rgba(0, 0, 0, 0.1)" }}
            className="lightning-card border border-gray-200 dark:border-gray-700 rounded-xl p-6 lg:col-span-2 transition-all duration-300"
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Financial Summary</h3>
            <div className="space-y-4">
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Revenue</span>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{formatLKRShort(revenue)}</p>
              </div>
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Expenses</span>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{formatLKRShort(expenses)}</p>
              </div>
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Net Profit</span>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{formatLKRShort(profit)}</p>
              </div>
              <div className="border-t border-gray-800 pt-4 mt-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Profit Margin</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : 0}%</p>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((profit / revenue) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Additional Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart for Transactions */}
          <motion.div
            key={`chart-trans-${animationKey}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            whileHover={{ boxShadow: "0 20px 25px -5rgba(0, 0, 0, 0.1)" }}
            className="lightning-card border border-gray-800 rounded-xl p-6 transition-all duration-300\"
          >
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Transaction Breakdown</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Bills vs Invoices comparison</p>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={[
                  { name: 'Bills', count: totalBills, amount: revenue * 0.4 },
                  { name: 'Invoices', count: totalInvoices, amount: revenue * 0.6 },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-800" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(96, 165, 250, 0.1)' }} />
                <Legend />
                <Bar dataKey="count" fill="#8b5cf6" name="Count" radius={[8, 8, 0, 0]} isAnimationActive={true} animationDuration={800} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Revenue Distribution Donut Chart */}
          <motion.div
            key={`chart-dist-${animationKey}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.5 }}
            whileHover={{ boxShadow: "0 20px 25px -5rgba(0, 0, 0, 0.1)" }}
            className="lightning-card border border-gray-800 rounded-xl p-6 transition-all duration-300"
          >
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Revenue Distribution</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Where your revenue comes from</p>
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
                  isAnimationActive={true}
                  animationDuration={800}
                >
                  <Cell fill="#3b82f6" />
                  <Cell fill="#ec4899" />
                </Pie>
                <Tooltip content={<CustomTooltip formatter={formatLKRShort} />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex gap-6 justify-center mt-4 text-sm flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                <span className="text-gray-600 dark:text-gray-400">Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-pink-500"></div>
                <span className="text-gray-600 dark:text-gray-400">Expenses</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Additional Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Service Category Revenue */}
          <motion.div
            key={`chart-services-${animationKey}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            whileHover={{ boxShadow: "0 20px 25px -5rgba(0, 0, 0, 0.1)" }}
            className="lightning-card border border-gray-800 rounded-xl p-6 transition-all duration-300"
          >
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Top Services</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Revenue by category</p>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={[
                  { name: 'Photography', value: revenue * 0.35 },
                  { name: 'Videography', value: revenue * 0.28 },
                  { name: 'Editing', value: revenue * 0.22 },
                  { name: 'Printing', value: revenue * 0.15 },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-800" />
                <XAxis dataKey="name" stroke="#9ca3af" angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#9ca3af" />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(6, 182, 212, 0.1)' }} />
                <Bar dataKey="value" fill="#06b6d4" radius={[8, 8, 0, 0]} isAnimationActive={true} animationDuration={800} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Booking Status Distribution */}
          <motion.div
            key={`chart-status-${animationKey}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.5 }}
            whileHover={{ boxShadow: "0 20px 25px -5rgba(0, 0, 0, 0.1)" }}
            className="lightning-card border border-gray-200 dark:border-gray-800 rounded-xl p-6 transition-all duration-300"
          >
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Booking Status</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Order distribution</p>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Completed', value: 65 },
                    { name: 'Pending', value: 20 },
                    { name: 'Processing', value: 15 },
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  isAnimationActive={true}
                  animationDuration={800}
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#f59e0b" />
                  <Cell fill="#3b82f6" />
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex gap-4 justify-center mt-4 text-xs flex-wrap">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                <span className="text-gray-600 dark:text-gray-400">Completed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                <span className="text-gray-600 dark:text-gray-400">Pending</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-gray-500"></div>
                <span className="text-gray-600 dark:text-gray-400">Processing</span>
              </div>
            </div>
          </motion.div>

          {/* Customer Trend */}
          <motion.div
            key={`chart-growth-${animationKey}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            whileHover={{ boxShadow: "0 20px 25px -5rgba(0, 0, 0, 0.1)" }}
            className="lightning-card border border-gray-200 dark:border-gray-800 rounded-xl p-6 transition-all duration-300"
          >
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Customer Growth</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">New customers per month</p>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart
                data={[
                  { month: 'Jan', customers: 45 },
                  { month: 'Feb', customers: 58 },
                  { month: 'Mar', customers: 72 },
                  { month: 'Apr', customers: 89 },
                  { month: 'May', customers: 95 },
                  { month: 'Jun', customers: 110 },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-800" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#8b5cf6', strokeWidth: 2 }} />
                <Line 
                  type="monotone" 
                  dataKey="customers" 
                  stroke="#8b5cf6" 
                  strokeWidth={2.5}
                  dot={{ fill: '#8b5cf6', r: 4 }}
                  isAnimationActive={true}
                  animationDuration={800}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* More Analytics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Comparison */}
          <motion.div
            key={`chart-revenue-${animationKey}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.5 }}
            whileHover={{ boxShadow: "0 20px 25px -5rgba(0, 0, 0, 0.1)" }}
            className="lightning-card border border-gray-200 dark:border-gray-800 rounded-xl p-6 transition-all duration-300"
          >
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Revenue vs Target</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Monthly performance comparison</p>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={[
                  { month: 'Jan', actual: 45000, target: 50000 },
                  { month: 'Feb', actual: 52000, target: 50000 },
                  { month: 'Mar', actual: 48000, target: 50000 },
                  { month: 'Apr', actual: 61000, target: 55000 },
                  { month: 'May', actual: 58000, target: 55000 },
                  { month: 'Jun', actual: 67000, target: 60000 },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-800" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} />
                <Legend />
                <Bar dataKey="actual" fill="#3b82f6" name="Actual" radius={[8, 8, 0, 0]} isAnimationActive={true} animationDuration={800} />
                <Bar dataKey="target" fill="#d1d5db" name="Target" radius={[8, 8, 0, 0]} isAnimationActive={true} animationDuration={800} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Inventory Status */}
          <motion.div
            key={`chart-stock-${animationKey}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            whileHover={{ boxShadow: "0 20px 25px -5rgba(0, 0, 0, 0.1)" }}
            className="lightning-card border border-gray-200 dark:border-gray-800 rounded-xl p-6 transition-all duration-300"
          >
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Frame Stock Status</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Top frames by quantity</p>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={[
                  { name: '4x6 Frame', stock: 230 },
                  { name: '5x7 Frame', stock: 185 },
                  { name: '8x10 Frame', stock: 142 },
                  { name: '11x14 Frame', stock: 98 },
                  { name: 'Canvas', stock: 65 },
                ]}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-800" />
                <XAxis type="number" stroke="#9ca3af" />
                <YAxis dataKey="name" type="category" stroke="#9ca3af" width={80} tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(16, 185, 129, 0.1)' }} />
                <Bar dataKey="stock" fill="#10b981" radius={[0, 8, 8, 0]} isAnimationActive={true} animationDuration={800} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Recent Activity & Pending Tasks */}
        {pendingTasks && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending Bookings */}
            <motion.div
              key={`pending-bookings-${animationKey}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              whileHover={{ boxShadow: "0 20px 25px -5rgba(0, 0, 0, 0.1)" }}
              className="lightning-card border border-gray-800 rounded-xl p-6 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Orders</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{pendingTasks.pending_bookings?.length || 0} pending</p>
                </div>
                <a href="/bookings" className="text-sm text-gray-700 dark:text-gray-300 hover:underline font-semibold">View all →</a>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {pendingTasks.pending_bookings?.length ? (
                  pendingTasks.pending_bookings.slice(0, 5).map((booking, idx) => (
                    <motion.div 
                      key={idx} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + idx * 0.05 }}
                      className="flex items-center justify-between p-3 border border-gray-800 rounded-lg transition"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white">{booking.customer_name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{booking.event_date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900 dark:text-white">{formatLKR(booking.total_amount)}</p>
                        <span className="inline-block mt-1 px-2.5 py-0.5 text-xs font-semibold bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                          Pending
                        </span>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-8">No pending orders</p>
                )}
              </div>
            </motion.div>

            {/* Low Stock Items */}
            <motion.div
              key={`low-stock-${animationKey}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75, duration: 0.5 }}
              whileHover={{ boxShadow: "0 20px 25px -5rgba(0, 0, 0, 0.1)" }}
              className="lightning-card border border-gray-800 rounded-xl p-6 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Low Stock Items</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{pendingTasks.low_stock_frames?.length || 0} items</p>
                </div>
                <a href="/inventory" className="text-sm text-gray-700 dark:text-gray-300 hover:underline font-semibold">View all →</a>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {pendingTasks.low_stock_frames?.length ? (
                  pendingTasks.low_stock_frames.slice(0, 5).map((frame, idx) => (
                    <motion.div 
                      key={idx} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.75 + idx * 0.05 }}
                      className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg transition"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white">{frame.frame_name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Stock: {frame.quantity} units</p>
                      </div>
                      <div className="flex items-center justify-center">
                        <AlertCircle size={20} className="text-gray-600 dark:text-gray-400" />
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-8">All items in stock ✓</p>
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
