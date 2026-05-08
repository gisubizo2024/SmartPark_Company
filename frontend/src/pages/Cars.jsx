import { useState, useEffect } from 'react';
import api from '../api/config';
import { Pencil, Trash2, Eye, X, Plus, Car as CarIcon, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Cars() {
    const [cars, setCars] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        plateNumber: '', driverName: '', phoneNumber: ''
    });

    const [editingId, setEditingId] = useState(null);
    const [viewingCar, setViewingCar] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = async () => {
        try {
            const res = await api.get('/api/cars');
            setCars(res.data);
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
            if (editingId) {
                await api.put(`/api/cars/${editingId}`, formData);
                alert('Car updated successfully');
            } else {
                await api.post('/api/cars', formData);
                alert('Car registered successfully');
            }
            fetchData();
            setFormData({ plateNumber: '', driverName: '', phoneNumber: '' });
            setEditingId(null);
            setShowForm(false);
        } catch (err) {
            console.error(err);
            alert('Error saving car');
        }
    };

    const handleEdit = (car) => {
        setFormData({
            plateNumber: car.PlateNumber,
            driverName: car.DriverName,
            phoneNumber: car.PhoneNumber
        });
        setEditingId(car.PlateNumber);
        setShowForm(true);
    };

    const handleDelete = async (plateNumber) => {
        if (window.confirm('Are you sure you want to delete this car?')) {
            try {
                await api.delete(`/api/cars/${plateNumber}`);
                fetchData();
            } catch (err) {
                console.error(err);
                alert('Error deleting car');
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">Car Management</h2>
                        <p className="text-gray-600">Register and manage vehicles entering the SmartPark facility.</p>
                    </div>
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
                    >
                        <Plus className="w-5 h-5" />
                        Add New Car
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4"
                        onClick={() => setShowForm(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6 border-b pb-4">
                                <h3 className="text-xl font-bold text-gray-800">Add New Car</h3>
                                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Plate Number *</label>
                                    <input
                                        type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        value={formData.plateNumber} onChange={e => setFormData({...formData, plateNumber: e.target.value})}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Driver Name *</label>
                                    <input
                                        type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        value={formData.driverName} onChange={e => setFormData({...formData, driverName: e.target.value})}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                                    <input
                                        type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                                        required
                                    />
                                </div>
                                <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700">
                                    Register Car
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <input
                    type="text" placeholder="Search cars..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Plate Number</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Driver Name</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Phone</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {cars.filter(c => c.PlateNumber.toLowerCase().includes(searchTerm.toLowerCase())).map(c => (
                            <tr key={c.PlateNumber} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">{c.PlateNumber}</td>
                                <td className="px-6 py-4 text-gray-700">{c.DriverName}</td>
                                <td className="px-6 py-4 text-gray-600">{c.PhoneNumber}</td>
                                <td className="px-6 py-4 flex gap-3">
                                    <button onClick={() => handleEdit(c)} className="text-indigo-600 hover:text-indigo-800">
                                        <Pencil className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => handleDelete(c.PlateNumber)} className="text-red-600 hover:text-red-800">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
