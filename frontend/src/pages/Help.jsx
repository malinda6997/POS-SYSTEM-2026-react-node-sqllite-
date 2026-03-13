import { useState } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, MessageSquare, BookOpen, ChevronDown, Mail, Phone, AlertCircle } from 'lucide-react';
import Layout from '../components/Layout';

const Help = () => {
  const [activeTab, setActiveTab] = useState('faq');
  const [expandedFaq, setExpandedFaq] = useState(0);

  const faqs = [
    {
      question: 'How do I create a bill for a customer?',
      answer:
        'Navigate to the Billing page, click "Create Bill", fill in the customer information (name is required), select services, choose payment type, and click "Create Bill". The bill will be generated and saved to your history.',
    },
    {
      question: 'What is the difference between a bill and an invoice?',
      answer:
        'A bill is a quick thermal receipt-style document for walk-in customers. An invoice is a professional A4 format document for bookings and advance payments with detailed itemization.',
    },
    {
      question: 'Can I bill customers without registering them?',
      answer:
        'Yes! You can create bills for guest customers. Simply fill in their name and optional contact details. Guest customers won\'t be added to your permanent customer list.',
    },
    {
      question: 'How do I track advance payments?',
      answer:
        'In the Billing page, when creating a bill, select "Advance Payment" as the payment type and enter the advance amount. This will be tracked separately and linked to the original booking for final settlement.',
    },
    {
      question: 'How can I export reports?',
      answer:
        'Go to the Reports & Analytics page, select the report type you want (Financial, Executive, Staff, or Expense), set the date range if needed, and click "Export PDF" to download.',
    },
    {
      question: 'How do I manage inventory?',
      answer:
        'Visit the Inventory page to manage photo frames. You can add new items with buying/selling prices, update stock quantities, and view low stock alerts on the dashboard.',
    },
    {
      question: 'How do I track expenses?',
      answer:
        'Go to the Expenses page, click "Add Expense", fill in the category, amount, and description. Expenses are categorized (Rent, Utilities, Supplies, etc.) for easy analysis.',
    },
    {
      question: 'Where can I find customer payment history?',
      answer:
        'You can search for a specific customer in the Customers page to see all their bills, invoices, and bookings. The Bill History page lets you search by customer name or phone number.',
    },
  ];

  const guides = [
    {
      title: 'Getting Started',
      content: `
        Welcome to Shine Art Studio POS System! Here's how to get started:
        
        1. Login with your credentials
        2. Update your profile in Settings
        3. Configure studio information
        4. Add services and inventory
        5. Start processing bills and bookings!
      `,
    },
    {
      title: 'Billing System',
      content: `
        The Billing System is designed for fast customer transactions:
        
        • Customer name is required
        • Mobile, email, and address are optional
        • Select services from your catalog
        • Choose payment type (Full, Advance, or Partial)
        • Bills are auto-generated and saved to history
        • You can reprint bills anytime
      `,
    },
    {
      title: 'Booking Management',
      content: `
        Use the Booking system for pre-scheduled services:
        
        • Create bookings with scheduled dates
        • Collect advance payments upfront
        • Link payments to specific bookings
        • Track booking status (Pending, Confirmed, Completed)
        • Generate settlement invoices for final payment
        • Maintain booking history per customer
      `,
    },
    {
      title: 'Customer Management',
      content: `
        Manage your customer database effectively:
        
        • Register new customers quickly
        • Search by phone number for quick lookup
        • View customer history (all bills & bookings)
        • Track guest vs. registered customers
        • Update customer information anytime
        • Export customer data for analysis
      `,
    },
    {
      title: 'Reports & Analytics',
      content: `
        Get business intelligence with comprehensive reports:
        
        • Financial Reports: Revenue, invoices, and payments
        • Executive Reports: Business intelligence and trends
        • Staff Reports: Individual staff performance
        • Expense Reports: Cost analysis and budgeting
        • Select date ranges for detailed analysis
        • Export as PDF for documentation
      `,
    },
    {
      title: 'Settings & Backup',
      content: `
        Configure and protect your system:
        
        • Update studio information and branding
        • Set appearance theme (Light/Dark)
        • Configure system preferences
        • Backup database regularly
        • export data for accounting
        • Manage user permissions and roles
      `,
    },
  ];

  return (
    <Layout>
      <div className="space-y-6 p-6 max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Help & Support</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Find answers and learn how to use the system</p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col md:flex-row gap-4 md:gap-0 md:border-b border-gray-200 dark:border-slate-700"
        >
          <button
            onClick={() => setActiveTab('faq')}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition border-b-2 md:border-b-2 ${
              activeTab === 'faq'
                ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
                : 'text-gray-700 dark:text-gray-300 border-transparent hover:border-gray-300 dark:hover:border-slate-600'
            }`}
          >
            <HelpCircle size={20} />
            FAQ
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition border-b-2 md:border-b-2 ${
              activeTab === 'guide'
                ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
                : 'text-gray-700 dark:text-gray-300 border-transparent hover:border-gray-300 dark:hover:border-slate-600'
            }`}
          >
            <BookOpen size={20} />
            User Guide
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition border-b-2 md:border-b-2 ${
              activeTab === 'contact'
                ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
                : 'text-gray-700 dark:text-gray-300 border-transparent hover:border-gray-300 dark:hover:border-slate-600'
            }`}
          >
            <MessageSquare size={20} />
            Contact Support
          </button>
        </motion.div>

        {/* FAQ Tab */}
        {activeTab === 'faq' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="space-y-4"
          >
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-lg"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? -1 : index)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700/50 transition"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-left">{faq.question}</h3>
                  <motion.div
                    animate={{ rotate: expandedFaq === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown size={24} className="text-gray-400" />
                  </motion.div>
                </button>

                {expandedFaq === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-gray-200 dark:border-slate-700 px-6 py-4 bg-gray-50 dark:bg-slate-700/30"
                  >
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{faq.answer}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* User Guide Tab */}
        {activeTab === 'guide' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {guides.map((guide, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg"
              >
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{guide.title}</h3>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line text-sm leading-relaxed">
                  {guide.content}
                </p>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Contact Support Tab */}
        {activeTab === 'contact' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="space-y-6"
          >
            {/* Contact Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-lg text-center"
              >
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                    <Mail size={32} className="text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Email Support</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Get help via email</p>
                <a
                  href="mailto:malindaprabath876@gmail.com"
                  className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                >
                  malindaprabath876@gmail.com
                </a>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-lg text-center"
              >
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-green-100 dark:bg-green-900/20 rounded-full">
                    <Phone size={32} className="text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">WhatsApp Support</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Chat with us on WhatsApp</p>
                <a
                  href="https://wa.me/94762206157"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
                >
                  +94 76 220 6157
                </a>
              </motion.div>
            </div>

            {/* System Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900 rounded-xl p-6"
            >
              <div className="flex items-start gap-4">
                <AlertCircle size={24} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-amber-900 dark:text-amber-200 mb-2">System Information</h3>
                  <div className="space-y-2 text-amber-800 dark:text-amber-300 text-sm">
                    <p>
                      <strong>Application:</strong> Shine Art Studio POS System
                    </p>
                    <p>
                      <strong>Version:</strong> 2.0.0 (Web Edition)
                    </p>
                    <p>
                      <strong>Build:</strong> 100% AI-Powered Development
                    </p>
                    <p>
                      <strong>Status:</strong> Production Ready
                    </p>
                    <p>
                      <strong>License:</strong> MIT License
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Tips */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900 rounded-xl p-6"
            >
              <h3 className="text-lg font-bold text-blue-900 dark:text-blue-200 mb-4">Pro Tips</h3>
              <ul className="space-y-2 text-blue-800 dark:text-blue-300 text-sm">
                <li>✓ Use keyboard shortcuts for faster navigation</li>
                <li>✓ Search customers by phone number for quick lookup</li>
                <li>✓ Backup your database regularly in Settings</li>
                <li>✓ Use reports to track business performance</li>
                <li>✓ Categorize expenses for better financial insights</li>
                <li>✓ Set low stock alerts for important inventory items</li>
              </ul>
            </motion.div>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default Help;
