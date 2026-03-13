import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Check, Lock, Unlock, BarChart3, Calendar, Users, Package, Zap, TrendingDown, FileText, Settings as SettingsIcon, Shield, Info } from 'lucide-react';
import Layout from '../components/Layout';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';

const featureIcons = {
  dashboard: <BarChart3 size={20} />,
  bookings: <Calendar size={20} />,
  customers: <Users size={20} />,
  inventory: <Package size={20} />,
  services: <Zap size={20} />,
  expenses: <TrendingDown size={20} />,
  billing: <FileText size={20} />,
  reports: <BarChart3 size={20} />,
  users: <Shield size={20} />,
  settings: <SettingsIcon size={20} />,
};

const RoleFeatures = () => {
  const { userRole } = useAuth();
  const [availableFeatures, setAvailableFeatures] = useState([]);
  const [roleFeatures, setRoleFeatures] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedRole, setSelectedRole] = useState('Administrator');
  const [hasChanges, setHasChanges] = useState(false);

  const roles = ['Administrator', 'admin', 'staff'];

  // Protect route - only Administrator
  if (userRole !== 'Administrator') {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Lock className="text-gray-600 dark:text-gray-400 mx-auto mb-3" size={32} />
            <p className="text-slate-400">Access Denied</p>
            <p className="text-slate-500 text-sm">Only Administrators can manage role features.</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Fetch available features and role features
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuresRes, roleRes] = await Promise.all([
          api.get('/role-features/available'),
          api.get('/role-features'),
        ]);

        setAvailableFeatures(featuresRes.data || []);
        setRoleFeatures(roleRes.data || {});
        setError('');
      } catch (err) {
        setError('Failed to load configuration');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Toggle feature for role
  const toggleFeature = (featureId) => {
    const currentFeatures = roleFeatures[selectedRole] || [];
    const isEnabled = currentFeatures.includes(featureId);

    let updatedFeatures;
    if (isEnabled) {
      updatedFeatures = currentFeatures.filter(f => f !== featureId);
    } else {
      updatedFeatures = [...currentFeatures, featureId];
    }

    setRoleFeatures({
      ...roleFeatures,
      [selectedRole]: updatedFeatures,
    });

    setHasChanges(true);
  };

  // Save role features
  const handleSaveFeatures = async () => {
    try {
      await api.put(`/role-features/${selectedRole}`, {
        features: roleFeatures[selectedRole] || [],
      });

      setSuccess(`Features for ${selectedRole} role updated successfully!`);
      setHasChanges(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save features');
      console.error(err);
    }
  };

  const currentRoleFeatures = roleFeatures[selectedRole] || [];

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-slate-400">Loading configuration...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg flex items-center gap-2"
          >
            <AlertCircle size={20} />
            {error}
          </motion.div>
        )}

        {/* Success Alert */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-lg flex items-center gap-2"
          >
            <Check size={20} />
            {success}
          </motion.div>
        )}

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Role & Features Management</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Configure which features are available for each user role</p>
        </div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-slate-900 dark:bg-slate-800 border border-slate-700 dark:border-slate-600 rounded-lg flex items-start gap-3"
        >
          <Info size={20} className="text-slate-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-slate-300">
            <p className="font-semibold mb-1">Feature Control</p>
            <p>Select a role and toggle the features available to users with that role. Changes will be applied immediately.</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Role Selection */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="border border-slate-700 dark:border-slate-600 rounded-xl p-6 bg-slate-900 dark:bg-slate-800 space-y-3 h-fit sticky top-4">
              <h2 className="font-bold text-white mb-4">Select Role</h2>
              {roles.map((role) => (
                <motion.button
                  key={role}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedRole(role)}
                  className={`w-full p-4 rounded-lg font-semibold transition-all text-left ${
                    selectedRole === role
                      ? 'bg-slate-800 text-white shadow-lg border border-slate-600'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Shield size={18} />
                    <span>{role}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3"
          >
            <div className="border border-slate-700 dark:border-slate-600 rounded-xl p-8 bg-slate-900 dark:bg-slate-800">
              {/* Role Title */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white">
                  {selectedRole} Role
                </h2>
                <p className="text-sm text-slate-400 mt-2">
                  {currentRoleFeatures.length} of {availableFeatures.length} features enabled
                </p>
                <div className="mt-4 h-2 bg-slate-700 dark:bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    animate={{
                      width: `${(currentRoleFeatures.length / availableFeatures.length) * 100}%`,
                    }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-slate-600"
                  />
                </div>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {availableFeatures.map((feature) => {
                  const isEnabled = currentRoleFeatures.includes(feature.id);

                  return (
                    <motion.button
                      key={feature.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleFeature(feature.id)}
                      className={`p-5 rounded-lg border-2 transition-all text-left ${
                        isEnabled
                          ? 'bg-slate-800 dark:bg-slate-700 border-slate-600 dark:border-slate-500'
                          : 'bg-slate-900 dark:bg-slate-800 border-slate-700 dark:border-slate-600 hover:border-slate-600 dark:hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`p-2 rounded-lg ${
                            isEnabled
                              ? 'bg-slate-700 text-white'
                              : 'bg-slate-800 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                          }`}>
                            {featureIcons[feature.id]}
                          </div>
                          <div>
                            <p className={`font-semibold ${
                              isEnabled
                                ? 'text-white'
                                : 'text-slate-300 dark:text-slate-400'
                            }`}>
                              {feature.label}
                            </p>
                          </div>
                        </div>
                        {isEnabled && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex-shrink-0 p-1 bg-slate-700 rounded-full"
                          >
                            <Check size={16} className="text-white" />
                          </motion.div>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-700">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSaveFeatures}
                  disabled={!hasChanges}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                    hasChanges
                      ? 'bg-slate-800 hover:bg-slate-700 text-white shadow-lg'
                      : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Check size={18} className="inline mr-2" />
                  Save Changes
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Feature Descriptions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-slate-700 dark:border-slate-600 rounded-xl p-8 bg-slate-900 dark:bg-slate-800"
        >
          <h3 className="text-lg font-bold text-white mb-6">Feature Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {availableFeatures.map((feature) => (
              <div key={feature.id} className="pb-4 border-b border-slate-700 dark:border-slate-600 last:border-b-0">
                <div className="flex items-start gap-3">
                  <div className="text-slate-400 mt-1">
                    {featureIcons[feature.id]}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{feature.label}</p>
                    <p className="text-sm text-slate-400 mt-1">
                      {getFeatureDescription(feature.id)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

// Feature descriptions
function getFeatureDescription(featureId) {
  const descriptions = {
    dashboard: 'View analytics, KPIs, and system overview',
    bookings: 'Create, manage, and track customer bookings',
    customers: 'Manage customer information and records',
    inventory: 'Track and manage inventory items',
    services: 'Define and manage available services',
    expenses: 'Record and monitor business expenses',
    billing: 'Generate invoices and manage billing',
    reports: 'View detailed reports and analytics',
    users: 'Create and manage system users',
    settings: 'Configure system settings and preferences',
  };
  return descriptions[featureId] || '';
}

export default RoleFeatures;
