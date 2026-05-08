import { useState, useEffect } from 'react';
import axios from 'axios';
import { Pencil, Trash2, Eye, X, Plus, Building2, TrendingUp, DollarSign, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Department() {
    const [departments, setDepartments] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        DepartmentCode: '',
        DepartmentName: '',
        GrossSalary: '',
        TotalDeduction: ''
    });
    const [editingId, setEditingId] = useState(null);
    const [viewingDept, setViewingDept] = useState(null);

    // Filter State
    const [searchTerm, setSearchTerm] = useState('');

    const fetchDepartments = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/departments');
            setDepartments(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Validation: Check for duplicates
            const normalize = (str) => str.trim().toLowerCase();
            const duplicateCode = departments.find(d =>
                normalize(d.DepartmentCode) === normalize(formData.DepartmentCode) &&
                d.DepartmentCode !== editingId // Exclude current if editing
            );
            const duplicateName = departments.find(d =>
                normalize(d.DepartmentName) === normalize(formData.DepartmentName) &&
                d.DepartmentCode !== editingId // Exclude current if editing
            );

            if (duplicateCode) {
                alert(`Department Code "${formData.DepartmentCode}" already exists.`);
                return;
            }
            if (duplicateName) {
                alert(`Department Name "${formData.DepartmentName}" already exists.`);
                return;
            }

            if (editingId) {
                await axios.put(`http://localhost:5000/api/departments/${editingId}`, formData);
                setEditingId(null);
            } else {
                await axios.post('http://localhost:5000/api/departments', formData);
            }
            fetchDepartments();
            setFormData({ DepartmentCode: '', DepartmentName: '', GrossSalary: '', TotalDeduction: '' });
        } catch (err) {
            console.error(err);
            alert('Error saving department');
        }
    };

    const handleEdit = (dept) => {
        setEditingId(dept.DepartmentCode);
        setShowForm(true);
        setFormData({
            DepartmentCode: dept.DepartmentCode,
            DepartmentName: dept.DepartmentName,
            GrossSalary: dept.GrossSalary,
            TotalDeduction: dept.TotalDeduction
        });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this department?')) {
            try {
                await axios.delete(`http://localhost:5000/api/departments/${id}`);
                fetchDepartments();
            } catch (err) {
                console.error(err);
                alert('Error deleting department');
            }
        }
    };

    const handleCancel = () => {
        setEditingId(null);
        setShowForm(false);
        setFormData({ DepartmentCode: '', DepartmentName: '', GrossSalary: '', TotalDeduction: '' });
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">Department Management</h2>
                        <p className="text-gray-600">Organize departments, manage salary structures, and track organizational units.</p>
                    </div>
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
                    >
                        <Plus className="w-5 h-5" />
                        Add New Department
                    </button>
                </div>
            </div>

            {/* Modal Form */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4"
                        onClick={handleCancel}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6 border-b pb-4">
                                <h3 className="text-xl font-bold text-gray-800">{editingId ? 'Edit Department' : 'Add New Department'}</h3>
                                <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600 transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Department Information */}
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Department Information</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Department Code *</label>
                                            <input
                                                type="text"
                                                placeholder="e.g., IT, HR, FIN"
                                                className={`w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${editingId ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                                value={formData.DepartmentCode}
                                                onChange={e => setFormData({ ...formData, DepartmentCode: e.target.value })}
                                                required
                                                disabled={!!editingId}
                                            />
                                            {editingId && <p className="text-xs text-gray-500 mt-1">Code cannot be changed</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Department Name *</label>
                                            <input
                                                type="text"
                                                placeholder="e.g., Information Technology"
                                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                                value={formData.DepartmentName}
                                                onChange={e => setFormData({ ...formData, DepartmentName: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Salary Structure */}
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Salary Structure</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Gross Salary (RWF) *</label>
                                            <input
                                                type="number"
                                                placeholder="0"
                                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                                value={formData.GrossSalary}
                                                onChange={e => setFormData({ ...formData, GrossSalary: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Total Deduction (RWF) *</label>
                                            <input
                                                type="number"
                                                placeholder="0"
                                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                                value={formData.TotalDeduction}
                                                onChange={e => setFormData({ ...formData, TotalDeduction: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium text-gray-700">Net Salary:</span>
                                                <span className="text-lg font-bold text-green-600">
                                                    {(Number(formData.GrossSalary || 0) - Number(formData.TotalDeduction || 0)).toLocaleString()} RWF
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className={`w-full py-3 rounded-lg font-semibold text-white transition-all shadow-md hover:shadow-lg ${editingId ? 'bg-green-600 hover:bg-green-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                                >
                                    {editingId ? '✓ Update Department' : '+ Create Department'}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-6 rounded-xl shadow-lg text-white"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-indigo-100 text-sm font-medium uppercase tracking-wide">Total Departments</p>
                            <h3 className="text-4xl font-bold mt-2">{departments.length}</h3>
                        </div>
                        <Building2 className="w-12 h-12 text-indigo-200 opacity-80" />
                    </div>
                </motion.div>

                <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-xl shadow-lg text-white"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-emerald-100 text-sm font-medium uppercase tracking-wide">Avg Gross Salary</p>
                            <h3 className="text-3xl font-bold mt-2">
                                {departments.length > 0
                                    ? (departments.reduce((sum, d) => sum + Number(d.GrossSalary), 0) / departments.length).toLocaleString(undefined, { maximumFractionDigits: 0 })
                                    : '0'} RWF
                            </h3>
                        </div>
                        <TrendingUp className="w-12 h-12 text-emerald-200 opacity-80" />
                    </div>
                </motion.div>

                <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-xl shadow-lg text-white"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-orange-100 text-sm font-medium uppercase tracking-wide">Avg Deductions</p>
                            <h3 className="text-3xl font-bold mt-2">
                                {departments.length > 0
                                    ? (departments.reduce((sum, d) => sum + Number(d.TotalDeduction), 0) / departments.length).toLocaleString(undefined, { maximumFractionDigits: 0 })
                                    : '0'} RWF
                            </h3>
                        </div>
                        <DollarSign className="w-12 h-12 text-orange-200 opacity-80" />
                    </div>
                </motion.div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="max-w-md relative">
                    <input
                        type="text"
                        placeholder="Search by department name or code..."
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Building2 className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                </div>
            </div>

            {/* Department List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search departments..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Department Code</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Department Name</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Manager</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            <AnimatePresence>
                                {departments.filter(d => {
                                    const matchesSearch = (d.DepartmentName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                                        (d.DepartmentCode?.toLowerCase() || '').includes(searchTerm.toLowerCase());
                                    return matchesSearch;
                                }).map((dept) => (
                                    <motion.tr
                                        key={dept.DepartmentCode}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="hover:bg-gray-50/50 transition-colors"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-sm font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                {dept.DepartmentCode}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 mr-3">
                                                    <Building2 className="w-5 h-5" />
                                                </div>
                                                <div className="text-sm font-medium text-gray-900">{dept.DepartmentName}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {dept.Manager || <span className="text-gray-400 italic">Not Assigned</span>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(dept)}
                                                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(dept.DepartmentCode)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                            {departments.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center">
                                        <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500 font-medium">No departments found</p>
                                        <p className="text-gray-400 text-sm mt-1">Create your first department to get started</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* View Modal */}
            <AnimatePresence>
                {viewingDept && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4"
                        onClick={() => setViewingDept(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6 border-b pb-2">
                                <h3 className="text-xl font-bold text-gray-800">Department Details</h3>
                                <button onClick={() => setViewingDept(null)} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Department Code</label>
                                    <p className="text-lg text-gray-900 font-medium">{viewingDept.DepartmentCode}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Department Name</label>
                                    <p className="text-lg text-gray-900">{viewingDept.DepartmentName}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase">Gross Salary</label>
                                        <p className="text-lg text-gray-900">{viewingDept.GrossSalary.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase">Total Deduction</label>
                                        <p className="text-lg text-gray-900">{viewingDept.TotalDeduction.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8 flex justify-end">
                                <button onClick={() => setViewingDept(null)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors">
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
