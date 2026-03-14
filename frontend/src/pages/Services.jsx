import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Plus, Edit, Trash2, ChevronDown, ChevronUp, X } from 'lucide-react';
import Layout from '../components/Layout';
import api from '../utils/api';

const Services = () => {
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [error, setError] = useState('');
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [newCategory, setNewCategory] = useState('');
  const [newCategoryCharge, setNewCategoryCharge] = useState('');
  const [newService, setNewService] = useState({
    service_name: '',
    category_id: '',
    price: '',
    duration: '',
  });
  const [isDeleteServiceConfirmOpen, setIsDeleteServiceConfirmOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [isDeleteCategoryConfirmOpen, setIsDeleteCategoryConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
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

  // Add new category
  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      setError('Category name is mandatory');
      return;
    }
    try {
      const res = await api.post('/services/categories', { 
        category_name: newCategory,
        service_charge: newCategoryCharge ? parseFloat(newCategoryCharge) : 0
      });
      setCategories([...categories, res.data]);
      setNewCategory('');
      setNewCategoryCharge('');
      setShowCategoryForm(false);
      setError('');
    } catch (err) {
      setError('Failed to add category');
      console.error(err);
    }
  };

  // Add new service
  const handleAddService = async () => {
    if (!newService.service_name || !newService.category_id || !newService.price) {
      setError('Service name, category, and price are required');
      return;
    }
    try {
      const res = await api.post('/services', {
        service_name: newService.service_name,
        category_id: parseInt(newService.category_id),
        price: parseFloat(newService.price),
        duration: newService.duration ? parseInt(newService.duration) : null,
      });
      setServices([...services, res.data]);
      setNewService({ service_name: '', category_id: '', price: '', duration: '' });
      setShowServiceForm(false);
      setError('');
    } catch (err) {
      setError('Failed to add service');
      console.error(err);
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

  // Delete category
  const handleDeleteCategoryConfirm = (category) => {
    setCategoryToDelete(category);
    setIsDeleteCategoryConfirmOpen(true);
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    setIsSubmitting(true);
    try {
      await api.delete(`/services/categories/${categoryToDelete.id}`);
      setCategories(categories.filter(c => c.id !== categoryToDelete.id));
      setServices(services.filter(s => s.category_id !== categoryToDelete.id));
      setIsDeleteCategoryConfirmOpen(false);
      setCategoryToDelete(null);
      setError('');
    } catch (err) {
      setError('Failed to delete category');
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
        <h1 className="text-2xl font-bold text-gray-100">Services & Categories</h1>
        <button
          onClick={() => setShowCategoryForm(!showCategoryForm)}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-gray-900 px-4 py-2 rounded-lg font-semibold transition"
        >
          <Plus size={20} /> New Category
        </button>
      </div>

      {/* New Category Form */}
      {showCategoryForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <input
              type="text"
              placeholder="Category name"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="md:col-span-2 bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 placeholder-gray-400 focus:outline-none focus:border-amber-500"
            />
            <input
              type="number"
              placeholder="Service Charge (Optional)"
              value={newCategoryCharge}
              onChange={(e) => setNewCategoryCharge(e.target.value)}
              className="bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 placeholder-gray-400 focus:outline-none focus:border-amber-500"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddCategory}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition"
              >
                Save
              </button>
              <button
                onClick={() => setShowCategoryForm(false)}
                className="flex-1 bg-gray-900 hover:bg-gray-800 text-gray-100 px-4 py-2 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      )}

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
              value={newService.category_id}
              onChange={(e) => setNewService({ ...newService, category_id: e.target.value })}
              className="bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-amber-500"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.category_name}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Price"
              value={newService.price}
              onChange={(e) => setNewService({ ...newService, price: e.target.value })}
              className="bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 placeholder-gray-400 focus:outline-none focus:border-amber-500"
            />
            <input
              type="number"
              placeholder="Duration (mins)"
              value={newService.duration}
              onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
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
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCategoryConfirm(category);
                    }}
                    className="text-red-400 hover:text-red-300 transition"
                  >
                    <Trash2 size={18} />
                  </button>
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
                                Price: Rs. {service.price} {service.duration && `• Duration: ${service.duration} mins`}
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
                    <button
                      onClick={() => {
                        setSelectedCategory(category.id);
                        setShowServiceForm(true);
                      }}
                      className="mt-3 w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-100 py-2 rounded-lg transition"
                    >
                      <Plus size={16} /> Add Service
                    </button>
                  </motion.div>
                )}
              </motion.div>
            );
          })
        ) : (
          <div className="text-center py-12 text-gray-400">
            No categories yet. Create one to get started!
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Confirm Service Deletion</h2>
                <button
                  onClick={() => setIsDeleteServiceConfirmOpen(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                >
                  <X size={20} className="text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Remove <span className="font-semibold">{serviceToDelete?.service_name}</span> from your service catalog? This action cannot be undone.
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

      {/* Delete Category Confirmation Modal */}
      <AnimatePresence>
        {isDeleteCategoryConfirmOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setIsDeleteCategoryConfirmOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-6 w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Confirm Category Deletion</h2>
                <button
                  onClick={() => setIsDeleteCategoryConfirmOpen(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                >
                  <X size={20} className="text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Delete <span className="font-semibold">{categoryToDelete?.category_name}</span> and all its services? This action cannot be reversed.
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsDeleteCategoryConfirmOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteCategory}
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
