import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { Settings as SettingsIcon, Lock, Database, Bell, Shield, User, Upload } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';

const Settings = () => {
  const { userRole, user, toggleTheme, theme } = useAuth();
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    bio: user?.bio || '',
  });
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');

  // Only Administrator can access full settings
  const isAdministrator = userRole === 'Administrator';

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User, admin: false },
    { id: 'general', label: 'General', icon: SettingsIcon, admin: false },
    { id: 'appearance', label: 'Appearance', icon: Lock, admin: false },
    { id: 'security', label: 'Security', icon: Shield, admin: true },
    { id: 'database', label: 'Database', icon: Database, admin: true },
  ];

  const visibleTabs = tabs.filter(tab => !tab.admin || isAdministrator);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB');
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error('Only JPG, PNG, and GIF file formats are supported. Maximum file size is 2MB.');
      return;
    }

    // Compress image before converting to base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Create canvas and compress image
        const canvas = document.createElement('canvas');
        const maxWidth = 400; // Max width for avatar
        const maxHeight = 400; // Max height for avatar
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions maintaining aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to compressed base64 (JPEG quality 0.7 for better compression)
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        setAvatarPreview(compressedBase64);
        toast.info('Image compressed and ready to upload');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        first_name: profileData.first_name || '',
        last_name: profileData.last_name || '',
        email: profileData.email || '',
        bio: profileData.bio || '',
      };

      // Add avatar if it was changed (base64 data URL)
      if (avatarPreview && avatarPreview.startsWith('data:')) {
        payload.avatar = avatarPreview;
      }

      console.log('Sending profile update:', payload);
      const response = await api.put('/users/profile', payload);
      console.log('Profile update response:', response);
      toast.success(response.data?.message || 'Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      console.error('Error response:', err.response);
      console.error('Error message:', err.response?.data?.message);
      toast.error(err.response?.data?.message || err.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
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
                  ? 'bg-amber-500 text-white'
                  : 'bg-gray-900 text-gray-300 hover:bg-gray-800 border border-gray-800'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Profile Settings */}
      {activeTab === 'profile' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-gray-200 dark:border-gray-700 rounded-lg p-6"
        >
          <h2 className="text-xl font-bold text-white mb-6">Profile</h2>
          <p className="text-sm text-gray-400 mb-6">Update your personal information</p>

          <form onSubmit={handleProfileSubmit} className="space-y-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center md:flex-row md:items-start gap-6 pb-6 border-b border-gray-700">
              {/* Avatar Preview */}
              <div className="flex flex-col items-center gap-3">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center overflow-hidden border-2 border-gray-600">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                  ) : (
                    <User size={48} className="text-gray-500" />
                  )}
                </div>
              </div>

              {/* Avatar Upload */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">Change avatar</h3>
                <p className="text-sm text-gray-400 mb-4">JPG, PNG or GIF. Max 2MB.</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition font-medium"
                >
                  <Upload size={18} />
                  Choose Image
                </button>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">First name</label>
                <input
                  type="text"
                  name="first_name"
                  value={profileData.first_name}
                  onChange={handleProfileInputChange}
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Last name</label>
                <input
                  type="text"
                  name="last_name"
                  value={profileData.last_name}
                  onChange={handleProfileInputChange}
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={profileData.email}
                onChange={handleProfileInputChange}
                className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Bio</label>
              <textarea
                name="bio"
                value={profileData.bio}
                onChange={handleProfileInputChange}
                placeholder="Tell us about yourself..."
                rows="5"
                className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 resize-none"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white px-6 py-2 rounded-lg font-semibold transition disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                className="bg-gray-800 hover:bg-gray-700 text-gray-200 px-6 py-2 rounded-lg font-semibold transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* General Settings */}
      {activeTab === 'general' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-gray-200 dark:border-gray-700 rounded-lg p-6"
        >
          <h2 className="text-xl font-bold text-white mb-4">General Settings</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Studio Name</label>
              <input
                type="text"
                defaultValue="Shine Art Studio"
                className="w-full bg-black border border-gray-800 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Email</label>
              <input
                type="email"
                defaultValue="info@shineart.com"
                className="w-full bg-black border border-gray-800 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Phone</label>
              <input
                type="tel"
                defaultValue="+92 123 456 7890"
                className="w-full bg-black border border-gray-800 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:border-gray-600"
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
          <h2 className="text-xl font-bold text-gray-100 mb-4">Appearance Settings</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Theme</label>
              <div className="flex gap-3">
                <button
                  onClick={() => toggleTheme()}
                  className={`px-6 py-2 rounded-lg font-semibold transition ${
                    theme === 'dark'
                      ? 'bg-amber-500 text-gray-900'
                      : 'bg-gray-900 text-gray-100 hover:bg-gray-800'
                  }`}
                >
                  {theme === 'dark' ? '🌙 Dark Mode (Current)' : '☀️ Light Mode (Current)'}
                </button>
                <button
                  onClick={() => toggleTheme()}
                  className={`px-6 py-2 rounded-lg font-semibold transition ${
                    theme === 'light'
                      ? 'bg-amber-500 text-gray-900'
                      : 'bg-gray-900 text-gray-100 hover:bg-gray-800'
                  }`}
                >
                  {theme === 'light' ? '🌞 Light Mode (Current)' : '🌙 Dark Mode'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Font Size</label>
              <select className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:border-amber-500">
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
          <h2 className="text-xl font-bold text-gray-100 mb-4">Security Settings</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Session Timeout (minutes)</label>
              <input
                type="number"
                defaultValue="30"
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-4">
              <p className="text-sm text-gray-300">
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
          <h2 className="text-xl font-bold text-gray-100 mb-4">Database Settings</h2>
          
          <div className="space-y-4">
            <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-4">
              <p className="text-sm text-gray-300">
                <strong>Database Status:</strong> <span className="text-green-400">Connected</span>
              </p>
              <p className="text-xs text-gray-400 mt-2">SQLite database at: /backend/data/shine_art_pro.db</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Backup Database</label>
              <button className="bg-gray-700 dark:bg-gray-600 hover:bg-gray-800 dark:hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold transition">
                Create Backup
              </button>
              <p className="text-xs text-gray-400 mt-2">Last backup: Never</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Clear Cache</label>
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
