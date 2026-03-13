import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Plus, Edit2, Trash2, Shield } from 'lucide-react';
import Layout from '../components/Layout';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';

const Users = () => {
  const { userRole } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    full_name: '',
    role: 'admin',
  });

  // Protect route - only Administrator
  if (userRole !== 'Administrator') {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Shield className="text-gray-600 dark:text-gray-400 mx-auto mb-3" size={32} />
            <p className="text-slate-400">Access Denied</p>
            <p className="text-slate-500 text-sm">Only Administrators can manage users.</p>
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

  // Add new user
  const handleAddUser = async () => {
    if (!newUser.username || !newUser.password || !newUser.full_name) {
      setError('Username, password, and name are required');
      return;
    }
    try {
      const res = await api.post('/users', newUser);
      setUsers([...users, res.data]);
      setNewUser({ username: '', password: '', full_name: '', role: 'admin' });
      setShowForm(false);
      setError('');
    } catch (err) {
      setError('Failed to add user');
      console.error(err);
    }
  };

  // Delete user
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure? This action cannot be undone.')) return;
    try {
      await api.delete(`/users/${userId}`);
      setUsers(users.filter(u => u.id !== userId));
      setError('');
    } catch (err) {
      setError('Failed to delete user');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-slate-400">Loading users...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Error Alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-gray-100 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center gap-2 text-gray-700 dark:text-gray-400"
        >
          <AlertCircle size={18} />
          {error}
        </motion.div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-100">User Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-900 px-4 py-2 rounded-lg font-semibold transition"
        >
          <Plus size={20} /> New User
        </button>
      </div>

      {/* New User Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800 p-4 rounded-lg mb-6 border border-slate-700"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="Username"
              value={newUser.username}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-500"
            />
            <input
              type="password"
              placeholder="Password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-500"
            />
            <input
              type="text"
              placeholder="Full Name"
              value={newUser.full_name}
              onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
              className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-500"
            />
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
            >
              <option value="Administrator">Administrator</option>
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
            </select>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleAddUser}
              className="bg-gray-700 dark:bg-gray-600 hover:bg-gray-800 dark:hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition"
            >
              Save
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="bg-slate-700 hover:bg-slate-600 text-slate-100 px-4 py-2 rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden"
      >
        <table className="w-full">
          <thead>
            <tr className="bg-slate-700 border-b border-slate-600">
              <th className="px-4 py-3 text-left text-slate-300 font-semibold">Username</th>
              <th className="px-4 py-3 text-left text-slate-300 font-semibold">Full Name</th>
              <th className="px-4 py-3 text-left text-slate-300 font-semibold">Role</th>
              <th className="px-4 py-3 text-left text-slate-300 font-semibold">Created</th>
              <th className="px-4 py-3 text-center text-slate-300 font-semibold">Actions</th>
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
                  className="border-b border-slate-700 hover:bg-slate-700/50 transition"
                >
                  <td className="px-4 py-3 text-slate-100 font-semibold flex items-center gap-2">
                    <Shield size={16} className="text-gray-600 dark:text-gray-400" />
                    {user.username}
                  </td>
                  <td className="px-4 py-3 text-slate-100">{user.full_name}</td>
                  <td className="px-4 py-3">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-sm">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition p-1"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-slate-400">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </motion.div>
    </Layout>
  );
};

export default Users;
