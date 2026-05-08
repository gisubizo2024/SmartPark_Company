import { useState, useEffect } from 'react';
import api from '../api/config';
import { Plus, X, Grid, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ParkingSlots() {
    const [slots, setSlots] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [slotNumber, setSlotNumber] = useState('');

    const fetchData = async () => {
        try {
            const res = await api.get('/api/parking-slots');
            setSlots(res.data);
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
            await api.post('/api/parking-slots', { slotNumber });
            fetchData();
            setSlotNumber('');
            setShowForm(false);
        } catch (err) {
            console.error(err);
            alert('Error creating slot');
        }
    };

    const handleDelete = async (num) => {
        if (window.confirm('Delete this slot?')) {
            try {
                await api.delete(`/api/parking-slots/${num}`);
                fetchData();
            } catch (err) {
                console.error(err);
                alert('Error deleting slot');
            }
        }
    };

    const toggleStatus = async (num, current) => {
        const newStatus = current === 'Available' ? 'Occupied' : 'Available';
        try {
            await api.put(`/api/parking-slots/${num}`, { status: newStatus });
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">Parking Slots</h2>
                        <p className="text-gray-600">Monitor slot availability and manage parking spaces.</p>
                    </div>
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
                    >
                        <Plus className="w-5 h-5" />
                        Add New Slot
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
                                <h3 className="text-xl font-bold text-gray-800">Add Parking Slot</h3>
                                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Slot Number (Numeric) *</label>
                                    <input
                                        type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        value={slotNumber} onChange={e => setSlotNumber(e.target.value)}
                                        required
                                    />
                                </div>
                                <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700">
                                    Create Slot
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {slots.map(s => (
                    <motion.div
                        key={s.SlotNumber}
                        whileHover={{ scale: 1.05 }}
                        className={`relative p-6 rounded-xl shadow-sm border-2 flex flex-col items-center justify-center gap-2 transition-colors group ${
                            s.SlotStatus === 'Available' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
                        }`}
                    >
                        <button 
                            onClick={() => handleDelete(s.SlotNumber)}
                            className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                        <Grid className="w-8 h-8" />
                        <span className="text-2xl font-bold">#{s.SlotNumber}</span>
                        <button 
                            onClick={() => toggleStatus(s.SlotNumber, s.SlotStatus)}
                            className="flex items-center gap-1 text-xs font-semibold uppercase hover:underline"
                        >
                            {s.SlotStatus === 'Available' ? (
                                <><CheckCircle className="w-3 h-3" /> Available</>
                            ) : (
                                <><XCircle className="w-3 h-3" /> Occupied</>
                            )}
                        </button>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
