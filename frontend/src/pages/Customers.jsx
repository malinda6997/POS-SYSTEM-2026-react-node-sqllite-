import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import Layout from '../components/Layout';
import { Users } from 'lucide-react';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/customers');
      setCustomers(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <div className="text-2xl text-slate-500 dark:text-slate-400">Loading...</div>
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
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Customers</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Manage your customers and their information</p>
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
              <thead className="bg-slate-100 dark:bg-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900 dark:text-white">Customer ID</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900 dark:text-white">Name</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900 dark:text-white">Mobile</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900 dark:text-white">Address</th>
                </tr>
              </thead>
              <tbody>
                {customers.length ? (
                  customers.map((customer) => (
                    <tr key={customer.id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-all">
                      <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">#{customer.id}</td>
                      <td className="px-6 py-4 text-slate-900 dark:text-white font-medium">{customer.customer_name}</td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{customer.mobile_number || 'N/A'}</td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400 max-w-xs truncate">{customer.address || 'N/A'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                      No customers found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default Customers;
