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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Invoices</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">View and manage all invoices</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-800 rounded-lg text-sm">
            <FileText size={18} className="text-blue-600" />
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
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Invoices Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInvoices.map((invoice, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <FileText size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Invoice ID</p>
                    <p className="font-semibold text-gray-900 dark:text-white">#{invoice.id}</p>
                  </div>
                </div>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition">
                  <MoreHorizontal size={18} className="text-gray-500" />
                </button>
              </div>

              <div className="space-y-3 mb-4 pb-4 border-b border-gray-200 dark:border-slate-800">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Customer</p>
                  <p className="font-medium text-gray-900 dark:text-white">{invoice.customer_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Amount</p>
                  <p className="text-2xl font-bold text-blue-600">£{invoice.price?.toFixed(2) || '0.00'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
                  <p className="text-sm text-gray-900 dark:text-white">{new Date(invoice.booking_date).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleDownloadPDF(invoice.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800/50 transition font-medium text-sm"
                >
                  <Download size={16} />
                  Download
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition font-medium text-sm">
                  <Eye size={16} />
                  View
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredInvoices.length === 0 && (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No invoices found</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Invoices;
