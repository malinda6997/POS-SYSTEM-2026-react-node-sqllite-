import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import Layout from '../components/Layout';
import api from '../utils/api';

const Services = () => {
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [error, setError] = useState('');
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [newService, setNewService] = useState({
    service_name: '',
    category_id: '',
    price: '',
  });
  const [isDeleteServiceConfirmOpen, setIsDeleteServiceConfirmOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch categories and services
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, svcRes] = await Promise.all([
          api.get('/services/categories'),
          api.get('/services'),
        ]);
        setCategories(catRes.data || []);
        setServices(svcRes.data || []);
        setError('');
      } catch (err) {
        setError('Failed to load services');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Add new service
  const handleAddService = async () => {
    const trimmedName = newService.service_name?.trim();
    const categoryId = newService.category_id;
    const servicePrice = newService.price;

    // Validation
    if (!trimmedName) {
      setError('Service name is required');
      return;
    }
    
    if (!categoryId || categoryId === '') {
      setError('Please select a category');
      return;
    }
    
    if (!servicePrice) {
      setError('Price is required');
      return;
    }

    try {
      // Parse category_id safely
      const parsedCategoryId = parseInt(categoryId, 10);
      if (isNaN(parsedCategoryId) || parsedCategoryId <= 0) {
        setError('Invalid category selected');
        return;
      }
      
      const parsedPrice = parseFloat(servicePrice);
      if (isNaN(parsedPrice) || parsedPrice <= 0) {
        setError('Invalid price');
        return;
      }

      console.log('Sending service data:', {
        service_name: trimmedName,
        category_id: parsedCategoryId,
        price: parsedPrice,
      });

      const res = await api.post('/services', {
        service_name: trimmedName,
        category_id: parsedCategoryId,
        price: parsedPrice,
      });
      
      setServices([...services, res.data]);
      setNewService({ service_name: '', category_id: '', price: '' });
      setShowServiceForm(false);
      setError('');
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message;
      setError('Failed to add service: ' + errorMsg);
      console.error('Service creation error:', err);
    }
  };

  // Delete service
  const handleDeleteServiceConfirm = (service) => {
    setServiceToDelete(service);
    setIsDeleteServiceConfirmOpen(true);
  };

  const handleDeleteService = async () => {
    if (!serviceToDelete) return;
    setIsSubmitting(true);
    try {
      await api.delete(`/services/${serviceToDelete.id}`);
      setServices(services.filter(s => s.id !== serviceToDelete.id));
      setIsDeleteServiceConfirmOpen(false);
      setServiceToDelete(null);
      setError('');
    } catch (err) {
      setError('Failed to delete service');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-400">Loading services...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Error Alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-red-900/20 border border-red-700 rounded-lg flex items-center gap-2 text-red-400"
        >
          <AlertCircle size={18} />
          {error}
        </motion.div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-100">Services</h1>
        <button
          onClick={() => setShowServiceForm(!showServiceForm)}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-gray-900 px-4 py-2 rounded-lg font-semibold transition"
        >
          <Plus size={20} /> New Service
        </button>
      </div>

      {/* New Service Form */}
      {showServiceForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="Service name"
              value={newService.service_name}
              onChange={(e) => setNewService({ ...newService, service_name: e.target.value })}
              className="bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 placeholder-gray-400 focus:outline-none focus:border-amber-500"
            />
            <select
              value={newService.category_id || ''}
              onChange={(e) => {
                const selectedValue = e.target.value;
                console.log('Category selected:', selectedValue);
                setNewService({ ...newService, category_id: selectedValue });
              }}
              className="bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-amber-500"
            >
              <option value="">Select Category</option>
              {categories && categories.length > 0 ? (
                categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.category_name}
                  </option>
                ))
              ) : (
                <option disabled>No categories available</option>
              )}
            </select>
            <input
              type="number"
              placeholder="Price"
              value={newService.price}
              onChange={(e) => setNewService({ ...newService, price: e.target.value })}
              className="bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 placeholder-gray-400 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleAddService}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition"
            >
              Save Service
            </button>
            <button
              onClick={() => setShowServiceForm(false)}
              className="bg-gray-900 hover:bg-gray-800 text-gray-100 px-4 py-2 rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Categories & Services */}
      <div className="space-y-3">
        {categories.length > 0 ? (
          categories.map((category) => {
            const categoryServices = services.filter(s => s.category_id === category.id);
            const isExpanded = expandedCategory === category.id;

            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
              >
                {/* Category Header */}
                <button
                  onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-900/50 transition"
                >
                  <div className="flex items-center gap-3 flex-1">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    <span className="font-semibold text-gray-100">{category.category_name}</span>
                    {category.service_charge > 0 && (
                      <span className="text-amber-400 text-sm">Service Charge: Rs. {category.service_charge}</span>
                    )}
                    <span className="text-gray-400 text-sm">({categoryServices.length} services)</span>
                  </div>
                </button>

                {/* Services List */}
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-gray-900/30 border-t border-gray-700 px-4 py-3"
                  >
                    {categoryServices.length > 0 ? (
                      <div className="space-y-2">
                        {categoryServices.map((service) => (
                          <div
                            key={service.id}
                            className="flex items-center justify-between bg-gray-900 p-3 rounded-lg"
                          >
                            <div className="flex-1">
                              <div className="font-semibold text-gray-100">{service.service_name}</div>
                              <div className="text-sm text-gray-400">
                                Price: Rs. {service.price}
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteServiceConfirm(service)}
                              className="text-red-400 hover:text-red-300 transition p-2"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-sm">No services in this category</p>
                    )}
                  </motion.div>
                )}
              </motion.div>
            );
          })
        ) : (
          <div className="text-center py-12 text-gray-400">
            <p>No categories available. Go to <strong>Service Categories</strong> page to create categories first!</p>
          </div>
        )}
      </div>

      {/* Delete Service Confirmation Modal */}
      <AnimatePresence>
        {isDeleteServiceConfirmOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setIsDeleteServiceConfirmOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-6 w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Confirm Service Deletion</h2>
              </div>

              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Are you sure you want to delete <span className="font-semibold">{serviceToDelete?.service_name}</span>?
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsDeleteServiceConfirmOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteService}
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
    </Layout>
  );
};

export default Services;
