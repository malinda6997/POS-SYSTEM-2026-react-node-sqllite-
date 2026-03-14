import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import api from '../utils/api';
import Layout from '../components/Layout';
import { Users, Plus, X, Edit2, Trash2, Search as SearchIcon } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Customers = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [formData, setFormData] = useState({
    customer_name: '',
    mobile_number: '',
    address: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = user?.role?.toLowerCase() === 'admin' || user?.role === 'Administrator';

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    handleSearch(searchTerm);
  }, [customers]);

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/customers');
      setCustomers(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching customers:', err);
      toast.error(err.response?.data?.message || 'Failed to load customers');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    if (!formData.customer_name.trim()) {
      toast.warning('Please enter the customer name');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/customers', formData);
      setFormData({ customer_name: '', mobile_number: '', address: '' });
      setIsModalOpen(false);
      toast.success('Customer added successfully!');
      fetchCustomers();
    } catch (err) {
      console.error('Error adding customer:', err);
      toast.error(err.response?.data?.message || 'Failed to add customer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (term.length < 5) {
      setFilteredCustomers(customers);
    } else {
      const filtered = customers.filter((customer) =>
        customer.customer_name.toLowerCase().includes(term.toLowerCase()) ||
        (customer.mobile_number && customer.mobile_number.includes(term))
      );
      setFilteredCustomers(filtered);
    }
  };

  const handleEditCustomer = (customer) => {
    if (!isAdmin) return;
    setEditingCustomer(customer);
    setFormData({
      customer_name: customer.customer_name,
      mobile_number: customer.mobile_number || '',
      address: customer.address || '',
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateCustomer = async (e) => {
    e.preventDefault();
    if (!formData.customer_name.trim()) {
      toast.warning('Please enter customer name');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.put(`/customers/${editingCustomer.id}`, formData);
      setFormData({ customer_name: '', mobile_number: '', address: '' });
      setIsEditModalOpen(false);
      setEditingCustomer(null);
      toast.success('Customer updated successfully!');
      fetchCustomers();
    } catch (err) {
      console.error('Error updating customer:', err);
      toast.error(err.response?.data?.message || 'Failed to update customer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = (customer) => {
    if (!isAdmin) return;
    setCustomerToDelete(customer);
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteCustomer = async () => {
    if (!customerToDelete) return;

    setIsSubmitting(true);
    try {
      await api.delete(`/customers/${customerToDelete.id}`);
      setIsDeleteConfirmOpen(false);
      setCustomerToDelete(null);
      toast.success('Customer deleted successfully!');
      fetchCustomers();
    } catch (err) {
      console.error('Error deleting customer:', err);
      toast.error(err.response?.data?.message || 'Failed to delete customer');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <div className="text-2xl text-gray-500 dark:text-gray-400">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-100 dark:text-white">Customers</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your customers and their information</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => {
                setFormData({ customer_name: '', mobile_number: '', address: '' });
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 px-4 py-2 rounded-lg transition text-white font-medium"
            >
              <Plus size={20} />
              Add Customer
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <SearchIcon size={18} className="absolute left-4 top-3.5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search by name or mobile (5+ characters)..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
          />
          {searchTerm.length < 5 && searchTerm.length > 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Type {5 - searchTerm.length} more character{5 - searchTerm.length !== 1 ? 's' : ''} to search
            </p>
          )}
        </div>

        {/* Customers Table */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left font-bold text-gray-900 dark:text-white">Customer ID</th>
                  <th className="px-6 py-3 text-left font-bold text-gray-900 dark:text-white">Name</th>
                  <th className="px-6 py-3 text-left font-bold text-gray-900 dark:text-white">Mobile</th>
                  <th className="px-6 py-3 text-left font-bold text-gray-900 dark:text-white">Address</th>
                  {isAdmin && <th className="px-6 py-3 text-left font-bold text-gray-900 dark:text-white">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.length ? (
                  filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-all">
                      <td className="px-6 py-4 font-semibold text-gray-100 dark:text-white">#{customer.id}</td>
                      <td className="px-6 py-4 text-gray-100 dark:text-white font-medium">{customer.customer_name}</td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{customer.mobile_number || 'N/A'}</td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400 max-w-xs truncate">{customer.address || 'N/A'}</td>
                      {isAdmin && (
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditCustomer(customer)}
                              className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition"
                              title="Edit customer"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteConfirm(customer)}
                              className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition"
                              title="Delete customer"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={isAdmin ? 5 : 4} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      {searchTerm.length >= 5 ? 'No customers found matching your search' : 'No customers found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Add Customer Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
              onClick={() => setIsModalOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-6 w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add New Customer</h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                  >
                    <X size={20} className="text-gray-600 dark:text-gray-400" />
                  </button>
                </div>

                <form onSubmit={handleAddCustomer} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Customer Name *
                    </label>
                    <input
                      type="text"
                      name="customer_name"
                      value={formData.customer_name}
                      onChange={handleInputChange}
                      placeholder="Enter customer name"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      name="mobile_number"
                      value={formData.mobile_number}
                      onChange={handleInputChange}
                      placeholder="Enter mobile number"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Address
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Enter address"
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 resize-none"
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-2 bg-gray-900 hover:bg-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 text-white rounded-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Adding...' : 'Add Customer'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Customer Modal */}
        <AnimatePresence>
          {isEditModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
              onClick={() => setIsEditModalOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-6 w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Customer</h2>
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                  >
                    <X size={20} className="text-gray-600 dark:text-gray-400" />
                  </button>
                </div>

                <form onSubmit={handleUpdateCustomer} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Customer Name *
                    </label>
                    <input
                      type="text"
                      name="customer_name"
                      value={formData.customer_name}
                      onChange={handleInputChange}
                      placeholder="Enter customer name"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      name="mobile_number"
                      value={formData.mobile_number}
                      onChange={handleInputChange}
                      placeholder="Enter mobile number"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Address
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Enter address"
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 resize-none"
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-2 bg-gray-900 hover:bg-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 text-white rounded-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Updating...' : 'Update Customer'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {isDeleteConfirmOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
              onClick={() => setIsDeleteConfirmOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-6 w-full max-w-sm"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Confirm Customer Removal</h2>
                  <button
                    onClick={() => setIsDeleteConfirmOpen(false)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                  >
                    <X size={20} className="text-gray-600 dark:text-gray-400" />
                  </button>
                </div>

                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  Permanently delete customer <span className="font-semibold">{customerToDelete?.customer_name}</span>? All associated records including bookings, payments, and transaction history will be permanently removed from the system and cannot be recovered.
                </p>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsDeleteConfirmOpen(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteCustomer}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </Layout>
  );
};

export default Customers;
