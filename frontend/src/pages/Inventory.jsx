import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import Layout from '../components/Layout';
import { Package, AlertTriangle } from 'lucide-react';

const Inventory = () => {
  const [frames, setFrames] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

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
      setLoading(false);
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
        <div>
          <h1 className="text-2xl font-bold text-gray-100 dark:text-white">Inventory</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your photo frames and stock levels</p>
        </div>

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
