import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Reports() {
    const [data, setData] = useState([]);
    const [month, setMonth] = useState('');

    const fetchReport = async () => {
        try {
            const url = month
                ? `http://localhost:5000/api/reports/payroll?month=${month}`
                : 'http://localhost:5000/api/reports/payroll';
            const res = await axios.get(url);
            setData(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [month]); // Refetch when month changes

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Monthly Payroll Report</h2>

            <div className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <label className="text-gray-700 font-medium">Filter by Month:</label>
                    <input
                        type="month"
                        className="border p-2 rounded outline-none focus:ring-2 focus:ring-indigo-200"
                        value={month}
                        onChange={e => setMonth(e.target.value)}
                    />
                </div>
                <button
                    onClick={handlePrint}
                    className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900 transition-colors flex items-center"
                >
                    Print Report
                </button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto" id="printable-area">
                <h3 className="text-xl font-bold mb-4 text-center">SmartPark Company - Payroll Report {month && `(${month})`}</h3>
                <table className="min-w-full divide-y divide-gray-200 border">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border">First Name</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border">Last Name</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border">Position</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border">Department</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border">Net Salary</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.length > 0 ? (
                            data.map((row, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border">{row.FirstName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border">{row.LastName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border">{row.Position}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border">{row.DepartmentName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 border">{row.NetSalary}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No records found for this period.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
