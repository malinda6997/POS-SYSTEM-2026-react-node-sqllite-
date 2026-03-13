import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import api from '../utils/api';
import Layout from '../components/Layout';
import { Package, AlertTriangle, Plus, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Inventory = () => {
  const { user } = useAuth();
  const [frames, setFrames] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    frame_name: '',
    buying_price: '',
    selling_price: '',
    quantity: '',
  });

  const isAdmin = user?.role?.toLowerCase() === 'admin' || user?.role === 'Administrator';
  const isStaff = user?.role?.toLowerCase() === 'staff' || isAdmin;

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await api.get('/frames/summary/overview');
      setFrames(response.data.frames || []);
      setSummary(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching inventory:', err);
      toast.error('Failed to load inventory');
      setLoading(false);
    }
  };

  const handleAddFrame = async () => {
    if (!formData.frame_name || !formData.buying_price || !formData.selling_price) {
      toast.error('Frame name, buying price, and selling price are mandatory');
      return;
    }

    try {
      if (editingId) {
        await api.put(`/frames/${editingId}`, {
          frame_name: formData.frame_name,
          buying_price: parseFloat(formData.buying_price),
          selling_price: parseFloat(formData.selling_price),
        });
        toast.success('Inventory item updated successfully!');
      } else {
        await api.post('/frames', {
          frame_name: formData.frame_name,
          buying_price: parseFloat(formData.buying_price),
          selling_price: parseFloat(formData.selling_price),
          quantity: formData.quantity ? parseInt(formData.quantity) : 0,
        });
        toast.success('Inventory item added successfully!');
      }
      
      setFormData({ frame_name: '', buying_price: '', selling_price: '', quantity: '' });
      setEditingId(null);
      setShowAddForm(false);
      fetchInventory();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to save inventory item');
    }
  };

  const handleEditFrame = (frame) => {
    setFormData({
      frame_name: frame.frame_name,
      buying_price: frame.buying_price,
      selling_price: frame.selling_price,
      quantity: frame.quantity,
    });
    setEditingId(frame.id);
    setShowAddForm(true);
  };

  const handleDeleteFrame = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" from inventory? This action cannot be undone.`)) return;

    try {
      await api.delete(`/frames/${id}`);
      toast.success('Inventory item deleted successfully!');
      fetchInventory();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete inventory item');
    }
  };

  const handleCancel = () => {
    setFormData({ frame_name: '', buying_price: '', selling_price: '', quantity: '' });
    setEditingId(null);
    setShowAddForm(false);
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
        {/* Header with Add Button */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-100 dark:text-white">Inventory</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your photo frames and stock levels</p>
          </div>
          {isStaff && (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-gray-900 px-4 py-2 rounded-lg font-semibold transition"
            >
              <Plus size={20} /> Add Inventory
            </button>
          )}
        </div>

        {/* Add/Edit Form */}
        {showAddForm && isStaff && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg mb-6"
          >
            <h3 className="text-lg font-semibold text-gray-100 mb-4">{editingId ? 'Edit Inventory Item' : 'Add New Inventory Item'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Frame name"
                value={formData.frame_name}
                onChange={(e) => setFormData({ ...formData, frame_name: e.target.value })}
                className="bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 placeholder-gray-400 focus:outline-none focus:border-amber-500"
              />
              <input
                type="number"
                placeholder="Buying price"
                value={formData.buying_price}
                onChange={(e) => setFormData({ ...formData, buying_price: e.target.value })}
                className="bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 placeholder-gray-400 focus:outline-none focus:border-amber-500"
              />
              <input
                type="number"
                placeholder="Selling price"
                value={formData.selling_price}
                onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                className="bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 placeholder-gray-400 focus:outline-none focus:border-amber-500"
              />
              <input
                type="number"
                placeholder="Quantity"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 placeholder-gray-400 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleAddFrame}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition"
              >
                {editingId ? 'Update' : 'Save'}
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-900 hover:bg-gray-800 text-gray-100 px-4 py-2 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="border border-gray-200 dark:border-gray-700 rounded-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Frames</p>
                <p className="text-3xl font-bold text-gray-100 dark:text-white mt-2">{summary?.total_frames}</p>
              </div>
              <div className="bg-gray-700 dark:bg-gray-600 p-4 rounded-lg">
                <Package className="text-white" size={32} />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="border border-gray-200 dark:border-gray-700 rounded-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Inventory Value</p>
                <p className="text-3xl font-bold text-gray-100 dark:text-white mt-2">
                  Rs. {summary?.total_inventory_value?.toFixed(0)}
                </p>
              </div>
              <div className="bg-gray-700 dark:bg-gray-600 p-4 rounded-lg">
                <Package className="text-white" size={32} />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="border border-gray-200 dark:border-gray-700 rounded-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Low Stock Items</p>
                <p className="text-3xl font-bold text-gray-700 dark:text-gray-300 mt-2">{summary?.low_stock_count}</p>
              </div>
              <div className="bg-gray-700 dark:bg-gray-600 p-4 rounded-lg">
                <AlertTriangle className="text-white" size={32} />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Frames Table */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left font-bold text-gray-900 dark:text-white">Frame Name</th>
                  <th className="px-6 py-3 text-left font-bold text-gray-900 dark:text-white">Quantity</th>
                  <th className="px-6 py-3 text-left font-bold text-gray-900 dark:text-white">Buying Price</th>
                  <th className="px-6 py-3 text-left font-bold text-gray-900 dark:text-white">Selling Price</th>
                  <th className="px-6 py-3 text-left font-bold text-gray-900 dark:text-white">Profit/Unit</th>
                  <th className="px-6 py-3 text-left font-bold text-gray-900 dark:text-white">Stock Value</th>
                  <th className="px-6 py-3 text-left font-bold text-gray-900 dark:text-white">Status</th>
                  {isStaff && <th className="px-6 py-3 text-left font-bold text-gray-900 dark:text-white">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {frames.map((frame) => (
                  <tr key={frame.id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-all">
                    <td className="px-6 py-4 font-semibold text-gray-100 dark:text-white">{frame.frame_name}</td>
                    <td className="px-6 py-4 text-gray-100 dark:text-white">{frame.quantity}</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">Rs. {frame.buying_price}</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">Rs. {frame.selling_price}</td>
                    <td className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">
                      Rs. {(frame.selling_price - frame.buying_price).toFixed(0)}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-100 dark:text-white">
                      Rs. {frame.total_value?.toFixed(0)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        frame.status === 'Out of Stock' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                        frame.status === 'Low Stock' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {frame.status}
                      </span>
                    </td>
                    {isStaff && (
                      <td className="px-6 py-4 flex gap-2">
                        <button
                          onClick={() => handleEditFrame(frame)}
                          className="text-blue-400 hover:text-blue-300 transition p-2"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteFrame(frame.id, frame.frame_name)}
                            className="text-red-400 hover:text-red-300 transition p-2"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default Inventory;
