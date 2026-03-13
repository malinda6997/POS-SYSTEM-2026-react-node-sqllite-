import { useState, useCallback, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, ChevronRight, ChevronLeft, BarChart3, ShoppingCart, CreditCard, FileText, Users, Palette, Package, Settings, History, TrendingUp, HelpCircle, Calendar, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';

const Sidebar = ({ isOpen, onClose, isCollapsed, onToggleCollapse }) => {
  const { userRole } = useAuth();
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState(null);

  // Close sidebar on item click (mobile only)
  const handleMenuItemClick = useCallback((e) => {
    if (window.innerWidth < 768) {
      e.stopPropagation();
      setTimeout(() => onClose(), 100);
    }
  }, [onClose]);

  // Memoize menu items to prevent unnecessary re-renders
  const menuItems = useMemo(() => {
    const baseItems = [
      { label: 'Dashboard', to: '/dashboard', icon: BarChart3 },
      { label: 'Billing', to: '/billing', icon: CreditCard },
    ];

    const roleBasedItems = {
      Administrator: [
        { label: 'Bookings', to: '/bookings', icon: ShoppingCart },
        { label: 'Calendar', to: '/calendar', icon: Calendar },
        { label: 'Invoices', to: '/invoices', icon: FileText },
        { label: 'Bill History', to: '/bill-history', icon: History },
        { label: 'Customers', to: '/customers', icon: Users },
        { label: 'Services', to: '/services', icon: Palette },
        { label: 'Inventory', to: '/inventory', icon: Package },
        { label: 'Expenses', to: '/expenses', icon: CreditCard },
        { label: 'Reports', to: '/reports', icon: TrendingUp },
        { label: 'Users', to: '/users', icon: Users },
        { label: 'Role Features', to: '/role-features', icon: Lock },
        { label: 'Help', to: '/help', icon: HelpCircle },
        { label: 'Settings', to: '/settings', icon: Settings },
      ],
      admin: [
        { label: 'Bookings', to: '/bookings', icon: ShoppingCart },
        { label: 'Calendar', to: '/calendar', icon: Calendar },
        { label: 'Invoices', to: '/invoices', icon: FileText },
        { label: 'Bill History', to: '/bill-history', icon: History },
        { label: 'Customers', to: '/customers', icon: Users },
        { label: 'Services', to: '/services', icon: Palette },
        { label: 'Inventory', to: '/inventory', icon: Package },
        { label: 'Expenses', to: '/expenses', icon: CreditCard },
        { label: 'Reports', to: '/reports', icon: TrendingUp },
      ],
      staff: [
        { label: 'Bookings', to: '/bookings', icon: ShoppingCart },
        { label: 'Calendar', to: '/calendar', icon: Calendar },
        { label: 'Invoices', to: '/invoices', icon: FileText },
        { label: 'Bill History', to: '/bill-history', icon: History },
        { label: 'Services', to: '/services', icon: Palette },
        { label: 'Inventory', to: '/inventory', icon: Package },
      ],
    };

    return [...baseItems, ...(roleBasedItems[userRole] || [])];
  }, [userRole]);

  const isActive = useCallback((to) => location.pathname === to, [location.pathname]);

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 md:hidden z-30"
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            onClick={(e) => e.stopPropagation()}
            initial={{ x: -256 }}
            animate={{ x: 0 }}
            exit={{ x: -256 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed md:hidden left-0 top-0 h-screen w-64 bg-white dark:bg-slate-950 border-r border-gray-200 dark:border-slate-800 z-40 overflow-y-auto shadow-lg"
          >
            {/* Logo with Close Button */}
            <div className="sticky top-0 bg-white dark:bg-slate-950 border-b border-gray-200 dark:border-slate-800 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className=\"flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-gray-600 to-gray-700\">
                  <span className="text-white font-bold text-lg">Z</span>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900 dark:text-white">Zenith</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">ERP</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="p-4 space-y-1 mt-4">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={handleMenuItemClick}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 font-medium text-sm ${
                      active
                        ? 'bg-slate-700 dark:bg-slate-800 text-white shadow-md'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon size={18} className={active ? '' : 'text-gray-400'} />
                    <span className="flex-1">{item.label}</span>
                    {active && <ChevronRight size={16} />}
                  </Link>
                );
              })}
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop Collapsible Sidebar */}
      <motion.aside
        onClick={(e) => e.stopPropagation()}
        animate={{ width: isCollapsed ? 80 : 256 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="hidden md:flex flex-col bg-white dark:bg-slate-950 border-r border-gray-200 dark:border-slate-800 overflow-hidden flex-shrink-0"
      >
        {/* Logo Section */}
        <div className="bg-white dark:bg-slate-950 border-b border-gray-200 dark:border-slate-800 p-4 flex items-center justify-between flex-shrink-0 relative z-10">
          <motion.div
            className="flex items-center gap-3 min-w-0"
            animate={{ opacity: isCollapsed ? 0 : 1 }}
            transition={{ duration: 0.2 }}
            style={{ pointerEvents: isCollapsed ? 'none' : 'auto' }}
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-gray-600 to-gray-700 flex-shrink-0">
              <span className="text-white font-bold text-lg">Z</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-gray-900 dark:text-white whitespace-nowrap">Zenith</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">ERP</p>
            </div>
          </motion.div>

          {/* Collapse Toggle */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleCollapse();
            }}
            onMouseDown={(e) => e.preventDefault()}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-all duration-200 flex-shrink-0 ml-auto cursor-pointer active:scale-95 relative z-20 pointer-events-auto"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            type="button"
          >
            {isCollapsed ? (
              <ChevronRight size={20} className="text-gray-600 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-400" />
            ) : (
              <ChevronLeft size={20} className="text-gray-600 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-400" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 mt-4 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActiveItem = isActive(item.to);

            return (
              <div key={item.to} className="relative group">
                <Link
                  to={item.to}
                  onMouseEnter={() => setHoveredItem(item.to)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 font-medium text-sm relative ${
                    isActiveItem
                      ? 'bg-slate-700 dark:bg-slate-800 text-white shadow-md'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon size={18} className="flex-shrink-0" />
                  <motion.span
                    animate={{ opacity: isCollapsed ? 0 : 1, width: isCollapsed ? 0 : 'auto' }}
                    transition={{ duration: 0.2 }}
                    className="flex-1 whitespace-nowrap overflow-hidden"
                  >
                    {item.label}
                  </motion.span>
                  {isActiveItem && !isCollapsed && <ChevronRight size={16} className="flex-shrink-0" />}
                </Link>

                {/* Tooltip for Collapsed State */}
                {isCollapsed && hoveredItem === item.to && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 5 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-full ml-2 bg-gray-900 dark:bg-gray-800 text-white text-xs px-2 py-1.5 rounded-md whitespace-nowrap top-1/2 -translate-y-1/2 pointer-events-none z-50 font-medium"
                  >
                    {item.label}
                    <div className="absolute right-full w-0 h-0 border-t-4 border-b-4 border-r-4 border-t-transparent border-b-transparent border-r-gray-900 dark:border-r-gray-800"></div>
                  </motion.div>
                )}
              </div>
            );
          })}
        </nav>
      </motion.aside>
    </>
  );
};

export default Sidebar;
