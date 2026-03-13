import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Plus, Edit, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [newService, setNewService] = useState({
    service_name: '',
    category_id: '',
    price: '',
    duration: '',
  });

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
      setError('Category name is required');
      return;
    }
    try {
      const res = await api.post('/services/categories', { category_name: newCategory });
      setCategories([...categories, res.data]);
      setNewCategory('');
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
  const handleDeleteService = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      await api.delete(`/services/${serviceId}`);
      setServices(services.filter(s => s.id !== serviceId));
      setError('');
    } catch (err) {
      setError('Failed to delete service');
      console.error(err);
    }
  };

  // Delete category
  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure? This will delete the category and all its services.')) return;
    try {
      await api.delete(`/services/categories/${categoryId}`);
      setCategories(categories.filter(c => c.id !== categoryId));
      setServices(services.filter(s => s.category_id !== categoryId));
      setError('');
    } catch (err) {
      setError('Failed to delete category');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-slate-400">Loading services...</div>
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
        <h1 className="text-3xl font-bold text-slate-100">Services & Categories</h1>
        <button
          onClick={() => setShowCategoryForm(!showCategoryForm)}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-900 px-4 py-2 rounded-lg font-semibold transition"
        >
          <Plus size={20} /> New Category
        </button>
      </div>

      {/* New Category Form */}
      {showCategoryForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800 p-4 rounded-lg mb-6 border border-slate-700"
        >
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Category name"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-500"
            />
            <button
              onClick={handleAddCategory}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition"
            >
              Save
            </button>
            <button
              onClick={() => setShowCategoryForm(false)}
              className="bg-slate-700 hover:bg-slate-600 text-slate-100 px-4 py-2 rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* New Service Form */}
      {showServiceForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800 p-4 rounded-lg mb-6 border border-slate-700"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="Service name"
              value={newService.service_name}
              onChange={(e) => setNewService({ ...newService, service_name: e.target.value })}
              className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-500"
            />
            <select
              value={newService.category_id}
              onChange={(e) => setNewService({ ...newService, category_id: e.target.value })}
              className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
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
              className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-500"
            />
            <input
              type="number"
              placeholder="Duration (mins)"
              value={newService.duration}
              onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
              className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-500"
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
              className="bg-slate-700 hover:bg-slate-600 text-slate-100 px-4 py-2 rounded-lg transition"
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
                className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden"
              >
                {/* Category Header */}
                <button
                  onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-700/50 transition"
                >
                  <div className="flex items-center gap-3 flex-1">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    <span className="font-semibold text-slate-100">{category.category_name}</span>
                    <span className="text-slate-400 text-sm">({categoryServices.length} services)</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCategory(category.id);
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
                    className="bg-slate-700/30 border-t border-slate-700 px-4 py-3"
                  >
                    {categoryServices.length > 0 ? (
                      <div className="space-y-2">
                        {categoryServices.map((service) => (
                          <div
                            key={service.id}
                            className="flex items-center justify-between bg-slate-700 p-3 rounded-lg"
                          >
                            <div className="flex-1">
                              <div className="font-semibold text-slate-100">{service.service_name}</div>
                              <div className="text-sm text-slate-400">
                                Price: Rs. {service.price} {service.duration && `• Duration: ${service.duration} mins`}
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteService(service.id)}
                              className="text-red-400 hover:text-red-300 transition p-2"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-400 text-sm">No services in this category</p>
                    )}
                    <button
                      onClick={() => {
                        setSelectedCategory(category.id);
                        setShowServiceForm(true);
                      }}
                      className="mt-3 w-full flex items-center justify-center gap-2 bg-slate-600 hover:bg-slate-500 text-slate-100 py-2 rounded-lg transition"
                    >
                      <Plus size={16} /> Add Service
                    </button>
                  </motion.div>
                )}
              </motion.div>
            );
          })
        ) : (
          <div className="text-center py-12 text-slate-400">
            No categories yet. Create one to get started!
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Services;
