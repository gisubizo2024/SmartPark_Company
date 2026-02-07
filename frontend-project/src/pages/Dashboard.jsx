import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
    Users, Building2, CreditCard, TrendingUp,
    Activity, AlertCircle, CheckCircle
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

    const { kpi, charts, recentHires } = data;

    const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE'];

    // Loading check moved up

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    title="Total Employees"
                    value={kpi.totalEmployees}
                    icon={<Users className="w-8 h-8 text-blue-600" />}
                    color="bg-blue-50"
                />
                <KPICard
                    title="Departments"
                    value={kpi.totalDepartments}
                    icon={<Building2 className="w-8 h-8 text-green-600" />}
                    color="bg-green-50"
                />
                <KPICard
                    title="Total Payroll"
                    value={`${kpi.totalSalaryPaid?.toLocaleString()} RWF`}
                    icon={<CreditCard className="w-8 h-8 text-indigo-600" />}
                    color="bg-indigo-50"
                    subtext="All time processed"
                />
                <KPICard
                    title="Avg Net Salary"
                    value={`${kpi.avgSalary?.toLocaleString()} RWF`}
                    icon={<TrendingUp className="w-8 h-8 text-orange-600" />}
                    color="bg-orange-50"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Salary Trends */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                >
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-indigo-600" />
                        Salary Trends (Last 6 Months)
                    </h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={charts.salaryTrends || []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="monthStr" />
                                <YAxis />
                                <RechartsTooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Bar dataKey="total" fill="#4F46E5" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Department Distribution */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                >
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                        <Users className="w-5 h-5 mr-2 text-indigo-600" />
                        Employee Distribution
                    </h3>
                    <div className="h-80 w-full flex justify-center items-center">
                        {(!charts.departmentDistribution || charts.departmentDistribution.length === 0) ? (
                            <p className="text-gray-400">No department data available</p>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={charts.departmentDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="count"
                                        nameKey="DepartmentName"
                                    >
                                        {charts.departmentDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
// Removed duplicate/legacy code block
                                    <RechartsTooltip />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Bottom Actions / List */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Hires */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center">
                            <Activity className="w-5 h-5 mr-2 text-green-600" />
                            Recently Hired Employees
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                                <tr>
                                    <th className="px-4 py-3 text-left">Name</th>
                                    <th className="px-4 py-3 text-left">Position</th>
                                    <th className="px-4 py-3 text-left">Department</th>
                                    <th className="px-4 py-3 text-left">Hired Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {recentHires && recentHires.map((emp, i) => (
                                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-gray-800">{emp.FirstName} {emp.LastName}</td>
                                        <td className="px-4 py-3 text-gray-600">{emp.Position}</td>
                                        <td className="px-4 py-3 text-gray-500 badge">
                                            <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs px-2">
                                                {emp.DepartmentCode}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 text-sm">{new Date(emp.hiredDate).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                                {(!recentHires || recentHires.length === 0) && (
                                    <tr>
                                        <td colSpan="4" className="text-center py-4 text-gray-400">No recent hires found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* System Alerts */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
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
                                <h4 className="text-sm font-semibold text-green-800">System Operational</h4>
                                <p className="text-xs text-green-600 mt-1">Database connection is stable.</p>
                            </div>
                        </div>

                        {data.kpi.totalEmployees === 0 && (
                            <div className="flex items-start bg-red-50 p-3 rounded-lg">
                                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                                <div>
                                    <h4 className="text-sm font-semibold text-red-800">No Employees Found</h4>
                                    <p className="text-xs text-red-600 mt-1">Please register new employees to get started.</p>
                                </div>
                            </div>
                        )}

                        {data.kpi.totalDepartments === 0 && (
                            <div className="flex items-start bg-orange-50 p-3 rounded-lg">
                                <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 mr-3 flex-shrink-0" />
                                <div>
                                    <h4 className="text-sm font-semibold text-orange-800">No Departments</h4>
                                    <p className="text-xs text-orange-600 mt-1">Create departments before adding employees.</p>
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
