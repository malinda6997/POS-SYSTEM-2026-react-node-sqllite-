import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, MoreHorizontal, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import Layout from '../components/Layout';
import api from '../utils/api';

const Billing = () => {
  const [billings, setBillings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchBillings();
  }, []);

  const fetchBillings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/bookings');
      setBillings(res.data.data || []);
    } catch (err) {
      console.error('Error fetching billings:', err);
    } finally {
      setLoading(false);
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

  const filteredBillings = billings.filter((bill) => {
    const matchSearch = bill.service_name?.toLowerCase().includes(search.toLowerCase()) ||
                       bill.customer_name?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || bill.status?.toLowerCase() === filter;
    return matchSearch && matchFilter;
  });

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-96">
          <div className="text-gray-500 dark:text-gray-400">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Billing</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage all billing transactions</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
            <Plus size={20} />
            New Billing
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by customer or service..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Billings Table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 overflow-hidden shadow-sm"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Customer</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Service</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Date</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBillings.map((bill, idx) => {
                  const statusColor = getStatusColor(bill.status);
                  const StatusIcon = statusColor.icon;
                  return (
                    <tr key={idx} className="border-b border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900 dark:text-white">{bill.customer_name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{bill.customer_phone}</p>
                      </td>
                      <td className="px-6 py-4 text-gray-900 dark:text-white">{bill.service_name}</td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{new Date(bill.booking_date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right font-semibold text-gray-900 dark:text-white">£{bill.price?.toFixed(2) || '0.00'}</td>
                      <td className="px-6 py-4">
                        <div className={`flex items-center gap-2 w-fit px-3 py-1 rounded-full ${statusColor.bg}`}>
                          <StatusIcon size={14} className={statusColor.text} />
                          <span className={`text-sm font-medium ${statusColor.text} capitalize`}>{bill.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition">
                          <MoreHorizontal size={18} className="text-gray-500" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredBillings.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No billings found</p>
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
};

export default Billing;
