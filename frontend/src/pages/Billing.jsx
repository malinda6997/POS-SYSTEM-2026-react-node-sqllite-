import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, X, CheckCircle, Clock, AlertCircle, Trash2, Eye } from 'lucide-react';
import Layout from '../components/Layout';
import api from '../utils/api';

const Billing = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    customerName: '',
    mobileNumber: '',
    address: '',
    email: '',
    paymentStatus: 'full', // full, advance, partial
    advanceAmount: '',
    selectedServices: [],
  });

  useEffect(() => {
    fetchBills();
    fetchServices();
  }, []);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const res = await api.get('/bookings');
      setBills(res.data.data || []);
    } catch (err) {
      console.error('Error fetching bills:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await api.get('/services');
      setServices(res.data.data || []);
    } catch (err) {
      console.error('Error fetching services:', err);
    }
  };

  const handleFormChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleServiceToggle = (serviceId) => {
    setFormData((prev) => {
      const selected = prev.selectedServices.includes(serviceId)
        ? prev.selectedServices.filter((id) => id !== serviceId)
        : [...prev.selectedServices, serviceId];
      return { ...prev, selectedServices: selected };
    });
  };

  const calculateTotal = () => {
    return formData.selectedServices.reduce((total, serviceId) => {
      const service = services.find((s) => s.id === serviceId);
      return total + (service?.price || 0);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.customerName.trim()) {
      alert('Customer name is required');
      return;
    }

    if (formData.selectedServices.length === 0) {
      alert('Please select at least one service');
      return;
    }

    try {
      const total = calculateTotal();
      const billData = {
        customer_name: formData.customerName,
        mobile_number: formData.mobileNumber || null,
        address: formData.address || null,
        email: formData.email || null,
        services: formData.selectedServices,
        total_amount: total,
        payment_status: formData.paymentStatus,
        advance_amount: formData.paymentStatus === 'advance' ? parseFloat(formData.advanceAmount) || 0 : null,
        status: 'completed',
      };

      await api.post('/bookings', billData);
      
      // Reset form
      setFormData({
        customerName: '',
        mobileNumber: '',
        address: '',
        email: '',
        paymentStatus: 'full',
        advanceAmount: '',
        selectedServices: [],
      });
      setShowForm(false);
      
      // Refresh bills
      fetchBills();
    } catch (err) {
      console.error('Error creating bill:', err);
      alert('Error creating bill: ' + err.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', icon: CheckCircle };
      case 'pending':
        return { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', icon: Clock };
      case 'cancelled':
        return { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', icon: AlertCircle };
      default:
        return { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-400', icon: Clock };
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'full':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
      case 'advance':
        return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20';
      case 'partial':
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const filteredBills = bills.filter((bill) => {
    const matchSearch =
      bill.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      bill.mobile_number?.includes(search) ||
      bill.email?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || bill.status?.toLowerCase() === filter;
    return matchSearch && matchFilter;
  });

  const total = calculateTotal();

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
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Billing</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Create and manage customer bills</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition font-medium shadow-lg"
          >
            <Plus size={20} />
            Create Bill
          </motion.button>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col md:flex-row gap-4"
        >
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by customer name, mobile, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </motion.div>

        {/* Bills Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden"
        >
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-500 dark:text-gray-400">Loading bills...</div>
            </div>
          ) : filteredBills.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <p className="text-gray-500 dark:text-gray-400 text-lg">No bills found</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                  {bills.length === 0 ? 'Create your first bill by clicking the "Create Bill" button' : 'Try adjusting your search filters'}
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Payment</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                  {filteredBills.map((bill, index) => {
                    const statusColor = getStatusColor(bill.status);
                    const StatusIcon = statusColor.icon;
                    const paymentStatusColor = getPaymentStatusColor(bill.payment_status);

                    return (
                      <motion.tr
                        key={bill.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{bill.customer_name}</p>
                            {bill.address && <p className="text-xs text-gray-500 dark:text-gray-400">{bill.address}</p>}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            {bill.mobile_number && <p className="text-gray-700 dark:text-gray-300">{bill.mobile_number}</p>}
                            {bill.email && <p className="text-gray-600 dark:text-gray-400 text-xs">{bill.email}</p>}
                            {!bill.mobile_number && !bill.email && <p className="text-gray-400 dark:text-gray-500 italic">No contact</p>}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            ${bill.amount || bill.total_amount || 0}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium capitalize ${paymentStatusColor}`}>
                            {bill.payment_status || 'N/A'}
                            {bill.payment_status === 'advance' && bill.advance_amount && ` ($${bill.advance_amount})`}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <StatusIcon size={16} className={statusColor.text} />
                            <span className={`text-xs font-medium uppercase ${statusColor.text}`}>{bill.status}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition" title="View">
                              <Eye size={16} className="text-blue-600 dark:text-blue-400" />
                            </button>
                            <button className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition" title="Delete">
                              <Trash2 size={16} className="text-red-600 dark:text-red-400" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>

      {/* Create Bill Modal */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowForm(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Bill</h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition"
              >
                <X size={24} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Customer Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Customer Name - Required */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Customer Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleFormChange}
                      placeholder="e.g., John Doe"
                      required
                      className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                  </div>

                  {/* Mobile Number - Optional */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Mobile Number <span className="text-gray-400 text-xs">(Optional)</span>
                    </label>
                    <input
                      type="tel"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleFormChange}
                      placeholder="e.g., +1 (555) 123-4567"
                      className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                  </div>

                  {/* Email - Optional */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email <span className="text-gray-400 text-xs">(Optional)</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      placeholder="e.g., john@example.com"
                      className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                  </div>

                  {/* Address - Optional */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Address <span className="text-gray-400 text-xs">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleFormChange}
                      placeholder="e.g., 123 Main St, City, State"
                      className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Services Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Select Services <span className="text-red-500">*</span></h3>
                {services.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No services available</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                    {services.map((service) => (
                      <label
                        key={service.id}
                        className="flex items-center gap-3 p-3 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition"
                      >
                        <input
                          type="checkbox"
                          checked={formData.selectedServices.includes(service.id)}
                          onChange={() => handleServiceToggle(service.id)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{service.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">${service.price}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Payment Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Payment Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Payment Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Status</label>
                    <select
                      name="paymentStatus"
                      value={formData.paymentStatus}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    >
                      <option value="full">Full Payment</option>
                      <option value="advance">Advance Payment</option>
                      <option value="partial">Partial Payment</option>
                    </select>
                  </div>

                  {/* Advance Amount - Conditional */}
                  {formData.paymentStatus === 'advance' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Advance Amount</label>
                      <input
                        type="number"
                        name="advanceAmount"
                        value={formData.advanceAmount}
                        onChange={handleFormChange}
                        placeholder="50"
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Total */}
              {formData.selectedServices.length > 0 && (
                <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">Total Amount:</span>
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">${total.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition font-medium"
                >
                  Create Bill
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </Layout>
  );
};

export default Billing;
