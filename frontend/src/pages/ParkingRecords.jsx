import { useState, useEffect } from 'react';
import api from '../api/config';
import { LogIn, LogOut, Trash2, Clock, Car as CarIcon, Grid, Pencil } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function ParkingRecords() {
    const { user } = useAuth();
    const [records, setRecords] = useState([]);
    const [cars, setCars] = useState([]);
    const [slots, setSlots] = useState([]);
    
    const [entryData, setEntryData] = useState({ plateNumber: '', slotNumber: '' });

    const fetchData = async () => {
        try {
            const [recRes, carRes, slotRes] = await Promise.all([
                api.get('/api/parking-records'),
                api.get('/api/cars'),
                api.get('/api/parking-slots')
            ]);
            setRecords(recRes.data);
            setCars(carRes.data);
            setSlots(slotRes.data.filter(s => s.SlotStatus === 'Available'));
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleEntry = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/parking-records/entry', entryData);
            fetchData();
            setEntryData({ plateNumber: '', slotNumber: '' });
        } catch (err) {
            console.error(err);
            alert('Error recording car entry');
        }
    };

    const handleExit = async (recordId) => {
        if (window.confirm('Process car exit and generate bill?')) {
            try {
                await api.post(`/api/parking-records/exit/${recordId}`);
                fetchData();
            } catch (err) {
                console.error(err);
                alert('Error recording car exit');
            }
        }
    };

    const handleDelete = async (recordId) => {
        if (window.confirm('Permanently delete this record? This action cannot be undone.')) {
            try {
                await api.delete(`/api/parking-records/${recordId}`, {
                    headers: { 'x-user-role': user.role }
                });
                fetchData();
            } catch (err) {
                console.error(err);
                alert('Error deleting record');
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Parking Operations</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Entry Form */}
                    <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
                        <h3 className="text-xl font-bold text-indigo-800 mb-4 flex items-center gap-2">
                            <LogIn className="w-6 h-6" /> Car Entry
                        </h3>
                        <form onSubmit={handleEntry} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-indigo-900 mb-1">Select Car *</label>
                                <select 
                                    className="w-full px-3 py-2 border border-indigo-200 rounded-lg bg-white"
                                    value={entryData.plateNumber}
                                    onChange={e => setEntryData({...entryData, plateNumber: e.target.value})}
                                    required
                                >
                                    <option value="">Select a registered car</option>
                                    {cars.map(c => (
                                        <option key={c.PlateNumber} value={c.PlateNumber}>{c.PlateNumber} - {c.DriverName}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-indigo-900 mb-1">Select Available Slot *</label>
                                <select 
                                    className="w-full px-3 py-2 border border-indigo-200 rounded-lg bg-white"
                                    value={entryData.slotNumber}
                                    onChange={e => setEntryData({...entryData, slotNumber: e.target.value})}
                                    required
                                >
                                    <option value="">Select a slot</option>
                                    {slots.map(s => (
                                        <option key={s.SlotNumber} value={s.SlotNumber}>Slot #{s.SlotNumber}</option>
                                    ))}
                                </select>
                            </div>
                            <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-md">
                                Record Entry
                            </button>
                        </form>
                    </div>

                    {/* Stats Card */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 flex flex-col justify-center">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-4 bg-orange-100 rounded-full text-orange-600">
                                <Clock className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-gray-500 font-medium">Active Sessions</p>
                                <h4 className="text-3xl font-bold text-gray-800">{records.filter(r => !r.ExitTime).length}</h4>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 italic">"Ensure all exits are recorded to maintain accurate slot availability."</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b bg-gray-50">
                    <h3 className="font-bold text-gray-800">Recent Parking Records</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Plate</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Slot</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Entry Time</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Exit Time</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Duration</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {records.map(r => (
                                <tr key={r.RecordID} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-bold text-gray-900">{r.PlateNumber}</td>
                                    <td className="px-6 py-4 text-gray-700">#{r.SlotNumber}</td>
                                    <td className="px-6 py-4 text-gray-600 text-sm">{new Date(r.EntryTime).toLocaleString()}</td>
                                    <td className="px-6 py-4 text-gray-600 text-sm">{r.ExitTime ? new Date(r.ExitTime).toLocaleString() : '---'}</td>
                                    <td className="px-6 py-4 text-gray-600">{r.DurationHours ? `${r.DurationHours} hrs` : 'Active'}</td>
                                    <td className="px-6 py-4 flex items-center gap-2">
                                        {!r.ExitTime && (
                                            <button 
                                                onClick={() => handleExit(r.RecordID)}
                                                className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm"
                                            >
                                                <LogOut className="w-4 h-4" /> Exit
                                            </button>
                                        )}
                                        {user?.role === 'Admin' && (
                                            <>
                                                <button 
                                                    onClick={() => handleDelete(r.RecordID)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete Record"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        const newTime = prompt("Enter new Entry Time (YYYY-MM-DD HH:MM:SS):", r.EntryTime);
                                                        if (newTime) api.put(`/api/parking-records/${r.RecordID}`, { entryTime: newTime }).then(fetchData);
                                                    }}
                                                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                    title="Edit Record"
                                                >
                                                    <Pencil className="w-5 h-5" />
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
