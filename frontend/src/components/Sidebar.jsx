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
        className="fixed md:static left-0 top-0 h-screen w-64 bg-gradient-to-b from-slate-900 to-slate-950 border-r border-slate-700 z-50 md:z-0 overflow-y-auto"
      >
        {/* Logo */}
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur border-b border-slate-700 p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
              SA
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Shine Art</h1>
              <p className="text-xs text-gray-400">POS System</p>
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="px-4 py-4 border-b border-slate-700 mx-2 mt-4 rounded-lg bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.full_name}</p>
              <span className="inline-block bg-blue-600/30 text-blue-200 px-2 py-0.5 rounded text-xs font-medium mt-1 capitalize">
                {userRole}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 mt-6">
          {menuItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                isActive(item.to)
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {isActive(item.to) && <ChevronRight size={18} />}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700 bg-slate-950">
          <button
            onClick={() => {
              logout();
              onClose();
              window.location.href = '/login';
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600/20 text-red-400 hover:bg-red-600/40 rounded-lg font-semibold transition-all border border-red-600/30"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
