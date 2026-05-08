import { useState, useEffect } from 'react';
import api from '../api/config';
import { FileText, Download, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Reports() {
    const [reportData, setReportData] = useState([]);

    const fetchData = async () => {
        try {
            const res = await api.get('/api/reports/daily');
            setReportData(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const totalRevenue = reportData.reduce((sum, item) => sum + Number(item.AmountPaid), 0);

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Daily Reports</h2>
                    <p className="text-gray-600 flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> Transactions for {new Date().toLocaleDateString()}
                    </p>
                </div>
                <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-bold transition-all shadow-md">
                    <Download className="w-5 h-5" /> Export PDF
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Transactions</p>
                    <h3 className="text-3xl font-black text-gray-800 mt-2">{reportData.length}</h3>
                </div>
                <div className="bg-indigo-600 p-6 rounded-xl border border-indigo-500 shadow-lg text-white md:col-span-2">
                    <p className="text-sm font-bold text-indigo-100 uppercase tracking-wider">Today's Revenue</p>
                    <h3 className="text-4xl font-black mt-2">{totalRevenue} RWF</h3>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b bg-gray-50 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <h3 className="font-bold text-gray-800">Transaction Breakdown</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Plate Number</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Entry</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Exit</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Duration</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {reportData.map((item, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-gray-900">{item.PlateNumber}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{new Date(item.EntryTime).toLocaleTimeString()}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{new Date(item.ExitTime).toLocaleTimeString()}</td>
                                    <td className="px-6 py-4 text-gray-700">{item.DurationHours} hrs</td>
                                    <td className="px-6 py-4 font-bold text-indigo-600">{item.AmountPaid} RWF</td>
                                </tr>
                            ))}
                            {reportData.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-400 italic">
                                        No transactions recorded for today.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
