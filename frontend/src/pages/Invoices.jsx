import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Eye, MoreHorizontal, Search, Filter, FileText } from 'lucide-react';
import Layout from '../components/Layout';
import api from '../utils/api';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await api.get('/bookings');
      setInvoices(res.data.data || []);
    } catch (err) {
      console.error('Error fetching invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchSearch = inv.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
                       inv.id?.toString().includes(search);
    return matchSearch;
  });

  const handleDownloadPDF = async (invoiceId) => {
    try {
      const res = await api.get(`/bookings/${invoiceId}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentElement.removeChild(link);
    } catch (err) {
      console.error('Error downloading PDF:', err);
    }
  };

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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invoices</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Browse and manage all invoices</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-black rounded-lg border border-gray-800 text-sm">
            <FileText size={18} className="text-gray-700 dark:text-gray-300" />
            <span className="text-gray-900 dark:text-white font-medium">{invoices.length} Total</span>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by invoice ID or customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-800 rounded-lg bg-black dark:bg-black text-white focus:outline-none focus:ring-2 focus:ring-gray-700"
            />
          </div>
        </div>

        {/* Invoices Table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left font-bold text-gray-900 dark:text-white">Invoice ID</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-900 dark:text-white">Customer</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-900 dark:text-white">Amount</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-900 dark:text-white">Date</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-900 dark:text-white">Status</th>
                  <th className="px-6 py-4 text-center font-bold text-gray-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.length > 0 ? (
                  filteredInvoices.map((invoice, idx) => (
                    <motion.tr
                      key={idx}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">#{invoice.id}</td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{invoice.customer_name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{invoice.customer_mobile || 'N/A'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">£{invoice.price?.toFixed(2) || '0.00'}</td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{new Date(invoice.booking_date).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600">
                          {invoice.status || 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleDownloadPDF(invoice.id)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition text-gray-700 dark:text-gray-300"
                            title="Download"
                          >
                            <Download size={16} />
                          </button>
                          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition text-gray-700 dark:text-gray-300"
                            title="View">
                            <Eye size={16} />
                          </button>
                          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition text-gray-700 dark:text-gray-300">
                            <MoreHorizontal size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <FileText size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                      <p className="text-gray-500 dark:text-gray-400 font-medium">No invoices found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Pagination Info */}
        {filteredInvoices.length > 0 && (
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Showing 1-{filteredInvoices.length} of {filteredInvoices.length} results</span>
            <div className="flex gap-2">
              <button className="px-3 py-1 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition">Previous</button>
              <button className="px-3 py-1 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition">Next</button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Invoices;
