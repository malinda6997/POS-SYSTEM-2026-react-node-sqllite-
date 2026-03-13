import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout, userRole } = useAuth();
  const location = useLocation();

  const getMenuItems = () => {
    const baseItems = [
      { label: 'Dashboard', to: '/dashboard', icon: '📊' },
    ];

    const roleBasedItems = {
      Administrator: [
        { label: 'Bookings', to: '/bookings', icon: '📅' },
        { label: 'Customers', to: '/customers', icon: '👥' },
        { label: 'Services', to: '/services', icon: '🎨' },
        { label: 'Inventory', to: '/inventory', icon: '📦' },
        { label: 'Expenses', to: '/expenses', icon: '💰' },
        { label: 'Users', to: '/users', icon: '🔑' },
        { label: 'Settings', to: '/settings', icon: '⚙️' },
      ],
      admin: [
        { label: 'Bookings', to: '/bookings', icon: '📅' },
        { label: 'Customers', to: '/customers', icon: '👥' },
        { label: 'Services', to: '/services', icon: '🎨' },
        { label: 'Inventory', to: '/inventory', icon: '📦' },
        { label: 'Expenses', to: '/expenses', icon: '💰' },
      ],
      staff: [
        { label: 'Bookings', to: '/bookings', icon: '📝' },
        { label: 'Services', to: '/services', icon: '🎨' },
        { label: 'Inventory', to: '/inventory', icon: '📦' },
      ],
    };

    return [
      ...baseItems,
      ...(roleBasedItems[userRole] || []),
    ];
  };

  const menuItems = getMenuItems();
  const isActive = (to) => location.pathname === to;

  return (
    <>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 md:hidden z-40"
        />
      )}

      <motion.aside
        animate={{ x: isOpen ? 0 : -256 }}
        transition={{ duration: 0.3 }}
        className="fixed md:static left-0 top-0 h-screen w-64 bg-white dark:bg-slate-950 border-r border-gray-200 dark:border-slate-800 z-50 md:z-0 overflow-y-auto shadow-sm"
      >
        {/* Logo */}
        <div className="sticky top-0 bg-white dark:bg-slate-950 border-b border-gray-200 dark:border-slate-800 p-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
              <span className="text-white font-bold text-lg">Z</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">Zenith</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">ERP System</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 mt-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 font-medium text-sm ${
                  isActive(item.to)
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon size={18} />
                <span className="flex-1">{item.label}</span>
                {isActive(item.to) && <ChevronRight size={16} />}
              </Link>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50">
          <p className="text-xs text-gray-500 dark:text-gray-400">v1.0.0</p>
        </div>
      </motion.aside>
    </>
  );

export default Sidebar;
