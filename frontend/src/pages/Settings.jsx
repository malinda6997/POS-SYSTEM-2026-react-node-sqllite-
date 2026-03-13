import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Lock, Database, Bell, Shield } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../hooks/useAuth';

const Settings = () => {
  const { userRole, user, toggleTheme, theme } = useAuth();
  const [activeTab, setActiveTab] = useState('general');

  // Only Administrator can access full settings
  const isAdministrator = userRole === 'Administrator';

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon, admin: false },
    { id: 'appearance', label: 'Appearance', icon: Lock, admin: false },
    { id: 'security', label: 'Security', icon: Shield, admin: true },
    { id: 'database', label: 'Database', icon: Database, admin: true },
  ];

  const visibleTabs = tabs.filter(tab => !tab.admin || isAdministrator);

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-2">
          <SettingsIcon size={32} />
          Settings
        </h1>
      </div>

      {/* Tabs */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {visibleTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
                activeTab === tab.id
                  ? 'bg-amber-500 text-slate-900'
                  : 'bg-slate-700 text-slate-100 hover:bg-slate-600'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* General Settings */}
      {activeTab === 'general' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-gray-200 dark:border-gray-700 rounded-lg p-6"
        >
          <h2 className="text-xl font-bold text-slate-100 mb-4">General Settings</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Studio Name</label>
              <input
                type="text"
                defaultValue="Shine Art Studio"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Email</label>
              <input
                type="email"
                defaultValue="info@shineart.com"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Phone</label>
              <input
                type="tel"
                defaultValue="+92 123 456 7890"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <button className="bg-gray-700 dark:bg-gray-600 hover:bg-gray-800 dark:hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold transition">
                Save Changes
              </button>
              <button className="bg-gray-400 dark:bg-gray-700 hover:bg-gray-500 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-6 py-2 rounded-lg transition">
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Appearance Settings */}
      {activeTab === 'appearance' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-gray-200 dark:border-gray-700 rounded-lg p-6"
        >
          <h2 className="text-xl font-bold text-slate-100 mb-4">Appearance Settings</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Theme</label>
              <div className="flex gap-3">
                <button
                  onClick={() => toggleTheme()}
                  className={`px-6 py-2 rounded-lg font-semibold transition ${
                    theme === 'dark'
                      ? 'bg-amber-500 text-slate-900'
                      : 'bg-slate-700 text-slate-100 hover:bg-slate-600'
                  }`}
                >
                  {theme === 'dark' ? '🌙 Dark Mode (Current)' : '☀️ Light Mode (Current)'}
                </button>
                <button
                  onClick={() => toggleTheme()}
                  className={`px-6 py-2 rounded-lg font-semibold transition ${
                    theme === 'light'
                      ? 'bg-amber-500 text-slate-900'
                      : 'bg-slate-700 text-slate-100 hover:bg-slate-600'
                  }`}
                >
                  {theme === 'light' ? '🌞 Light Mode (Current)' : '🌙 Dark Mode'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Font Size</label>
              <select className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-amber-500">
                <option>Small</option>
                <option selected>Medium</option>
                <option>Large</option>
              </select>
            </div>

            <div className="flex gap-2 pt-4">
              <button className="bg-gray-700 dark:bg-gray-600 hover:bg-gray-800 dark:hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold transition">
                Save Changes
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Security Settings (Admin only) */}
      {activeTab === 'security' && isAdministrator && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-gray-200 dark:border-gray-700 rounded-lg p-6"
        >
          <h2 className="text-xl font-bold text-slate-100 mb-4">Security Settings</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Session Timeout (minutes)</label>
              <input
                type="number"
                defaultValue="30"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
              <p className="text-sm text-slate-300">
                <strong>Security Tip:</strong> Sessions will automatically expire after the configured timeout period for enhanced security.
              </p>
            </div>

            <div className="flex gap-2 pt-4">
              <button className="bg-gray-700 dark:bg-gray-600 hover:bg-gray-800 dark:hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold transition">
                Save Changes
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Database Settings (Admin only) */}
      {activeTab === 'database' && isAdministrator && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-gray-200 dark:border-gray-700 rounded-lg p-6"
        >
          <h2 className="text-xl font-bold text-slate-100 mb-4">Database Settings</h2>
          
          <div className="space-y-4">
            <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
              <p className="text-sm text-slate-300">
                <strong>Database Status:</strong> <span className="text-green-400">Connected</span>
              </p>
              <p className="text-xs text-slate-400 mt-2">SQLite database at: /backend/data/shine_art_pro.db</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Backup Database</label>
              <button className="bg-gray-700 dark:bg-gray-600 hover:bg-gray-800 dark:hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold transition">
                Create Backup
              </button>
              <p className="text-xs text-slate-400 mt-2">Last backup: Never</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Clear Cache</label>
              <button className="bg-gray-700 dark:bg-gray-600 hover:bg-gray-800 dark:hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold transition">
                Clear Application Cache
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Admin-only settings message */}
      {!isAdministrator && (
        <div className="bg-gray-100 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mt-6">
          <p className="text-gray-700 dark:text-gray-300 text-sm">
            <Shield size={16} className="inline mr-2" />
            Some settings are only available to Administrators.
          </p>
        </div>
      )}
    </Layout>
  );
};

export default Settings;
