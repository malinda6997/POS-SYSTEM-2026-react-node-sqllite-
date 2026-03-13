import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Search, TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import api from '../utils/api';
import { formatLKR } from '../utils/currency';
import Layout from '../components/Layout';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [customers, setCustomers] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  const [formData, setFormData] = useState({
    customer_id: '',
    customer_mobile: '',
    customer_address: '',
    total_amount: '',
    advance_paid: '',
    event_date: '',
    event_time: '',
    status: 'Pending',
  });

  useEffect(() => {
    fetchBookings();
    fetchCustomers();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, searchTerm, activeTab]);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings');
      setBookings(response.data);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/customers');
      setCustomers(response.data);
    } catch (err) {
      console.error('Error fetching customers:', err);
    }
  };

  const filterBookings = () => {
    let filtered = [...bookings];

    // Filter by status tab
    if (activeTab !== 'All') {
      filtered = filtered.filter(b => b.status === activeTab);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(b =>
        b.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.id?.toString().includes(searchTerm) ||
        b.event_date?.includes(searchTerm)
      );
    }

    setFilteredBookings(filtered);
  };

  // Generate sample trend data
  const getTrendData = (id) => {
    const data = [];
    for (let i = 0; i < 6; i++) {
      data.push({ value: Math.random() * 100 + 40 });
    }
    return data;
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Completed': return 'bg-green-500 text-white border-green-600';
      case 'Processing': return 'bg-blue-500 text-white border-blue-600';
      case 'Pending': return 'bg-amber-400 text-gray-900 border-amber-500';
      case 'Cancelled': return 'bg-red-500 text-white border-red-600';
      default: return 'bg-gray-500 text-white border-gray-600';
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.customer_id) errors.customer_id = 'Customer is required';
    if (!formData.customer_mobile || formData.customer_mobile.trim() === '') {
      errors.customer_mobile = 'Mobile number is required';
    }
    if (!formData.customer_address || formData.customer_address.trim() === '') {
      errors.customer_address = 'Address is required';
    }
    if (!formData.total_amount || parseFloat(formData.total_amount) <= 0) {
      errors.total_amount = 'Valid amount is required';
    }
    if (!formData.event_date) errors.event_date = 'Event date is required';
    if (!formData.event_time) errors.event_time = 'Event time is required';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setError('Please fill in all required fields');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/bookings', {
        customer_id: parseInt(formData.customer_id),
        customer_mobile: formData.customer_mobile,
        customer_address: formData.customer_address,
        total_amount: parseFloat(formData.total_amount),
        advance_paid: parseFloat(formData.advance_paid) || 0,
        event_date: formData.event_date,
        event_time: formData.event_time,
        status: formData.status,
      });
      setSuccess('Booking created successfully!');
      setFormData({
        customer_id: '',
        customer_mobile: '',
        customer_address: '',
        total_amount: '',
        advance_paid: '',
        event_date: '',
        event_time: '',
        status: 'Pending',
      });
      setShowForm(false);
      fetchBookings();
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating booking');
    } finally {
      setLoading(false);
    }
  };

  const tabs = ['All', 'Completed', 'Processing', 'Pending', 'Cancelled'];
  const statusColors = {
    Completed: '#10b981',
    Processing: '#3b82f6',
    Pending: '#f59e0b',
    Cancelled: '#ef4444'
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Bookings</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Manage and track all customer bookings</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(!showForm)}
            className="bg-slate-700 hover:bg-slate-800 text-white font-bold px-6 py-3 rounded-lg transition-all dark:bg-slate-800 dark:hover:bg-slate-900 w-fit"
          >
            + New Booking
          </motion.button>
        </div>

        {/* Alerts */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg flex items-center gap-2"
          >
            <AlertCircle size={20} />
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg flex items-center gap-2"
          >
            <CheckCircle size={20} />
            {success}
          </motion.div>
        )}

        {/* Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-gray-200 dark:border-gray-700 rounded-xl p-8 bg-gradient-to-br from-gray-50 to-white dark:from-slate-900 dark:to-slate-800"
          >
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Create New Order</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-2">Select Customer *</label>
                <select
                  name="customer_id"
                  value={formData.customer_id}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-all disabled:opacity-50"
                >
                  <option value="">-- Choose Customer --</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>{customer.customer_name}</option>
                  ))}
                </select>
                {validationErrors.customer_id && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.customer_id}</p>
                )}
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-2">Mobile Number *</label>
                <input
                  type="tel"
                  name="customer_mobile"
                  value={formData.customer_mobile}
                  onChange={handleInputChange}
                  placeholder="+94-7XX-XXXXXX"
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all disabled:opacity-50"
                />
                {validationErrors.customer_mobile && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.customer_mobile}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-2">Address *</label>
                <textarea
                  name="customer_address"
                  value={formData.customer_address}
                  onChange={handleInputChange}
                  placeholder="Street address, city, postal code"
                  disabled={loading}
                  rows="3"
                  className="w-full px-4 py-3 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all disabled:opacity-50"
                />
                {validationErrors.customer_address && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.customer_address}</p>
                )}
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-2">Total Amount (Rs.) *</label>
                <input
                  type="number"
                  name="total_amount"
                  value={formData.total_amount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all disabled:opacity-50"
                />
                {validationErrors.total_amount && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.total_amount}</p>
                )}
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-2">Advance Paid (Rs.)</label>
                <input
                  type="number"
                  name="advance_paid"
                  value={formData.advance_paid}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-2">Event Date *</label>
                <input
                  type="date"
                  name="event_date"
                  value={formData.event_date}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-all disabled:opacity-50"
                />
                {validationErrors.event_date && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.event_date}</p>
                )}
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-2">Event Time *</label>
                <input
                  type="time"
                  name="event_time"
                  value={formData.event_time}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-all disabled:opacity-50"
                />
                {validationErrors.event_time && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.event_time}</p>
                )}
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-2">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-all disabled:opacity-50"
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={loading}
                className="md:col-span-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Order'}
              </motion.button>
            </form>
          </motion.div>
        )}

        {/* Tabs and Search */}
        <div className="space-y-4">
          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <motion.button
                key={tab}
                onClick={() => setActiveTab(tab)}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                }`}
              >
                {tab}
              </motion.button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-6 py-4 text-left font-bold text-gray-900 dark:text-white">Order</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-900 dark:text-white">Customer</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-900 dark:text-white">Date</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-900 dark:text-white">Status</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-900 dark:text-white">Trend</th>
                  <th className="px-6 py-4 text-right font-bold text-gray-900 dark:text-white">Amount</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.length ? (
                  filteredBookings.map((booking, idx) => (
                    <motion.tr
                      key={booking.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-900/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">ORD-{booking.id?.toString().padStart(4, '0')}</td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{booking.customer_name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{booking.customer_mobile}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{booking.event_date}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <ResponsiveContainer width={80} height={35}>
                          <LineChart data={getTrendData(booking.id)}>
                            <Line
                              type="monotone"
                              dataKey="value"
                              stroke={statusColors[booking.status] || '#6b7280'}
                              strokeWidth={2}
                              dot={false}
                              isAnimationActive={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-white">
                        {formatLKR(booking.total_amount)}
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default Bookings;
