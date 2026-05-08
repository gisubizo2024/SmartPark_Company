import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
    Users, Car, CreditCard, TrendingUp,
    Activity, AlertCircle, CheckCircle, Grid
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';

export default function Dashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/dashboard/summary');
                setData(res.data);
            } catch (err) {
                console.error("Error fetching dashboard data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!data) return <div className="text-center p-10 text-red-500">Failed to load dashboard data.</div>;

    const { kpi, charts, recentActivity } = data;

    const COLORS = ['#4F46E5', '#EF4444', '#10B981', '#F59E0B'];

    const occupancyData = [
        { name: 'Occupied', value: kpi.occupiedSlots },
        { name: 'Available', value: kpi.availableSlots }
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">SmartPark Overview</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    title="Total Cars"
                    value={kpi.totalCars}
                    icon={<Car className="w-8 h-8 text-blue-600" />}
                    color="bg-blue-50"
                />
                <KPICard
                    title="Total Slots"
                    value={kpi.totalSlots}
                    icon={<Grid className="w-8 h-8 text-green-600" />}
                    color="bg-green-50"
                />
                <KPICard
                    title="Total Revenue"
                    value={`${kpi.totalRevenue?.toLocaleString()} RWF`}
                    icon={<CreditCard className="w-8 h-8 text-indigo-600" />}
                    color="bg-indigo-50"
                />
                <KPICard
                    title="Occupancy Rate"
                    value={`${kpi.totalSlots > 0 ? Math.round((kpi.occupiedSlots / kpi.totalSlots) * 100) : 0}%`}
                    icon={<Activity className="w-8 h-8 text-orange-600" />}
                    color="bg-orange-50"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Revenue Trends */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                >
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-indigo-600" />
                        Revenue Trends (Last 7 Days)
                    </h3>
                    <div className="h-80 w-full min-h-[320px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={charts.revenueTrends || []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <RechartsTooltip />
                                <Bar dataKey="total" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Slot Occupancy Pie */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                >
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                        <Activity className="w-5 h-5 mr-2 text-indigo-600" />
                        Current Occupancy
                    </h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={occupancyData}
                                    cx="50%" cy="50%"
                                    innerRadius={60} outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    <Cell fill="#EF4444" />
                                    <Cell fill="#10B981" />
                                </Pie>
                                <RechartsTooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>

            {/* Recent Operations */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                >
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                        <Activity className="w-5 h-5 mr-2 text-green-600" />
                        Recent Parking Operations
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                                <tr>
                                    <th className="px-4 py-3 text-left">Plate</th>
                                    <th className="px-4 py-3 text-left">Driver</th>
                                    <th className="px-4 py-3 text-left">Slot</th>
                                    <th className="px-4 py-3 text-left">Entry</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {recentActivity && recentActivity.map((rec, i) => (
                                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 font-bold text-gray-800">{rec.PlateNumber}</td>
                                        <td className="px-4 py-3 text-gray-600">{rec.DriverName}</td>
                                        <td className="px-4 py-3 text-gray-500">#{rec.SlotNumber}</td>
                                        <td className="px-4 py-3 text-gray-500 text-sm">{new Date(rec.EntryTime).toLocaleTimeString()}</td>
                                    </tr>
                                ))}
                                {(!recentActivity || recentActivity.length === 0) && (
                                    <tr>
                                        <td colSpan="4" className="text-center py-4 text-gray-400 italic">No recent activity.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                >
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                        <AlertCircle className="w-5 h-5 mr-2 text-orange-600" />
                        System Status
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-start bg-green-50 p-3 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                            <div>
                                <h4 className="text-sm font-semibold text-green-800">SmartPark API Live</h4>
                                <p className="text-xs text-green-600 mt-1">Real-time slot tracking enabled.</p>
                            </div>
                        </div>
                        {kpi.availableSlots === 0 && (
                            <div className="flex items-start bg-red-50 p-3 rounded-lg">
                                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                                <div>
                                    <h4 className="text-sm font-semibold text-red-800">Parking Full</h4>
                                    <p className="text-xs text-red-600 mt-1">No available slots for new arrivals.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

function KPICard({ title, value, icon, color, subtext }) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between`}
        >
            <div>
                <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">{title}</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-2">{value}</h3>
                {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
            </div>
            <div className={`p-3 rounded-lg ${color}`}>
                {icon}
            </div>
        </motion.div>
    );
}
