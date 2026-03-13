import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Plus, Edit2, Trash2, Shield, Eye, EyeOff, Check, X } from 'lucide-react';
import Layout from '../components/Layout';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';

const Users = () => {
  const { userRole } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    full_name: '',
    role: 'staff',
  });

  // Protect route - only Administrator
  if (userRole !== 'Administrator') {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Shield className="text-gray-600 dark:text-gray-400 mx-auto mb-3" size={32} />
            <p className="text-gray-500">Access Denied</p>
            <p className="text-gray-600 text-sm">Only Administrators can manage users.</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/users');
        setUsers(res.data || []);
        setError('');
      } catch (err) {
        setError('Failed to load users');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!newUser.username || newUser.username.trim() === '') errors.username = 'Username is required';
    if (!newUser.full_name || newUser.full_name.trim() === '') errors.full_name = 'Full name is required';
    if (!editingId && (!newUser.password || newUser.password.trim() === '')) {
      errors.password = 'Password is required for new users';
    }
    if (!newUser.role) errors.role = 'Role is required';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Add or update user
  const handleSaveUser = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      if (editingId) {
        // Update existing user
        const updateData = {
          full_name: newUser.full_name,
          role: newUser.role,
        };
        if (newUser.password && newUser.password.trim() !== '') {
          updateData.password = newUser.password;
        }
        await api.put(`/users/${editingId}`, updateData);
        setSuccess('User updated successfully!');
      } else {
        // Create new user
        await api.post('/users', newUser);
        setSuccess('User created successfully!');
      }

      // Refetch users
      const res = await api.get('/users');
      setUsers(res.data || []);
      
      // Reset form
      setNewUser({ username: '', password: '', full_name: '', role: 'staff' });
      setShowForm(false);
      setEditingId(null);
      setValidationErrors({});
      setError('');
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save user');
      console.error(err);
    }
  };

  // Edit user
  const handleEditUser = (user) => {
    setNewUser({
      username: user.username,
      password: '',
      full_name: user.full_name,
      role: user.role,
    });
    setEditingId(user.id);
    setShowForm(true);
    setValidationErrors({});
    setError('');
  };

  // Toggle user status
  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await api.patch(`/users/${userId}/status`, {
        is_active: !currentStatus,
      });
      setSuccess(`User ${!currentStatus ? 'enabled' : 'disabled'} successfully!`);
      
      // Update local state
      setUsers(users.map(u => u.id === userId ? { ...u, is_active: !currentStatus } : u));
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user status');
      console.error(err);
    }
  };

  // Delete user
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure? This action cannot be undone.')) return;
    try {
      await api.delete(`/users/${userId}`);
      setSuccess('User deleted successfully!');
      setUsers(users.filter(u => u.id !== userId));
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
      console.error(err);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setNewUser({ username: '', password: '', full_name: '', role: 'staff' });
    setValidationErrors({});
    setError('');
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-500">Loading users...</div>
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">User Management</h1>
            <p className="text-sm text-gray-400 mt-1">Create, edit, and manage system users</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setEditingId(null);
              setNewUser({ username: '', password: '', full_name: '', role: 'staff' });
              setShowForm(!showForm);
            }}
            className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold transition border border-gray-800"
          >
            <Plus size={20} /> New User
          </motion.button>
        </div>

        {/* New/Edit User Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-gray-800 rounded-xl p-8 bg-black"
          >
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingId ? 'Edit User' : 'Create New User'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Username */}
              <div>
                <label className="block text-gray-300 font-semibold mb-2">Username *</label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) => {
                    setNewUser({ ...newUser, username: e.target.value });
                    setValidationErrors({ ...validationErrors, username: '' });
                  }}
                  disabled={editingId}
                  placeholder="Enter username"
                  className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-800 text-white focus:outline-none focus:border-gray-700 transition-all disabled:opacity-50"
                />
                {validationErrors.username && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.username}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-gray-300 font-semibold mb-2">
                  Password {editingId ? '(leave blank to keep current)' : '*'}
                </label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => {
                    setNewUser({ ...newUser, password: e.target.value });
                    setValidationErrors({ ...validationErrors, password: '' });
                  }}
                  placeholder="Enter password"
                  className="w-full px-4 py-3 rounded-lg bg-black dark:bg-black border border-gray-800 dark:border-gray-800 text-white focus:outline-none focus:border-gray-700 transition-all"
                />
                {validationErrors.password && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.password}</p>
                )}
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-gray-300 font-semibold mb-2">Full Name *</label>
                <input
                  type="text"
                  value={newUser.full_name}
                  onChange={(e) => {
                    setNewUser({ ...newUser, full_name: e.target.value });
                    setValidationErrors({ ...validationErrors, full_name: '' });
                  }}
                  placeholder="Enter full name"
                  className="w-full px-4 py-3 rounded-lg bg-black dark:bg-black border border-gray-800 dark:border-gray-800 text-white focus:outline-none focus:border-gray-700 transition-all"
                />
                {validationErrors.full_name && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.full_name}</p>
                )}
              </div>

              {/* Role */}
              <div>
                <label className="block text-gray-300 font-semibold mb-2">Role *</label>
                <select
                  value={newUser.role}
                  onChange={(e) => {
                    setNewUser({ ...newUser, role: e.target.value });
                    setValidationErrors({ ...validationErrors, role: '' });
                  }}
                  className="w-full px-4 py-3 rounded-lg bg-black dark:bg-black border border-gray-800 dark:border-gray-800 text-white focus:outline-none focus:border-gray-700 transition-all"
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                  <option value="Administrator">Administrator</option>
                </select>
                {validationErrors.role && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.role}</p>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 mt-6">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleSaveUser}
                className="bg-gray-900 hover:bg-gray-800 text-white font-bold px-6 py-3 rounded-lg transition border border-gray-800"
              >
                {editingId ? 'Update User' : 'Create User'}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleCancel}
                className="bg-gray-950 hover:bg-gray-900 text-gray-400 font-bold px-6 py-3 rounded-lg transition border border-gray-800"
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 bg-black">
                  <th className="px-6 py-4 text-left font-bold text-gray-900 dark:text-white">Username</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-900 dark:text-white">Full Name</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-900 dark:text-white">Role</th>
                  <th className="px-6 py-4 text-center font-bold text-gray-900 dark:text-white">Status</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-900 dark:text-white">Created</th>
                  <th className="px-6 py-4 text-center font-bold text-gray-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((user, idx) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="border-t border-gray-800 hover:bg-gray-900/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Shield size={16} className="text-gray-600 dark:text-gray-400" />
                        {user.username}
                      </td>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{user.full_name}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold bg-gray-900 text-gray-300 border border-gray-800`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-gray-900 text-gray-300 border border-gray-800`}>
                          {user.is_active ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-sm">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleEditUser(user)}
                            className="text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 p-1"
                            title="Edit user"
                          >
                            <Edit2 size={18} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleToggleStatus(user.id, user.is_active)}
                            className="text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 p-1"
                            title={user.is_active ? 'Disable user' : 'Enable user'}
                          >
                            {user.is_active ? <EyeOff size={18} /> : <Eye size={18} />}
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-1"
                            title="Delete user"
                          >
                            <Trash2 size={18} />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default Users;
