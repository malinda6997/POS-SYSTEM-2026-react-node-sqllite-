import { useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Navbar = ({ onMenuClick }) => {
  const { theme, toggleTheme } = useAuth();

  return (
    <nav className="bg-white dark:bg-slate-800 shadow-md">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Menu Button */}
        <button
          onClick={onMenuClick}
          className="md:hidden text-slate-900 dark:text-white text-2xl"
        >
          ☰
        </button>

        {/* Logo */}
        <div className="hidden md:block">
          <h2 className="text-xl font-bold text-amber-500">Shine Art Studio</h2>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
