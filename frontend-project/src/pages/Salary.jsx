import { useState, useEffect } from 'react';
import axios from 'axios';
import { Pencil, Trash2, Eye, X, Plus, Users, Wallet, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Salary() {
    const [salaries, setSalaries] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        employeeNumber: '',
        GrossSalary: '',
        TotalDeduction: '',
        NetSalary: '', // Optional, backend calculates
        month: ''
    });
    const [editingId, setEditingId] = useState(null);
    const [viewingSalary, setViewingSalary] = useState(null);

    // Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [monthFilter, setMonthFilter] = useState('');

    const fetchData = async () => {
        try {
            const [salRes, empRes] = await Promise.all([
                axios.get('http://localhost:5000/api/salaries'),
                axios.get('http://localhost:5000/api/employees')
            ]);
            setSalaries(salRes.data);
            setEmployees(empRes.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Validation: Check for duplicates
            const duplicateSalary = salaries.find(s =>
                s.employeeNumber == formData.employeeNumber &&
                s.month.split('T')[0].substring(0, 7) === formData.month.substring(0, 7) &&
                s.id !== editingId // Exclude current if editing
            );

            if (duplicateSalary) {
                alert(`Salary record for this employee and month already exists.`);
                return;
            }

            if (editingId) {
                await axios.put(`http://localhost:5000/api/salaries/${editingId}`, formData);
                setEditingId(null);
            } else {
                await axios.post('http://localhost:5000/api/salaries', formData);
            }
            fetchData();
            setFormData({
                employeeNumber: '', GrossSalary: '', TotalDeduction: '', NetSalary: '', month: ''
            });
        } catch (err) {
            console.error(err);
            alert('Error saving salary');
        }
    };

    const handleEdit = (salary) => {
        setEditingId(salary.id);
        setShowForm(true);
        setFormData({
            employeeNumber: salary.employeeNumber,
            GrossSalary: salary.GrossSalary,
            TotalDeduction: salary.TotalDeduction,
            NetSalary: salary.NetSalary,
            month: salary.month ? salary.month.split('T')[0] : ''
        });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this salary record?')) {
            try {
                await axios.delete(`http://localhost:5000/api/salaries/${id}`);
                fetchData();
            } catch (err) {
                console.error(err);
            }
        }
    };

    const handleCancel = () => {
        setEditingId(null);
        setShowForm(false);
        setFormData({ employeeNumber: '', GrossSalary: '', TotalDeduction: '', NetSalary: '', month: '' });
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">Salary Management</h2>
                        <p className="text-gray-600">Track employee compensation, manage payroll records, and monitor salary distributions.</p>
                    </div>
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
                    >
                        <Plus className="w-5 h-5" />
                        Add Salary Record
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
                                <h3 className="text-xl font-bold text-gray-800">{editingId ? 'Edit Salary' : 'Add Salary Record'}</h3>
                                <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600 transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Employee Selection */}
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Employee Selection</h4>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Employee *</label>
                                        <select
                                            className={`w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white ${editingId ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                            value={formData.employeeNumber}
                                            onChange={e => setFormData({ ...formData, employeeNumber: e.target.value })}
                                            required
                                            disabled={!!editingId}
                                        >
                                            <option value="">Select Employee</option>
                                            {employees.map(e => (
                                                <option key={e.employeeNumber} value={e.employeeNumber}>{e.FirstName} {e.LastName}</option>
                                            ))}
                                        </select>
                                        {editingId && <p className="text-xs text-gray-500 mt-1">Employee cannot be changed</p>}
                                    </div>
                                </div>

                                {/* Salary Details */}
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Salary Details</h4>
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
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Month *</label>
                                            <input
                                                type="date"
                                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                                value={formData.month}
                                                onChange={e => setFormData({ ...formData, month: e.target.value })}
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
                                    {editingId ? '✓ Update Salary' : '+ Add Salary Record'}
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
                    className="bg-gradient-to-br from-cyan-500 to-cyan-600 p-6 rounded-xl shadow-lg text-white"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-cyan-100 text-sm font-medium uppercase tracking-wide">Total Records</p>
                            <h3 className="text-4xl font-bold mt-2">{salaries.length}</h3>
                        </div>
                        <Users className="w-12 h-12 text-cyan-200 opacity-80" />
                    </div>
                </motion.div>

                <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-gradient-to-br from-teal-500 to-teal-600 p-6 rounded-xl shadow-lg text-white"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-teal-100 text-sm font-medium uppercase tracking-wide">Total Paid</p>
                            <h3 className="text-3xl font-bold mt-2">
                                {salaries.length > 0
                                    ? salaries.reduce((sum, s) => sum + Number(s.NetSalary), 0).toLocaleString()
                                    : '0'} RWF
                            </h3>
                        </div>
                        <Wallet className="w-12 h-12 text-teal-200 opacity-80" />
                    </div>
                </motion.div>

                <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-gradient-to-br from-violet-500 to-violet-600 p-6 rounded-xl shadow-lg text-white"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-violet-100 text-sm font-medium uppercase tracking-wide">Avg Net Salary</p>
                            <h3 className="text-3xl font-bold mt-2">
                                {salaries.length > 0
                                    ? (salaries.reduce((sum, s) => sum + Number(s.NetSalary), 0) / salaries.length).toLocaleString(undefined, { maximumFractionDigits: 0 })
                                    : '0'} RWF
                            </h3>
                        </div>
                        <TrendingUp className="w-12 h-12 text-violet-200 opacity-80" />
                    </div>
                </motion.div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="flex-1 w-full md:w-auto relative">
                    <input
                        type="text"
                        placeholder="Search by employee name..."
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Users className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                </div>
                <div className="w-full md:w-auto">
                    <input
                        type="month"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all cursor-pointer"
                        value={monthFilter}
                        onChange={(e) => setMonthFilter(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-800">Salary Records</h3>
                    <p className="text-sm text-gray-600 mt-1">Complete payroll history and compensation details</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Employee</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Gross</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Deduction</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Net Salary</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Month</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {salaries.filter(s => {
                                const matchesSearch = (s.FirstName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                                    (s.LastName?.toLowerCase() || '').includes(searchTerm.toLowerCase());
                                const matchesMonth = monthFilter ? s.month?.startsWith(monthFilter) : true;
                                return matchesSearch && matchesMonth;
                            }).map(s => (
                                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{s.FirstName} {s.LastName}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{Number(s.GrossSalary).toLocaleString()} RWF</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">{Number(s.TotalDeduction).toLocaleString()} RWF</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-semibold text-green-600">{Number(s.NetSalary).toLocaleString()} RWF</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {s.month ? s.month.split('T')[0] : ''}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => setViewingSalary(s)} className="text-blue-600 hover:text-blue-800 transition-colors" title="View">
                                                <Eye className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => handleEdit(s)} className="text-indigo-600 hover:text-indigo-800 transition-colors" title="Edit">
                                                <Pencil className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => handleDelete(s.id)} className="text-red-600 hover:text-red-800 transition-colors" title="Delete">
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {salaries.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center">
                                        <Wallet className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500 font-medium">No salary records found</p>
                                        <p className="text-gray-400 text-sm mt-1">Add your first salary record to begin tracking payroll</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* View Modal */}
            <AnimatePresence>
                {viewingSalary && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4"
                        onClick={() => setViewingSalary(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6 border-b pb-2">
                                <h3 className="text-xl font-bold text-gray-800">Salary Details</h3>
                                <button onClick={() => setViewingSalary(null)} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Employee</label>
                                    <p className="text-lg text-gray-900">{viewingSalary.FirstName} {viewingSalary.LastName}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase">Gross Salary</label>
                                        <p className="text-lg text-gray-900">{viewingSalary.GrossSalary.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase">Total Deduction</label>
                                        <p className="text-lg text-gray-900 text-red-500">-{viewingSalary.TotalDeduction.toLocaleString()}</p>
                                    </div>
                                    <div className="col-span-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                        <label className="text-xs font-semibold text-gray-500 uppercase">Net Salary</label>
                                        <p className="text-2xl text-green-600 font-bold">{viewingSalary.NetSalary.toLocaleString()} RWF</p>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-xs font-semibold text-gray-500 uppercase">Month</label>
                                        <p className="text-lg text-gray-900">{viewingSalary.month ? viewingSalary.month.split('T')[0] : 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8 flex justify-end">
                                <button onClick={() => setViewingSalary(null)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors">
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
