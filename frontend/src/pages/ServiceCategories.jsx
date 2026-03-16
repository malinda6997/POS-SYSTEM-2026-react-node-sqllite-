import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import Layout from '../components/Layout';
import api from '../utils/api';

const ServiceCategories = () => {
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [error, setError] = useState('');
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newCategoryCharge, setNewCategoryCharge] = useState('');
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
        setCategories(catRes.data.data || []);
        setServices(svcRes.data.data || []);
        setError('');
      } catch (err) {
        setError('Failed to load categories');
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
      console.log('New category created:', res.data);
      
      const newCategoryData = res.data;
      setCategories([...categories, newCategoryData]);
      
      setNewCategory('');
      setNewCategoryCharge('');
      setShowCategoryForm(false);
      setError('');
    } catch (err) {
      setError('Failed to add category');
      console.error(err);
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
          <div className="text-gray-400">Loading categories...</div>
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
        <h1 className="text-2xl font-bold text-gray-100">Service Categories</h1>
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

      {/* Categories List */}
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
                      <ul className="space-y-2">
                        {categoryServices.map((service) => (
                          <li key={service.id} className="text-gray-300 text-sm flex justify-between items-center">
                            <span>{service.service_name}</span>
                            <span className="text-amber-400">Rs. {service.price}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-400 text-sm italic">No services in this category</p>
                    )}
                  </motion.div>
                )}
              </motion.div>
            );
          })
        ) : (
          <div className="text-center py-10 text-gray-400">
            No categories created yet. Click "New Category" to add one.
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
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
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-bold text-gray-100 mb-4">Delete Category?</h2>
              <p className="text-gray-400 mb-6">
                Are you sure you want to delete "{categoryToDelete?.category_name}"?
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setIsDeleteCategoryConfirmOpen(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteCategory}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:opacity-50"
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

export default ServiceCategories;
