import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Trash2, Eye, Printer } from 'lucide-react';
import Layout from '../components/Layout';
import api from '../utils/api';
import { formatLKR, formatLKRShort } from '../utils/currency';

const Billing = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [services, setServices] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    customerName: '',
    mobileNumber: '',
    address: '',
    email: '',
    paymentStatus: 'full',
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
      
      setFormData({
        customerName: '',
        mobileNumber: '',
        address: '',
        email: '',
        paymentStatus: 'full',
        advanceAmount: '',
        selectedServices: [],
      });
      
      fetchBills();
      alert('Bill created successfully!');
    } catch (err) {
      console.error('Error creating bill:', err);
      alert('Error creating bill: ' + err.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return { bg: 'bg-gray-100 dark:bg-slate-700', text: 'text-gray-700 dark:text-gray-400', icon: '✓' };
      case 'pending':
        return { bg: 'bg-gray-100 dark:bg-slate-700', text: 'text-gray-700 dark:text-gray-400', icon: '◐' };
      case 'cancelled':
        return { bg: 'bg-gray-100 dark:bg-slate-700', text: 'text-gray-700 dark:text-gray-400', icon: '✕' };
      default:
        return { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-400', icon: '○' };
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'full':
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20';
      case 'advance':
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20';
      case 'partial':
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20';
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

  const handlePrintBill = () => {
    const printContent = document.getElementById('thermal-bill-preview');
    const printWindow = window.open('', '', 'width=400,height=600');
    printWindow.document.write(`
      <html>
        <head>
          <style>
            body { font-family: 'Courier New', monospace; font-size: 12px; margin: 0; padding: 10px; }
            .receipt { width: 80mm; }
          </style>
        </head>
        <body>
          <div class="receipt">
            ${printContent.innerHTML}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 250);
  };

  const resetForm = () => {
    setFormData({
      customerName: '',
      mobileNumber: '',
      address: '',
      email: '',
      paymentStatus: 'full',
      advanceAmount: '',
      selectedServices: [],
    });
  };

  return (
    <Layout>
      <div className="space-y-6 p-6 min-h-screen bg-gray-50 dark:bg-slate-900">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Billing System</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Create bills with thermal printer support and manage billing records</p>
          </div>
        </motion.div>

        {/* Main Content: Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT SIDE: Billing Form (Larger - 2 Columns) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Create Bill</h2>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Customer Details Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide border-b border-gray-200 dark:border-slate-700 pb-2">Customer Details</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Customer Name <span className="text-gray-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleFormChange}
                      placeholder="Enter customer name"
                      required
                      className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-700 transition text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mobile Number</label>
                      <input
                        type="tel"
                        name="mobileNumber"
                        value={formData.mobileNumber}
                        onChange={handleFormChange}
                        placeholder="+1-234-567-8900"
                        className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-700 transition text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleFormChange}
                        placeholder="customer@example.com"
                        className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-700 transition text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleFormChange}
                      placeholder="Enter full address"
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-700 transition text-sm"
                    />
                  </div>
                </div>

                {/* Services Section */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide border-b border-gray-200 dark:border-slate-700 pb-2">Choose Services <span className="text-gray-500">*</span></h3>
                  {services.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No services available</p>
                  ) : (
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {services.map((service) => (
                        <label key={service.id} className="flex items-start gap-2 p-3 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer transition">
                          <input
                            type="checkbox"
                            checked={formData.selectedServices.includes(service.id)}
                            onChange={() => handleServiceToggle(service.id)}
                            className="w-4 h-4 mt-0.5 text-gray-700 rounded focus:ring-2 focus:ring-gray-700"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{service.name}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">${service.price}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Payment Section */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide border-b border-gray-200 dark:border-slate-700 pb-2">Select Payment Type</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition" style={{borderColor: formData.paymentStatus === 'full' ? 'rgb(55, 65, 81)' : 'rgb(229, 231, 235)', backgroundColor: formData.paymentStatus === 'full' ? 'rgb(243, 244, 246)' : 'transparent'}}>
                      <input
                        type="radio"
                        name="paymentStatus"
                        value="full"
                        checked={formData.paymentStatus === 'full'}
                        onChange={handleFormChange}
                        className="w-4 h-4 text-gray-700"
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Full Payment</span>
                    </label>
                    <label className="flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition" style={{borderColor: formData.paymentStatus === 'advance' ? 'rgb(55, 65, 81)' : 'rgb(229, 231, 235)', backgroundColor: formData.paymentStatus === 'advance' ? 'rgb(243, 244, 246)' : 'transparent'}}>
                      <input
                        type="radio"
                        name="paymentStatus"
                        value="advance"
                        checked={formData.paymentStatus === 'advance'}
                        onChange={handleFormChange}
                        className="w-4 h-4 text-gray-700"
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Advance Payment</span>
                    </label>
                  </div>

                  {formData.paymentStatus === 'advance' && (
                    <input
                      type="number"
                      name="advanceAmount"
                      value={formData.advanceAmount}
                      onChange={handleFormChange}
                      placeholder="Enter advance amount"
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-700 transition text-sm"
                    />
                  )}
                </div>

                {/* Added Services View Section */}
                {formData.selectedServices.length > 0 && (
                  <div className="border-t border-gray-200 dark:border-slate-700 pt-5">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">Added Services</h3>
                    <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-4 space-y-2 max-h-48 overflow-y-auto">
                      {services
                        .filter(s => formData.selectedServices.includes(s.id))
                        .map((service, idx) => (
                          <div key={service.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{idx + 1}. {service.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{formatLKR(service.price)}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleServiceToggle(service.id)}
                              className="px-2 py-1 text-xs bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-slate-600 transition font-medium"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      <div className="bg-gray-100 dark:bg-slate-700 rounded-lg p-4 border border-gray-300 dark:border-slate-600 mt-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Total Amount:</span>
                          <span className="text-xl font-bold text-gray-900 dark:text-white">{formatLKR(total)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Form Actions */}
                <div className="flex gap-3 pt-5 border-t border-gray-200 dark:border-slate-700">
                  <button
                    type="submit"
                    disabled={formData.selectedServices.length === 0}
                    className="flex-1 px-4 py-2.5 bg-gray-800 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-900 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium text-sm"
                  >
                    Generate Bill
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition font-medium text-sm"
                  >
                    Clear
                  </button>
                </div>
              </form>
            </div>
          </motion.div>

          {/* RIGHT SIDE: Bill Preview (1 Column) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Bill Preview</h2>
              
              {/* Thermal Printer Preview */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 min-h-96" id="thermal-bill-preview">
                {formData.selectedServices.length > 0 ? (
                  <ThermalBillPreview formData={formData} services={services} total={total} />
                ) : (
                  <div className="flex items-center justify-center h-full text-center">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-lg">No Services Selected</p>
                      <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Select services to view bill preview</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handlePrintBill}
                  disabled={formData.selectedServices.length === 0}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-800 dark:bg-gray-700 hover:bg-gray-900 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition font-medium text-sm"
                >
                  <Printer size={18} />
                  Generate Bill
                </button>
                <button
                  onClick={resetForm}
                  className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition font-medium text-sm"
                >
                  Clear
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* BILLS HISTORY SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Bills History</h2>
            
            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by customer name, mobile, or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-700 transition"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-gray-400" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-700 transition"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bills Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
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
                    {bills.length === 0 ? 'Create your first bill using the form above' : 'Try adjusting your search filters'}
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
                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${statusColor.bg} ${statusColor.text}`}>
                              <span>{statusColor.icon}</span>
                              <span className="uppercase">{bill.status}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition" title="View">
                                <Eye size={16} className="text-gray-600 dark:text-gray-400" />
                              </button>
                              <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition" title="Delete">
                                <Trash2 size={16} className="text-gray-600 dark:text-gray-400" />
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
        </motion.div>
      </div>
    </Layout>
  );
};

// Thermal Printer Bill Preview Component
const ThermalBillPreview = ({ formData, services, total }) => {
  const billDate = new Date();
  const billNumber = `${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  
  const selectedServices = services.filter(s => formData.selectedServices.includes(s.id));
  const remainingAmount = formData.paymentStatus === 'advance' 
    ? (total - (parseFloat(formData.advanceAmount) || 0))
    : 0;

  return (
    <div className="font-mono text-xs text-gray-900 dark:text-gray-100 leading-relaxed">
      {/* Header */}
      <div className="text-center mb-3 pb-3 border-b-2 border-gray-400 dark:border-gray-600">
        <div className="text-sm font-bold">SHINE ART STUDIO</div>
        <div className="text-xs text-gray-600 dark:text-gray-400">Photography & Videography</div>
        <div className="text-xs text-gray-600 dark:text-gray-400">Professional Services</div>
      </div>

      {/* Receipt Information */}
      <div className="mb-3 pb-3 border-b border-gray-300 dark:border-gray-700 text-xs">
        <div className="flex justify-between">
          <span>RECEIPT #{billNumber}</span>
          <span>{billDate.toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between text-gray-600 dark:text-gray-400 text-xs">
          <span>{billDate.toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Customer Information */}
      {formData.customerName && (
        <div className="mb-3 pb-3 border-b border-gray-300 dark:border-gray-700 text-xs">
          <div className="font-bold">CUSTOMER</div>
          <div>{formData.customerName}</div>
          {formData.mobileNumber && <div>Ph: {formData.mobileNumber}</div>}
          {formData.email && <div className="text-xs">{formData.email}</div>}
          {formData.address && <div className="text-xs whitespace-pre-wrap">{formData.address}</div>}
        </div>
      )}

      {/* Items */}
      {selectedServices.length > 0 && (
        <div className="mb-3 pb-3 border-b border-gray-300 dark:border-gray-700">
          <div className="flex justify-between font-bold text-xs mb-2">
            <span>SERVICE</span>
            <span>PRICE</span>
          </div>
          {selectedServices.map((service) => (
            <div key={service.id} className="flex justify-between text-xs mb-1">
              <span className="flex-1">{service.name}</span>
              <span className="text-right">{formatLKR(service.price)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Totals */}
      <div className="mb-3 pb-3 border-b border-gray-300 dark:border-gray-700">
        <div className="flex justify-between text-xs font-bold mb-1">
          <span>SUBTOTAL</span>
          <span>{formatLKR(total)}</span>
        </div>
        {formData.paymentStatus === 'advance' && (
          <>
            <div className="flex justify-between text-xs mb-1">
              <span>ADVANCE PAID</span>
              <span>{formatLKR(parseFloat(formData.advanceAmount) || 0)}</span>
            </div>
            <div className="flex justify-between text-xs font-bold text-gray-600 dark:text-gray-400">
              <span>REMAINING</span>
              <span>{formatLKR(remainingAmount)}</span>
            </div>
          </>
        )}
      </div>

      {/* Payment Status */}
      <div className="mb-3 pb-3 border-b border-gray-300 dark:border-gray-700 text-xs">
        <div className="flex justify-between mb-1">
          <span>TOTAL</span>
          <span className="font-bold text-sm">{formatLKR(total)}</span>
        </div>
        <div className="flex justify-between">
          <span>PAYMENT</span>
          <span className="uppercase font-bold">
            {formData.paymentStatus === 'full' && 'PAID ✓'}
            {formData.paymentStatus === 'advance' && 'ADVANCE'}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-600 dark:text-gray-400 pt-2">
        <div className="mb-1">Thank you for your business!</div>
        <div className="text-xs">&lt;- - - - - - - -&gt;</div>
      </div>
    </div>
  );
};

export default Billing;
