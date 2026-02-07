import { useState, useEffect } from 'react';
import axios from 'axios';
import { Pencil, Trash2, Eye, X, Plus, Users, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Employee() {
    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        FirstName: '', LastName: '', Position: '', Address: '',
        Telephone: '', Gender: 'Male', hiredDate: '', DepartmentCode: ''
    });

    const [editingId, setEditingId] = useState(null);
    const [viewingEmp, setViewingEmp] = useState(null);

    // Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('');
    const [genderFilter, setGenderFilter] = useState('');

    const fetchData = async () => {
        try {
            const [empRes, deptRes] = await Promise.all([
                axios.get('http://localhost:5000/api/employees'),
                axios.get('http://localhost:5000/api/departments')
            ]);
            setEmployees(empRes.data);
            setDepartments(deptRes.data);
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
            const duplicatePhone = employees.find(emp =>
                emp.Telephone === formData.Telephone &&
                emp.employeeNumber !== editingId // Exclude current if editing
            );

            if (duplicatePhone) {
                alert(`Employee with telephone "${formData.Telephone}" already exists.`);
                return;
            }

            if (editingId) {
                await axios.put(`http://localhost:5000/api/employees/${editingId}`, formData);
                setEditingId(null);
            } else {
                await axios.post('http://localhost:5000/api/employees', formData);
            }
            fetchData();
            setFormData({
                FirstName: '', LastName: '', Position: '', Address: '',
                Telephone: '', Gender: 'Male', hiredDate: '', DepartmentCode: ''
            });
        } catch (err) {
            console.error(err);
            alert('Error saving employee');
        }
    };

    const handleEdit = (emp) => {
        setEditingId(emp.employeeNumber);
        setShowForm(true);
        setFormData({
            FirstName: emp.FirstName,
            LastName: emp.LastName,
            Position: emp.Position,
            Address: emp.Address,
            Telephone: emp.Telephone,
            Gender: emp.Gender,
            hiredDate: emp.hiredDate ? emp.hiredDate.split('T')[0] : '',
            DepartmentCode: emp.DepartmentCode
        });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this employee?')) {
            try {
                await axios.delete(`http://localhost:5000/api/employees/${id}`);
                fetchData();
            } catch (err) {
                console.error(err);
                alert('Error deleting employee');
            }
        }
    };

    const handleCancel = () => {
        setEditingId(null);
        setShowForm(false);
        setFormData({
            FirstName: '', LastName: '', Position: '', Address: '',
            Telephone: '', Gender: 'Male', hiredDate: '', DepartmentCode: ''
        });
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">Employee Management</h2>
                        <p className="text-gray-600">Manage your workforce, track employee information, and maintain organizational structure.</p>
                    </div>
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
                    >
                        <Plus className="w-5 h-5" />
                        Add New Employee
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
                                <h3 className="text-xl font-bold text-gray-800">{editingId ? 'Edit Employee' : 'Register New Employee'}</h3>
                                <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600 transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Personal Information */}
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Personal Information</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                                            <input
                                                type="text"
                                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                                value={formData.FirstName}
                                                onChange={e => setFormData({ ...formData, FirstName: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                                            <input
                                                type="text"
                                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                                value={formData.LastName}
                                                onChange={e => setFormData({ ...formData, LastName: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                            <input
                                                type="email"
                                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                                value={formData.Email}
                                                onChange={e => setFormData({ ...formData, Email: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                                            <select
                                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white"
                                                value={formData.Gender}
                                                onChange={e => setFormData({ ...formData, Gender: e.target.value })}
                                            >
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Telephone *</label>
                                            <input
                                                type="tel"
                                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                                value={formData.Telephone}
                                                onChange={e => setFormData({ ...formData, Telephone: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                                            <input
                                                type="text"
                                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                                value={formData.Address}
                                                onChange={e => setFormData({ ...formData, Address: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Employment Details */}
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Employment Details</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Position *</label>
                                            <input
                                                type="text"
                                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                                value={formData.Position}
                                                onChange={e => setFormData({ ...formData, Position: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                                            <select
                                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white"
                                                value={formData.DepartmentID} // Changed DepartmentCode to DepartmentID
                                                onChange={e => setFormData({ ...formData, DepartmentID: e.target.value })}
                                                required
                                            >
                                                <option value="">Select Department</option>
                                                {departments.map(d => (
                                                    <option key={d.DepartmentCode} value={d.DepartmentCode}>{d.DepartmentName}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Hire Date *</label>
                                            <input
                                                type="date"
                                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                                value={formData.HireDate} // Changed hiredDate to HireDate
                                                onChange={e => setFormData({ ...formData, HireDate: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Salary (RWF) *</label>
                                            <input
                                                type="number"
                                                min="0"
                                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                                value={formData.Salary}
                                                onChange={e => setFormData({ ...formData, Salary: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className={`w-full py-3 rounded-lg font-semibold text-white transition-all shadow-md hover:shadow-lg ${editingId ? 'bg-green-600 hover:bg-green-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                                >
                                    {editingId ? '✓ Update Employee' : '+ Register Employee'}
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
                    className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm font-medium uppercase tracking-wide">Total Employees</p>
                            <h3 className="text-4xl font-bold mt-2">{employees.length}</h3>
                        </div>
                        <Users className="w-12 h-12 text-blue-200 opacity-80" />
                    </div>
                </motion.div>

                <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-sm font-medium uppercase tracking-wide">Departments</p>
                            <h3 className="text-4xl font-bold mt-2">{departments.length}</h3>
                        </div>
                        <Building2 className="w-12 h-12 text-green-200 opacity-80" />
                    </div>
                </motion.div>

                <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg text-white"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-sm font-medium uppercase tracking-wide">Gender Split</p>
                            <h3 className="text-2xl font-bold mt-2">
                                {employees.filter(e => e.Gender === 'Male').length}M / {employees.filter(e => e.Gender === 'Female').length}F
                            </h3>
                        </div>
                        <Users className="w-12 h-12 text-purple-200 opacity-80" />
                    </div>
                </motion.div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <div className="md:col-span-2 relative">
                    <input
                        type="text"
                        placeholder="Search by name, position, or phone..."
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Users className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                </div>
                <div>
                    <select
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white"
                        value={departmentFilter}
                        onChange={(e) => setDepartmentFilter(e.target.value)}
                    >
                        <option value="">All Departments</option>
                        {departments.map(d => (
                            <option key={d.DepartmentCode} value={d.DepartmentCode}>{d.DepartmentName}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <select
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white"
                        value={genderFilter}
                        onChange={(e) => setGenderFilter(e.target.value)}
                    >
                        <option value="">All Genders</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-800">Employee Directory</h3>
                    <p className="text-sm text-gray-600 mt-1">Complete list of all registered employees</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Position</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Department</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Telephone</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {employees.filter(e => {
                                const matchesSearch = (e.FirstName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                                    (e.LastName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                                    (e.Position?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                                    (e.Telephone || '').includes(searchTerm);
                                const matchesDept = departmentFilter ? e.DepartmentCode === departmentFilter : true;
                                const matchesGender = genderFilter ? e.Gender === genderFilter : true;
                                return matchesSearch && matchesDept && matchesGender;
                            }).map(e => (
                                <tr key={e.employeeNumber} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{e.FirstName} {e.LastName}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-700">{e.Position}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                            {e.DepartmentCode}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{e.Telephone}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => setViewingEmp(e)} className="text-blue-600 hover:text-blue-800 transition-colors" title="View">
                                                <Eye className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => handleEdit(e)} className="text-indigo-600 hover:text-indigo-800 transition-colors" title="Edit">
                                                <Pencil className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => handleDelete(e.employeeNumber)} className="text-red-600 hover:text-red-800 transition-colors" title="Delete">
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {employees.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center">
                                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500 font-medium">No employees found</p>
                                        <p className="text-gray-400 text-sm mt-1">Get started by adding your first employee</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* View Modal */}
            <AnimatePresence>
                {viewingEmp && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4"
                        onClick={() => setViewingEmp(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6 border-b pb-2">
                                <h3 className="text-xl font-bold text-gray-800">Employee Details</h3>
                                <button onClick={() => setViewingEmp(null)} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase">First Name</label>
                                    <p className="text-lg text-gray-900">{viewingEmp.FirstName}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Last Name</label>
                                    <p className="text-lg text-gray-900">{viewingEmp.LastName}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Position</label>
                                    <p className="text-lg text-gray-900">{viewingEmp.Position}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Department</label>
                                    <p className="text-lg text-gray-900 text-indigo-600 font-medium">{viewingEmp.DepartmentCode}</p>
                                </div>
                                <div className="col-span-2">
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Address</label>
                                    <p className="text-lg text-gray-900">{viewingEmp.Address}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Telephone</label>
                                    <p className="text-lg text-gray-900">{viewingEmp.Telephone}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Gender</label>
                                    <p className="text-lg text-gray-900">{viewingEmp.Gender}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Hired Date</label>
                                    <p className="text-lg text-gray-900">{viewingEmp.hiredDate ? viewingEmp.hiredDate.split('T')[0] : 'N/A'}</p>
                                </div>
                            </div>
                            <div className="mt-8 flex justify-end">
                                <button onClick={() => setViewingEmp(null)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors">
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
