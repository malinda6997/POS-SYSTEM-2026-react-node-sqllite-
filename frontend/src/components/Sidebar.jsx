import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout, userRole } = useAuth();

  // Role-based menu items
  const getMenuItems = () => {
    const baseItems = [
      { label: 'Dashboard', to: '/dashboard', roles: ['admin', 'Administrator', 'staff'] },
    ];

    const roleBasedItems = {
      Administrator: [
        { label: 'Bookings', to: '/bookings', roles: ['Administrator'] },
        { label: 'Customers', to: '/customers', roles: ['Administrator'] },
        { label: 'Services', to: '/services', roles: ['Administrator'] },
        { label: 'Inventory', to: '/inventory', roles: ['Administrator'] },
        { label: 'Expenses', to: '/expenses', roles: ['Administrator'] },
        { label: 'Users', to: '/users', roles: ['Administrator'] },
        { label: 'Settings', to: '/settings', roles: ['Administrator'] },
      ],
      admin: [
        { label: 'Bookings', to: '/bookings', roles: ['admin'] },
        { label: 'Customers', to: '/customers', roles: ['admin'] },
        { label: 'Services', to: '/services', roles: ['admin'] },
        { label: 'Inventory', to: '/inventory', roles: ['admin'] },
        { label: 'Expenses', to: '/expenses', roles: ['admin'] },
      ],
      staff: [
        { label: 'New Booking', to: '/new-booking', roles: ['staff'] },
        { label: 'Services', to: '/services', roles: ['staff'] },
        { label: 'Inventory Check', to: '/inventory', roles: ['staff'] },
      ],
    };

    return [
      ...baseItems,
      ...(roleBasedItems[userRole] || []),
    ];
  };

  const menuItems = getMenuItems();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-40"
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: isOpen ? 0 : -300 }}
        transition={{ duration: 0.3 }}
        className="fixed md:static left-0 top-0 h-screen w-64 bg-slate-900 dark:bg-slate-900 bg-opacity-95 backdrop-blur-md text-white shadow-lg z-50 md:z-0 md:translate-x-0 overflow-y-auto"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-2xl font-bold text-amber-400">✦ Shine Art</h1>
          <p className="text-sm text-slate-400 mt-1">Photography Studio POS</p>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-slate-700">
          <p className="text-sm font-semibold text-slate-100">{user?.full_name}</p>
          <span className="inline-block bg-amber-500 text-slate-900 px-3 py-1 rounded-full text-xs font-semibold mt-2 capitalize">
            {userRole}
          </span>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          {menuItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={onClose}
              className="block px-4 py-3 rounded-lg text-slate-100 hover:bg-amber-500 hover:text-slate-900 transition-all duration-200 font-medium mb-2"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
          <button
            onClick={() => {
              logout();
              onClose();
              window.location.href = '/login';
            }}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all"
          >
            Logout
          </button>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
