import { Menu, Moon, Sun, Bell, Search } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Navbar = ({ onMenuClick }) => {
  const { theme, toggleTheme } = useAuth();

  return (
    <nav className="sticky top-0 bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shadow-sm z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 hover:bg-gray-100 rounded-lg transition md:hidden"
        >
          <Menu size={24} className="text-gray-700" />
        </button>
        <div className="hidden md:block">
          <h2 className="text-xl font-bold text-gray-800">Shine Art Studio</h2>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-4 py-2 max-w-xs">
          <Search size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent ml-2 text-sm focus:outline-none text-gray-700 placeholder-gray-400 w-40"
          />
        </div>

        <button className="p-2 hover:bg-gray-100 rounded-lg transition relative">
          <Bell size={20} className="text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <button
          onClick={toggleTheme}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          {theme === 'dark' ? (
            <Sun size={20} className="text-yellow-500" />
          ) : (
            <Moon size={20} className="text-gray-600" />
          )}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
