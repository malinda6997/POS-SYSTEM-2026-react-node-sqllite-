import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Trash2, Eye, X, Download, Printer, CheckCircle } from 'lucide-react';
import Layout from '../components/Layout';
import api from '../utils/api';
import { formatLKR } from '../utils/currency';

const Billing = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Bill generation state
  const [generatedBill, setGeneratedBill] = useState(null);
  const [showBillModal, setShowBillModal] = useState(false);

  // Success notification state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    customerName: '',
    mobileNumber: '',
    address: '',
    email: '',
    paymentStatus: 'full',
    advanceAmount: '',
    customerGivenAmount: '',
    selectedServices: [],
    serviceQuantities: {}, // Track quantities for each service
  });

  useEffect(() => {
    fetchBills();
    fetchServices();
    fetchCategories();
    fetchCustomers();
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

  const fetchCategories = async () => {
    try {
      const res = await api.get('/services/categories');
      setCategories(res.data.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/customers');
      console.log('API Response:', res.data);
      const customersData = res.data.data || [];
      console.log('Total customers loaded:', customersData.length, customersData);
      setCustomers(customersData);
    } catch (err) {
      console.error('Error fetching customers:', err);
    }
  };

  const handleFormChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Filter customers when typing customer name - only after 3 characters
    if (name === 'customerName') {
      console.log('Customer name changed to:', value, 'Available customers:', customers.length);
      if (value.length >= 3) {
        const filtered = customers.filter(c =>
          c.customer_name.toLowerCase().includes(value.toLowerCase()) ||
          c.mobile_number?.includes(value) ||
          c.address?.toLowerCase().includes(value.toLowerCase())
        );
        console.log('Filtered results:', filtered);
        setFilteredCustomers(filtered);
        setShowCustomerDropdown(true);
      } else {
        setFilteredCustomers([]);
        setShowCustomerDropdown(false);
      }
    }
  }, [customers]);

  const handleServiceToggle = (serviceId) => {
    setFormData((prev) => {
      const isSelected = prev.selectedServices.includes(serviceId);
      const newSelectedServices = isSelected
        ? prev.selectedServices.filter((id) => id !== serviceId)
        : [...prev.selectedServices, serviceId];
      
      const newQuantities = { ...prev.serviceQuantities };
      if (!isSelected && !newQuantities[serviceId]) {
        newQuantities[serviceId] = 1; // Default quantity is 1
      }
      
      return {
        ...prev,
        selectedServices: newSelectedServices,
        serviceQuantities: newQuantities,
      };
    });
  };

  const updateServiceQuantity = (serviceId, quantity) => {
    if (quantity <= 0) {
      handleServiceToggle(serviceId); // Deselect if quantity is 0
    } else {
      setFormData((prev) => ({
        ...prev,
        serviceQuantities: {
          ...prev.serviceQuantities,
          [serviceId]: quantity,
        },
      }));
    }
  };

  const calculateTotal = () => {
    return formData.selectedServices.reduce((total, serviceId) => {
      const service = services.find((s) => s.id === serviceId);
      const quantity = formData.serviceQuantities[serviceId] || 1;
      return total + ((service?.price || 0) * quantity);
    }, 0);
  };

  const handleDownloadBill = () => {
    if (!generatedBill?.file_name) return;
    
    const link = document.createElement('a');
    link.href = `http://localhost:5000/api/bookings/download-bill/${generatedBill.file_name}`;
    link.download = generatedBill.file_name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintBill = () => {
    if (!generatedBill?.file_name) return;
    
    // Open PDF in new window for printing
    const printWindow = window.open(
      `http://localhost:5000/api/bookings/download-bill/${generatedBill.file_name}`,
      '_blank'
    );
    
    if (printWindow) {
      printWindow.addEventListener('load', () => {
        printWindow.print();
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.customerName.trim()) {
      alert('Customer name is required');
      return;
    }

    if (formData.mobileNumber.trim() === '') {
      alert('Customer mobile number is required');
      return;
    }

    if (formData.address.trim() === '') {
      alert('Customer address is required');
      return;
    }

    if (formData.selectedServices.length === 0) {
      alert('Please select at least one service');
      return;
    }

    const total = calculateTotal();
    if (total === 0) {
      alert('Total amount cannot be zero. Please add services');
      return;
    }

    if (formData.paymentStatus === 'advance' && !formData.advanceAmount) {
      alert('Please enter advance amount');
      return;
    }

    try {
      // Prepare service data with proper format
      const servicesList = formData.selectedServices.map(serviceId => {
        const service = services.find(s => s.id === serviceId);
        const quantity = formData.serviceQuantities[serviceId] || 1;
        return {
          id: service.id,
          service_name: service.service_name || service.name,
          price: service.price,
          quantity: quantity
        };
      });

      const billData = {
        customer_name: formData.customerName,
        mobile_number: formData.mobileNumber,
        address: formData.address,
        email: formData.email || null,
        services: servicesList,
        total_amount: total,
        payment_status: formData.paymentStatus,
        advance_amount: formData.paymentStatus === 'advance' ? parseFloat(formData.advanceAmount) || 0 : null,
        status: 'Pending',
      };

      // Create booking record
      console.log('Submitting bill data:', billData);
      const response = await api.post('/bookings', billData);
      console.log('Booking created:', response.data);
      const bookingData = response.data.data;

      // Generate professional bill PDF
      console.log('Generating bill with ID:', bookingData.id);
      const billResponse = await api.post('/bookings/generate-bill-now', {
        ...billData,
        id: bookingData.id,
        date: new Date().toISOString()
      });
      console.log('Bill response:', billResponse);
      console.log('Bill data:', billResponse.data);

      if (billResponse.status === 200 && billResponse.data?.data?.file_name) {
        // Store bill info and show modal
        console.log('✅ Showing bill modal with:', billResponse.data.data);
        setGeneratedBill({
          booking_id: bookingData.id,
          file_name: billResponse.data.data.file_name,
          file_path: billResponse.data.data.file_path,
          customer_name: formData.customerName,
          total_amount: total
        });
        setShowBillModal(true);
        
        // Show success toast/notification
        setSuccessMessage('✅ Bill generated successfully! Download or print now.');
        setShowSuccessModal(true);
        setTimeout(() => setShowSuccessModal(false), 3000);
      } else {
        console.error('❌ Bill response invalid:', billResponse.data);
        throw new Error(billResponse.data?.message || 'Bill file not generated');
      }

      // Reset form
      setFormData({
        customerName: '',
        mobileNumber: '',
        address: '',
        email: '',
        paymentStatus: 'full',
        advanceAmount: '',
        customerGivenAmount: '',
        selectedServices: [],
        serviceQuantities: {},
      });
      
      // Reset dropdowns and modals
      setShowCustomerDropdown(false);
      setFilteredCustomers([]);
      setShowServiceModal(false);
      setSelectedCategory(null);
      
      // Refresh bills list
      setTimeout(() => fetchBills(), 1000);
    } catch (err) {
      console.error('❌ Error in bill generation:');
      console.error('  Full error object:', err);
      console.error('  Error response:', err.response?.data);
      console.error('  Error message:', err.message);
      
      let errorMsg = 'Failed to generate bill';
      if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMsg = err.response.data.error;
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      console.error('📢 Showing alert:', errorMsg);
      alert('❌ Error: ' + errorMsg);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return { bg: 'bg-gray-900 dark:bg-gray-900', text: 'text-gray-300 dark:text-gray-300', icon: '✓' };
      case 'pending':
        return { bg: 'bg-gray-900 dark:bg-gray-900', text: 'text-gray-300 dark:text-gray-300', icon: '◐' };
      case 'cancelled':
        return { bg: 'bg-gray-900 dark:bg-gray-900', text: 'text-gray-300 dark:text-gray-300', icon: '✕' };
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

  const selectCustomer = (customer) => {
    setFormData(prev => ({
      ...prev,
      customerName: customer.customer_name,
      mobileNumber: customer.mobile_number || '',
      email: customer.email || '',
      address: customer.address || '',
    }));
    setShowCustomerDropdown(false);
    setFilteredCustomers([]);
  };

  const addNewCustomer = async () => {
    if (!formData.customerName.trim()) {
      alert('Customer name is required');
      return;
    }

    try {
      const res = await api.post('/customers', {
        customer_name: formData.customerName,
        mobile_number: formData.mobileNumber || null,
        email: formData.email || null,
        address: formData.address || null,
      });
      
      // Add new customer to the list
      const newCustomer = res.data.data;
      setCustomers([...customers, newCustomer]);
      setShowCustomerDropdown(false);
      
      // Show professional success modal
      setSuccessMessage(`${formData.customerName} added successfully!`);
      setShowSuccessModal(true);
      
      // Auto-close after 3 seconds
      setTimeout(() => {
        setShowSuccessModal(false);
      }, 3000);
    } catch (err) {
      console.error('Error adding customer:', err);
      alert('Error adding customer: ' + err.message);
    }
  };

  const resetCustomerSection = () => {
    setFormData(prev => ({
      ...prev,
      customerName: '',
      mobileNumber: '',
      address: '',
      email: '',
    }));
    setShowCustomerDropdown(false);
    setFilteredCustomers([]);
  };

  const resetForm = () => {
    setFormData({
      customerName: '',
      mobileNumber: '',
      address: '',
      email: '',
      paymentStatus: 'full',
      advanceAmount: '',
      customerGivenAmount: '',
      selectedServices: [],
      serviceQuantities: {},
    });
    setShowCustomerDropdown(false);
    setFilteredCustomers([]);
  };

  return (
    <Layout>
      <div className="space-y-6 p-6 min-h-screen bg-black">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Billing System</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Create bills with thermal printer support and manage billing records</p>
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
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* PART 1: Customer Details Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide border-b border-gray-800 pb-2">1. Customer Details</h3>
                    {formData.customerName && (
                      <button
                        type="button"
                        onClick={resetCustomerSection}
                        className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded text-gray-300 transition font-medium"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Customer Name <span className="text-gray-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleFormChange}
                      onFocus={() => {
                        if (formData.customerName && filteredCustomers.length > 0) {
                          setShowCustomerDropdown(true);
                        }
                      }}
                      placeholder="Enter customer name or search existing"
                      required
                      className="w-full px-3 py-2 border border-gray-800 rounded-lg bg-black dark:bg-black text-white focus:outline-none focus:ring-2 focus:ring-gray-700 transition text-sm"
                    />
                    
                    {/* Customer Dropdown */}
                    <AnimatePresence>
                      {showCustomerDropdown && filteredCustomers.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
                        >
                          {filteredCustomers.map((customer) => (
                            <button
                              key={customer.id}
                              type="button"
                              onClick={() => selectCustomer(customer)}
                              className="w-full text-left px-4 py-2 hover:bg-gray-700 transition border-b border-gray-700 last:border-b-0"
                            >
                              <div className="text-sm font-medium text-white">{customer.customer_name}</div>
                              <div className="text-xs text-gray-400">
                                {customer.mobile_number}
                              </div>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>

                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 mb-1">Mobile Number</label>
                      <input
                        type="tel"
                        name="mobileNumber"
                        value={formData.mobileNumber}
                        onChange={handleFormChange}
                        placeholder="+1-234-567-8900"
                        className="w-full px-3 py-2 border border-gray-800 rounded-lg bg-black dark:bg-black text-white focus:outline-none focus:ring-2 focus:ring-gray-700 transition text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 mb-1">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleFormChange}
                        placeholder="customer@example.com"
                        className="w-full px-3 py-2 border border-gray-800 rounded-lg bg-black dark:bg-black text-white focus:outline-none focus:ring-2 focus:ring-gray-700 transition text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 mb-1">Address</label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleFormChange}
                      placeholder="Enter full address"
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-800 rounded-lg bg-black dark:bg-black text-white focus:outline-none focus:ring-2 focus:ring-gray-700 transition text-sm"
                    />
                  </div>

                  {/* Add Customer Button - Shows when customer not found */}
                  {formData.customerName.trim().length >= 3 && formData.address.trim().length > 0 && !filteredCustomers.some(c => c.customer_name.toLowerCase() === formData.customerName.toLowerCase()) && (
                    <button
                      type="button"
                      onClick={addNewCustomer}
                      className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white transition font-medium text-sm"
                    >
                      + Add New Customer
                    </button>
                  )}
                </div>

                {/* PART 2: Category and Services Section */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide border-b border-gray-800 pb-2">2. Select Category & Services <span className="text-gray-500">*</span></h3>
                  {categories.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No categories available</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => {
                            setSelectedCategory(category);
                            setShowServiceModal(true);
                          }}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-medium transition transform hover:scale-105"
                        >
                          {category.category_name}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Service Selection Modal */}
                  <AnimatePresence>
                    {showServiceModal && selectedCategory && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                        onClick={() => setShowServiceModal(false)}
                      >
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.9, opacity: 0 }}
                          className="bg-gray-900 rounded-lg p-6 w-full max-w-md max-h-[600px] overflow-y-auto border border-gray-700"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Modal Header with Category Info */}
                          <div className="mb-6 pb-4 border-b border-gray-700">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h3 className="text-lg font-bold text-white">{selectedCategory.category_name}</h3>
                                <p className="text-sm text-gray-400 mt-1">Select services and set quantities</p>
                              </div>
                              <button
                                onClick={() => setShowServiceModal(false)}
                                className="text-gray-400 hover:text-white transition"
                              >
                                <X size={24} />
                              </button>
                            </div>
                            
                            {/* Category Details */}
                            <div className="bg-gray-800 rounded-lg p-3 space-y-1">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Category Price:</span>
                                <span className="text-white font-semibold">{formatLKR(0)}</span>
                              </div>
                              {selectedCategory.service_charge > 0 && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-400">Service Charge:</span>
                                  <span className="text-blue-400 font-semibold">{formatLKR(selectedCategory.service_charge)}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Services List */}
                          <div className="space-y-3">
                            {services.filter(s => s.category_id === selectedCategory.id).length === 0 ? (
                              <p className="text-gray-500 text-sm">No services in this category</p>
                            ) : (
                              services
                                .filter(s => s.category_id === selectedCategory.id)
                                .map((service) => (
                                  <div
                                    key={service.id}
                                    className="p-3 border border-gray-700 rounded-lg hover:bg-gray-800/50 transition"
                                  >
                                    <div className="flex items-start justify-between mb-2">
                                      <div className="flex-1">
                                        <p className="text-sm font-medium text-white">{service.name}</p>
                                        <p className="text-xs text-gray-400">{formatLKR(service.price)}</p>
                                      </div>
                                      <input
                                        type="checkbox"
                                        checked={formData.selectedServices.includes(service.id)}
                                        onChange={() => handleServiceToggle(service.id)}
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 mt-1"
                                      />
                                    </div>

                                    {/* Quantity Controls */}
                                    {formData.selectedServices.includes(service.id) && (
                                      <div className="flex items-center justify-between bg-gray-800 rounded-lg p-2">
                                        <span className="text-xs text-gray-400">Quantity:</span>
                                        <div className="flex items-center gap-2">
                                          <button
                                            type="button"
                                            onClick={() => updateServiceQuantity(service.id, (formData.serviceQuantities[service.id] || 1) - 1)}
                                            className="w-6 h-6 flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white rounded transition text-sm font-bold"
                                          >
                                            −
                                          </button>
                                          <span className="w-8 text-center text-white font-semibold">
                                            {formData.serviceQuantities[service.id] || 1}
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => updateServiceQuantity(service.id, (formData.serviceQuantities[service.id] || 1) + 1)}
                                            className="w-6 h-6 flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white rounded transition text-sm font-bold"
                                          >
                                            +
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))
                            )}
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* PART 3: Payment Type Section */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide border-b border-gray-800 pb-2">3. Select Payment Type</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition" style={{borderColor: formData.paymentStatus === 'full' ? 'rgb(34, 197, 94)' : 'rgb(107, 114, 128)', backgroundColor: formData.paymentStatus === 'full' ? 'rgb(34, 197, 94)' : 'rgb(55, 65, 81)'}}>
                      <input
                        type="radio"
                        name="paymentStatus"
                        value="full"
                        checked={formData.paymentStatus === 'full'}
                        onChange={handleFormChange}
                        className="w-4 h-4 text-white"
                      />
                      <span className="text-sm font-medium text-white">Full Payment</span>
                    </label>
                    <label className="flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition" style={{borderColor: formData.paymentStatus === 'advance' ? 'rgb(34, 197, 94)' : 'rgb(107, 114, 128)', backgroundColor: formData.paymentStatus === 'advance' ? 'rgb(34, 197, 94)' : 'rgb(55, 65, 81)'}}>
                      <input
                        type="radio"
                        name="paymentStatus"
                        value="advance"
                        checked={formData.paymentStatus === 'advance'}
                        onChange={handleFormChange}
                        className="w-4 h-4 text-white"
                      />
                      <span className="text-sm font-medium text-white">Advance Payment</span>
                    </label>
                  </div>
                </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-8 pt-6 border-t border-gray-700">
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold text-sm"
                >
                  Generate Bill
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-3 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition font-semibold text-sm"
                >
                  Clear
                </button>
              </div>
            </form>
            </div>
          </motion.div>

          {/* RIGHT SIDE: Billing Summary with Money Fields (1 Column) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 sticky top-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Billing Summary</h2>
              
              {/* Customer Details Section */}
              {formData.customerName && (
                <div className="mb-6 pb-6 border-b border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-4">Customer Info</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center p-2 bg-gray-900 rounded">
                      <span className="text-gray-400 font-medium">Name:</span>
                      <span className="text-white font-semibold">{formData.customerName}</span>
                    </div>
                    {formData.mobileNumber && (
                      <div className="flex justify-between items-center p-2 bg-gray-900 rounded">
                        <span className="text-gray-400 font-medium">Phone:</span>
                        <span className="text-white font-semibold">{formData.mobileNumber}</span>
                      </div>
                    )}
                    {formData.email && (
                      <div className="flex justify-between items-center p-2 bg-gray-900 rounded">
                        <span className="text-gray-400 font-medium">Email:</span>
                        <span className="text-white text-xs truncate ml-2">{formData.email}</span>
                      </div>
                    )}
                    {formData.address && (
                      <div className="flex justify-between items-start p-2 bg-gray-900 rounded">
                        <span className="text-gray-400 font-medium">Address:</span>
                        <span className="text-white text-xs text-right max-w-[140px] ml-2">{formData.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Added Services View Section */}
              {formData.selectedServices.length > 0 && (
                <div className="mb-6 pb-6 border-b border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-4">Services ({formData.selectedServices.length})</h3>
                  <div className="space-y-3">
                    {services
                      .filter(s => formData.selectedServices.includes(s.id))
                      .map((service) => {
                        const quantity = formData.serviceQuantities[service.id] || 1;
                        const itemTotal = service.price * quantity;
                        return (
                          <div key={service.id} className="flex items-start justify-between p-3 bg-gray-900 rounded-lg border border-gray-700 hover:border-gray-600 transition">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white break-words">{service.service_name}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                {formatLKR(service.price)} × {quantity} = <span className="text-green-400 font-semibold">{formatLKR(itemTotal)}</span>
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleServiceToggle(service.id)}
                              className="ml-3 px-3 py-1 text-xs bg-red-600/20 text-red-400 rounded hover:bg-red-600/40 transition font-medium whitespace-nowrap"
                            >
                              Remove
                            </button>
                          </div>
                        );
                      })}
                  </div>
                  
                  {/* Total Amount */}
                  <div className="mt-4 p-4 bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg border border-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-400">Total Amount:</span>
                      <span className="text-2xl font-bold text-white">{formatLKR(total)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Money Input Fields */}
              <div className="space-y-4">
                {formData.paymentStatus === 'full' ? (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                        Full Amount
                      </label>
                      <div className="text-3xl font-bold text-white">{formatLKR(total)}</div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                        Given by Customer
                      </label>
                      <input
                        type="number"
                        name="customerGivenAmount"
                        value={formData.customerGivenAmount}
                        onChange={handleFormChange}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition text-sm font-medium"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                        Total Amount
                      </label>
                      <div className="text-3xl font-bold text-white">{formatLKR(total)}</div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                        Advance to Collect
                      </label>
                      <input
                        type="number"
                        name="advanceAmount"
                        value={formData.advanceAmount}
                        onChange={handleFormChange}
                        placeholder="Enter advance amount"
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition text-sm font-medium"
                      />
                      {total && (
                        <p className="text-xs text-gray-500 mt-2">Remaining: {formatLKR(Math.max(0, total - (parseFloat(formData.advanceAmount) || 0)))}</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* BILLS HISTORY SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Bills History</h2>
            {filteredBills.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No bills generated yet. Create your first bill above.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBills.map((bill) => (
                  <div key={bill.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white">{bill.customer_name || 'Unknown'}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{bill.mobile_number || 'N/A'} • {formatLKR(bill.total_amount || 0)}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {bill.bill_generated_at ? new Date(bill.bill_generated_at).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      {bill.bill_file_name ? (
                        <>
                          <button onClick={() => { const link = document.createElement('a'); link.href = `http://localhost:5000/api/bookings/download-bill/${bill.bill_file_name}`; link.download = bill.bill_file_name; document.body.appendChild(link); link.click(); document.body.removeChild(link); }} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-semibold flex items-center gap-1" title="Download">
                            <Download size={14} />
                            Download
                          </button>
                          <button onClick={() => { const printWindow = window.open(`http://localhost:5000/api/bookings/download-bill/${bill.bill_file_name}`, '_blank'); if (printWindow) { printWindow.addEventListener('load', () => { printWindow.print(); }); } }} className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm font-semibold flex items-center gap-1" title="Print">
                            <Printer size={14} />
                            Print
                          </button>
                        </>
                      ) : (
                        <span className="px-3 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-sm">No Bill</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Bill Generation Modal */}
      <AnimatePresence>
        {showBillModal && generatedBill && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowBillModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Bill Generated!</h3>
                <button
                  onClick={() => setShowBillModal(false)}
                  className="p-1 hover:bg-gray-700 rounded transition"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 mb-6 border border-gray-700 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Customer:</span>
                  <span className="text-sm font-medium text-white">{generatedBill.customer_name}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-700">
                  <span className="text-sm text-gray-400">Total Amount:</span>
                  <span className="text-lg font-bold text-green-400">{formatLKR(generatedBill.total_amount)}</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleDownloadBill}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-semibold text-sm"
                >
                  <Download size={18} />
                  Download PDF
                </button>
                <button
                  onClick={handlePrintBill}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition font-semibold text-sm"
                >
                  <Printer size={18} />
                  Print Bill
                </button>
              </div>
              <button
                onClick={() => setShowBillModal(false)}
                className="w-full mt-3 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition text-sm font-medium"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Professional Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowSuccessModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-sm p-6 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.1 }}
                className="flex justify-center mb-4"
              >
                <div className="p-3 bg-green-500/20 rounded-full">
                  <CheckCircle size={48} className="text-green-400" />
                </div>
              </motion.div>
              <h3 className="text-xl font-bold text-white mb-2">Success!</h3>
              <p className="text-gray-300 mb-6">{successMessage}</p>
              <div className="h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent rounded-full mb-4" />
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-semibold text-sm"
              >
                Got it!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default Billing;