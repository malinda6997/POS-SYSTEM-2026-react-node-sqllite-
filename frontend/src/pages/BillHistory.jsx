import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Download, Eye, Printer, MoreVertical } from 'lucide-react';
import Layout from '../components/Layout';
import api from '../utils/api';

const BillHistory = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterGuest, setFilterGuest] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    fetchBills();
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

  const filteredBills = bills.filter((bill) => {
    const matchSearch =
      (bill.bill_number && bill.bill_number.toString().includes(search)) ||
      bill.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      bill.mobile_number?.includes(search);
    
    const isGuest = !bill.customer_id || bill.customer_id === 0;
    const matchGuest = filterGuest === 'all' || (filterGuest === 'guest' && isGuest) || (filterGuest === 'registered' && !isGuest);
    
    let matchDate = true;
    if (dateFrom) {
      matchDate = matchDate && new Date(bill.created_at || bill.booking_date) >= new Date(dateFrom);
    }
    if (dateTo) {
      matchDate = matchDate && new Date(bill.created_at || bill.booking_date) <= new Date(dateTo);
    }
    
    return matchSearch && matchGuest && matchDate;
  });

  const totalAmount = filteredBills.reduce((sum, bill) => sum + (bill.total_amount || bill.amount || 0), 0);

  return (
    <Layout>
      <div className="space-y-6 p-6 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Bill History</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Search and manage all bills</p>
          </div>
          <div className="text-right">
            <p className="text-gray-600 dark:text-gray-400 text-sm">Total Amount</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">${totalAmount.toFixed(2)}</p>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-5 gap-4"
        >
          {/* Search */}
          <div className="md:col-span-2 relative">
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by bill #, customer, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          {/* Customer Filter */}
          <div>
            <select
              value={filterGuest}
              onChange={(e) => setFilterGuest(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="all">All Customers</option>
              <option value="registered">Registered</option>
              <option value="guest">Guest</option>
            </select>
          </div>

          {/* Date From */}
          <div>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          {/* Date To */}
          <div>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
        </motion.div>

        {/* Bills Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden"
        >
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-500 dark:text-gray-400">Loading bills...</div>
            </div>
          ) : filteredBills.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <p className="text-gray-500 dark:text-gray-400 text-lg">No bills found</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Try adjusting your search filters</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Bill #</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                  {filteredBills.map((bill, index) => {
                    const isGuest = !bill.customer_id || bill.customer_id === 0;
                    return (
                      <motion.tr
                        key={bill.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition"
                      >
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">#{bill.bill_number || bill.id}</td>
                        <td className="px-6 py-4 text-gray-900 dark:text-white">{bill.customer_name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {bill.mobile_number && <p>{bill.mobile_number}</p>}
                          {bill.email && <p className="text-xs">{bill.email}</p>}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                          {new Date(bill.created_at || bill.booking_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-gray-900 dark:text-white">
                          ${(bill.total_amount || bill.amount || 0).toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            isGuest
                              ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                              : 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                          }`}>
                            {isGuest ? 'Guest' : 'Registered'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition" title="View">
                              <Eye size={16} className="text-blue-600 dark:text-blue-400" />
                            </button>
                            <button className="p-2 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg transition" title="Print">
                              <Printer size={16} className="text-green-600 dark:text-green-400" />
                            </button>
                            <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition">
                              <MoreVertical size={16} className="text-gray-600 dark:text-gray-400" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
};

export default BillHistory;
