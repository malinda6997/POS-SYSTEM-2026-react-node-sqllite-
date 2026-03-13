import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, X, CheckCircle, Clock, AlertCircle, Trash2, Eye, Printer } from 'lucide-react';
import Layout from '../components/Layout';
import api from '../utils/api';

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

  const handlePrintBill = () => {
    const printContent = document.getElementById('thermal-bill-preview');
    const printWindow = window.open('', '', 'width=400,height=600');
    printWindow.document.write(printContent.innerHTML);
    printWindow.document.close();
    printWindow.print();
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
            <p className="text-gray-600 dark:text-gray-400 mt-1">Create bills with thermal printer preview and manage billing records</p>
          </div>
        </motion.div>

        {/* Main Content: Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT SIDE: Billing Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 sticky top-24">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Billing Details</h2>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Customer Information Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Customer Information</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Customer Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleFormChange}
                      placeholder="Enter customer name"
                      required
                      className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mobile Number</label>
                    <input
                      type="tel"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleFormChange}
                      placeholder="+1 234-567-8900"
                      className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
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
                      className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleFormChange}
                      placeholder="Enter full address"
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
                    />
                  </div>
                </div>

                {/* Services Section */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Services <span className="text-red-500">*</span></h3>
                  {services.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-xs">No services available</p>
                  ) : (
                    <div className="max-h-48 overflow-y-auto space-y-2">
                      {services.map((service) => (
                        <label key={service.id} className="flex items-start gap-2 p-2 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition">
                          <input
                            type="checkbox"
                            checked={formData.selectedServices.includes(service.id)}
                            onChange={() => handleServiceToggle(service.id)}
                            className="w-4 h-4 mt-0.5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-900 dark:text-white">{service.name}</p>
                            <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">${service.price}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Payment Section */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Payment</h3>
                  <select
                    name="paymentStatus"
                    value={formData.paymentStatus}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
                  >
                    <option value="full">Full Payment</option>
                    <option value="advance">Advance Payment</option>
                    <option value="partial">Partial Payment</option>
                  </select>

                  {formData.paymentStatus === 'advance' && (
                    <input
                      type="number"
                      name="advanceAmount"
                      value={formData.advanceAmount}
                      onChange={handleFormChange}
                      placeholder="Advance amount"
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
                    />
                  )}
                </div>

                {/* Total Amount */}
                {formData.selectedServices.length > 0 && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Total Amount:</span>
                      <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">${total.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {/* Form Actions */}
                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition font-medium text-sm"
                  >
                    Create Bill
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-4 py-2 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition font-medium text-sm"
                  >
                    Clear
                  </button>
                </div>
              </form>
            </div>
          </motion.div>

          {/* RIGHT SIDE: Thermal Printer Bill Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="space-y-4">
              {/* Preview Controls */}
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Bill Preview</h2>
                {formData.selectedServices.length > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handlePrintBill}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-medium text-sm"
                  >
                    <Printer size={18} />
                    Print Bill
                  </motion.button>
                )}
              </div>

              {/* Thermal Printer Preview */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-slate-700" id="thermal-bill-preview">
                <ThermalBillPreview formData={formData} services={services} total={total} />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bills History Section */}
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
            </div>
          </div>

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
        </motion.div>
      </div>

      </div>
    </Layout>
  );
};

// Thermal Printer Bill Preview Component
const ThermalBillPreview = ({ formData, services, total }) => {
  const billDate = new Date();
  const billNumber = `#${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  
  const getSelectedServiceDetails = () => {
    return services.filter(s => formData.selectedServices.includes(s.id));
  };

  const selectedServices = getSelectedServiceDetails();
  const remainingAmount = formData.paymentStatus === 'advance' 
    ? (total - (parseFloat(formData.advanceAmount) || 0))
    : 0;

  return (
    <div className="font-mono text-xs text-gray-900 dark:text-gray-100 leading-relaxed">
      {/* Header */}
      <div className="text-center mb-4 pb-4 border-b-2 border-gray-400 print:border-black">
        <div className="text-sm font-bold">SHINE ART STUDIO</div>
        <div className="text-xs text-gray-600 dark:text-gray-400">Professional Photography & Videography</div>
        <div className="text-xs text-gray-600 dark:text-gray-400">Address • Phone • Email</div>
      </div>

      {/* Receipt Information */}
      <div className="mb-3 pb-3 border-b border-gray-300 print:border-gray-400 text-xs">
        <div className="flex justify-between">
          <span>RECEIPT {billNumber}</span>
          <span>{billDate.toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between text-gray-600 dark:text-gray-400">
          <span>{billDate.toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Customer Information */}
      {formData.customerName && (
        <div className="mb-3 pb-3 border-b border-gray-300 print:border-gray-400 text-xs">
          <div className="font-bold">CUSTOMER</div>
          <div>{formData.customerName}</div>
          {formData.mobileNumber && <div>Phone: {formData.mobileNumber}</div>}
          {formData.email && <div>Email: {formData.email}</div>}
          {formData.address && <div className="text-xs whitespace-pre-wrap">{formData.address}</div>}
        </div>
      )}

      {/* Items */}
      {selectedServices.length > 0 && (
        <div className="mb-3 pb-3 border-b border-gray-300 print:border-gray-400">
          <div className="flex justify-between font-bold text-xs mb-2">
            <span>DESCRIPTION</span>
            <span>AMOUNT</span>
          </div>
          {selectedServices.map((service) => (
            <div key={service.id} className="flex justify-between text-xs mb-1">
              <span>{service.name}</span>
              <span>${service.price.toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Totals */}
      <div className="mb-3 pb-3 border-b border-gray-300 print:border-gray-400">
        <div className="flex justify-between text-xs font-bold mb-1">
          <span>SUBTOTAL</span>
          <span>${total.toFixed(2)}</span>
        </div>
        {formData.paymentStatus === 'advance' && (
          <>
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
              <span>ADVANCE PAID</span>
              <span>${(parseFloat(formData.advanceAmount) || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs font-bold text-orange-600 dark:text-orange-400">
              <span>REMAINING</span>
              <span>${remainingAmount.toFixed(2)}</span>
            </div>
          </>
        )}
      </div>

      {/* Payment Status */}
      <div className="mb-3 pb-3 border-b border-gray-300 print:border-gray-400 text-xs">
        <div className="flex justify-between">
          <span>TOTAL AMOUNT</span>
          <span className="font-bold text-sm">${total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-600 dark:text-gray-400">
          <span>PAYMENT</span>
          <span className="uppercase font-bold">
            {formData.paymentStatus === 'full' && '✓ PAID'}
            {formData.paymentStatus === 'advance' && '◐ ADVANCE'}
            {formData.paymentStatus === 'partial' && '◓ PARTIAL'}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-600 dark:text-gray-400 mt-4">
        <div className="mb-1">Thank you for your business!</div>
        <div className="text-xs">Please keep this receipt for your records</div>
        <div className="mt-2 text-gray-400">---</div>
      </div>
    </div>
  );
};
