import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { User, Lock, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Settings() {
    const { user, login } = useAuth(); // login is used here to update the user context
    const [formData, setFormData] = useState({
        username: user?.username || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: '', message: '' });

        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            setStatus({ type: 'error', message: 'New passwords do not match' });
            return;
        }

        setLoading(true);
        try {
            // In a real app, user ID should be from token. Here we rely on AuthContext but backend verifies password.
            // We need to fetch the user ID or send username. Assuming backend can find by ID from context if we had it.
            // Since we don't have the ID in context easily exposed? Wait, AuthContext sets { username: user.username }.
            // We'll need to send the username to identify, OR backend should use token.
            // For now, let's send the current username to identify the user IF we don't have ID.
            // Actually, best to fetch ID first or ... 
            // Wait, standard practice: Backend gets ID from Token. But we are simple. 
            // We will fetch the user by username first in backend or...
            // Let's assume we pass the *current* username as ID identifier if we lacked ID.
            // Check auth.js: "const { id, ... } = req.body". We need to pass ID.

            // HACK: For this simple app, we might not have the ID in the frontend state.
            // Let's modify the frontend to fetch the ID or just assume we have it?
            // The AuthContext only stored { username: ... }.
            // Let's quick-fetch the ID by username first? Or nicer: Modify Login to return ID.

            // OPTION: We will send "username" (current) to identify.
            // UPDATE: I updated query to use `id`. I should use `username` to find user since that is what we have.

            // Correction: I will update the backend code in the next step to find by username if id is missing.
            // OR I just pass the username as identifier.

            const res = await axios.put('http://localhost:5000/auth/update', {
                currentUsername: user.username, // Identify who we are
                username: formData.username,    // New username
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });

            setStatus({ type: 'success', message: res.data.message });
            setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));

            // Update context
            if (res.data.username) {
                login(res.data.username); // Refresh context with new username
            }

        } catch (err) {
            setStatus({ type: 'error', message: err.response?.data?.message || 'Update failed' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">Account Settings</h2>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Status Message */}
                    <AnimatePresence>
                        {status.message && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className={`p-4 rounded-lg flex items-center gap-3 ${status.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                                    }`}
                            >
                                {status.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                                {status.message}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Username Section */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                            <User className="w-5 h-5" /> Profile Information
                        </h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                value={formData.username}
                                onChange={e => setFormData({ ...formData, username: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="border-t border-gray-100 my-6"></div>

                    {/* Password Section */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                            <Lock className="w-5 h-5" /> Security
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                                <input
                                    type="password"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                    value={formData.currentPassword}
                                    onChange={e => setFormData({ ...formData, currentPassword: e.target.value })}
                                    required
                                    placeholder="Required to make changes"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password (Optional)</label>
                                    <input
                                        type="password"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                        value={formData.newPassword}
                                        onChange={e => setFormData({ ...formData, newPassword: e.target.value })}
                                        placeholder="Leave blank to keep current"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                                    <input
                                        type="password"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                        value={formData.confirmPassword}
                                        onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        placeholder="Confirm new password"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-md hover:shadow-lg ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            <Save className="w-5 h-5" />
                            {loading ? 'Saving Changes...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
