import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle } from 'lucide-react';
import api from '../utils/api';
import Layout from '../components/Layout';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [customers, setCustomers] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});

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
      const response = await api.post('/bookings', {
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
      setError(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Bookings</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">Manage all your event bookings</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(!showForm)}
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-3 rounded-lg transition-all"
          >
            {showForm ? 'Cancel' : '+ New Booking'}
          </motion.button>
        </div>

        {/* Alerts */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-100 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 px-4 py-3 rounded-lg flex items-center gap-2"
          >
            <AlertCircle size={20} />
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-100 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 px-4 py-3 rounded-lg flex items-center gap-2"
          >
            <CheckCircle size={20} />
            {success}
          </motion.div>
        )}

        {/* Booking Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8"
          >
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Create New Booking</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Select */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-2">
                  Select Customer *
                </label>
                <select
                  name="customer_id"
                  value={formData.customer_id}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition-all disabled:opacity-50"
                >
                  <option value="">-- Choose Customer --</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.customer_name}
                    </option>
                  ))}
                </select>
                {validationErrors.customer_id && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.customer_id}</p>
                )}
              </div>

              {/* Mobile Number - MANDATORY */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-2">
                  Mobile Number * <span className="text-red-500">(Required)</span>
                </label>
                <input
                  type="tel"
                  name="customer_mobile"
                  value={formData.customer_mobile}
                  onChange={handleInputChange}
                  placeholder="+94-7XX-XXXXXX"
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all disabled:opacity-50"
                />
                {validationErrors.customer_mobile && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.customer_mobile}</p>
                )}
              </div>

              {/* Address - MANDATORY */}
              <div className="md:col-span-2">
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-2">
                  Address * <span className="text-red-500">(Required)</span>
                </label>
                <textarea
                  name="customer_address"
                  value={formData.customer_address}
                  onChange={handleInputChange}
                  placeholder="Street address, city, postal code"
                  disabled={loading}
                  rows="3"
                  className="w-full px-4 py-3 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all disabled:opacity-50"
                />
                {validationErrors.customer_address && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.customer_address}</p>
                )}
              </div>

              {/* Total Amount */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-2">
                  Total Amount (Rs.) *
                </label>
                <input
                  type="number"
                  name="total_amount"
                  value={formData.total_amount}
                  onChange={handleInputChange}
                  placeholder="15000"
                  disabled={loading}
                  step="100"
                  min="0"
                  className="w-full px-4 py-3 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all disabled:opacity-50"
                />
                {validationErrors.total_amount && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.total_amount}</p>
                )}
              </div>

              {/* Advance Paid */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-2">
                  Advance Paid (Rs.)
                </label>
                <input
                  type="number"
                  name="advance_paid"
                  value={formData.advance_paid}
                  onChange={handleInputChange}
                  placeholder="5000"
                  disabled={loading}
                  step="100"
                  min="0"
                  className="w-full px-4 py-3 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all disabled:opacity-50"
                />
              </div>

              {/* Event Date */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-2">
                  Event Date *
                </label>
                <input
                  type="date"
                  name="event_date"
                  value={formData.event_date}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition-all disabled:opacity-50"
                />
                {validationErrors.event_date && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.event_date}</p>
                )}
              </div>

              {/* Event Time */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-2">
                  Event Time *
                </label>
                <input
                  type="time"
                  name="event_time"
                  value={formData.event_time}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition-all disabled:opacity-50"
                />
                {validationErrors.event_time && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.event_time}</p>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition-all disabled:opacity-50"
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* Submit Button */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={loading}
                className="md:col-span-2 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed dark:from-gray-600 dark:to-gray-700 dark:hover:from-gray-700 dark:hover:to-gray-800"
              >
                {loading ? 'Creating...' : 'Create Booking'}
              </motion.button>
            </form>
          </motion.div>
        )}

        {/* Bookings Table */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 dark:bg-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900 dark:text-white">Booking ID</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900 dark:text-white">Customer</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900 dark:text-white">Event Date</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900 dark:text-white">Amount</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900 dark:text-white">Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length ? (
                  bookings.map((booking) => (
                    <tr key={booking.id} className="border-t border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                      <td className="px-6 py-4 text-slate-900 dark:text-white font-semibold">#{booking.id}</td>
                      <td className="px-6 py-4 text-slate-900 dark:text-white">{booking.customer_name}</td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{booking.event_date}</td>
                      <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">Rs. {booking.total_amount}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                          booking.status === 'Pending' ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600' :
                          booking.status === 'Confirmed' ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600' :
                          booking.status === 'Completed' ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600' :
                          'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                      No bookings found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </Layout>
  );
};

export default Bookings;
