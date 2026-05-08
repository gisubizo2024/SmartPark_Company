import { useState, useEffect } from 'react';
import api from '../api/config';
import { Users as UsersIcon, Shield, Trash2, UserPlus, X, Eye, Pencil, CheckCircle, Lock, Unlock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [viewingUser, setViewingUser] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({ username: '', password: '', role: 'Cashier' });

    const fetchUsers = async () => {
        try {
            const res = await api.get('/auth/users');
            setUsers(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRoleChange = async (userId, newRole) => {
        try {
            await api.put(`/auth/users/${userId}/role`, { role: newRole });
            fetchUsers();
        } catch (err) {
            console.error(err);
            alert('Error updating role');
        }
    };

    const handleToggleBlock = async (userId) => {
        try {
            await api.put(`/auth/users/${userId}/toggle-block`);
            fetchUsers();
        } catch (err) {
            console.error(err);
            alert('Error toggling block status');
        }
    };

    const handleDelete = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await api.delete(`/auth/users/${userId}`);
                fetchUsers();
            } catch (err) {
                console.error(err);
                alert('Error deleting user');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingUser) {
                await api.put(`/auth/users/${editingUser.UserID}`, {
                    username: formData.username,
                    password: formData.password || undefined
                });
                alert('User updated successfully');
            } else {
                await api.post('/auth/register', formData);
                alert('User registered successfully');
            }
            fetchUsers();
            setShowForm(false);
            setEditingUser(null);
            setFormData({ username: '', password: '', role: 'Cashier' });
        } catch (err) {
            console.error(err);
            alert('Operation failed');
        }
    };

    const startEdit = (user) => {
        setEditingUser(user);
        setFormData({ username: user.Username, password: '', role: user.Role });
        setShowForm(true);
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">User Management</h2>
                    <p className="text-gray-600">Assign roles and manage system access permissions.</p>
                </div>
                <button 
                    onClick={() => { setEditingUser(null); setFormData({username:'', password:'', role:'Cashier'}); setShowForm(true); }}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-bold transition-all shadow-md"
                >
                    <UserPlus className="w-5 h-5" /> Add User
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">User</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Current Role</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Change Role</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map(u => (
                                <tr key={u.UserID} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                                                {u.Username.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900">{u.Username}</div>
                                                <div className="text-xs text-gray-500">ID: #{u.UserID}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                            u.Role === 'Admin' ? 'bg-purple-100 text-purple-700' :
                                            u.Role === 'Manager' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                                        }`}>
                                            {u.Role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <select 
                                            value={u.Role}
                                            onChange={(e) => handleRoleChange(u.UserID, e.target.value)}
                                            className="px-2 py-1 border rounded bg-white text-sm focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="Admin">Admin</option>
                                            <option value="Manager">Manager</option>
                                            <option value="Cashier">Cashier</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 flex items-center gap-2">
                                        <button onClick={() => setViewingUser(u)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg" title="View Details">
                                            <Eye className="w-5 h-5" />
                                        </button>
                                        <button 
                                            onClick={() => handleToggleBlock(u.UserID)} 
                                            className={`p-2 rounded-lg transition-colors ${u.IsBlocked ? 'text-orange-500 hover:bg-orange-50' : 'text-green-500 hover:bg-green-50'}`} 
                                            title={u.IsBlocked ? 'Unblock User' : 'Block User'}
                                        >
                                            {u.IsBlocked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                                        </button>
                                        <button onClick={() => startEdit(u)} className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg" title="Edit User">
                                            <Pencil className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => handleDelete(u.UserID)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg" title="Delete User">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {showForm && (
                    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
                        <motion.div initial={{y:20, opacity:0}} animate={{y:0, opacity:1}} exit={{y:20, opacity:0}} className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl relative">
                            <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X /></button>
                            <h3 className="text-2xl font-bold text-gray-800 mb-6">{editingUser ? 'Edit User' : 'Add System User'}</h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Username</label>
                                    <input type="text" className="w-full px-4 py-2 border rounded-xl" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">{editingUser ? 'New Password (Optional)' : 'Password'}</label>
                                    <input type="password" className="w-full px-4 py-2 border rounded-xl" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required={!editingUser} />
                                </div>
                                {!editingUser && (
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Initial Role</label>
                                        <select className="w-full px-4 py-2 border rounded-xl bg-white" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                                            <option value="Admin">Admin</option>
                                            <option value="Manager">Manager</option>
                                            <option value="Cashier">Cashier</option>
                                        </select>
                                    </div>
                                )}
                                <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold mt-4 shadow-lg">{editingUser ? 'Update User' : 'Create Account'}</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* View Modal */}
            <AnimatePresence>
                {viewingUser && (
                    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
                        <motion.div initial={{scale:0.9, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.9, opacity:0}} className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl relative">
                            <button onClick={() => setViewingUser(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X /></button>
                            <div className="flex flex-col items-center text-center">
                                <div className="w-20 h-20 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-3xl font-bold mb-4">
                                    {viewingUser.Username.charAt(0).toUpperCase()}
                                </div>
                                <h3 className="text-2xl font-bold text-gray-800 mb-1">{viewingUser.Username}</h3>
                                <p className={`px-4 py-1 rounded-full text-sm font-bold uppercase mb-6 ${
                                    viewingUser.Role === 'Admin' ? 'bg-purple-100 text-purple-700' :
                                    viewingUser.Role === 'Manager' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                                }`}>
                                    {viewingUser.Role}
                                </p>
                                <div className="w-full space-y-3 text-left bg-gray-50 p-4 rounded-xl">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">User ID:</span>
                                        <span className="font-medium">#{viewingUser.UserID}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Joined:</span>
                                        <span className="font-medium">{new Date(viewingUser.CreatedAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Status:</span>
                                        {viewingUser.IsBlocked ? (
                                            <span className="text-red-600 font-bold flex items-center gap-1"><Lock className="w-4 h-4" /> Blocked</span>
                                        ) : (
                                            <span className="text-green-600 font-bold flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Active</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
