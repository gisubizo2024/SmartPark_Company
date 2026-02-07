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
    }, [month]);

    const handlePrint = () => {
        window.print();
    };

    // Calculate Totals
    const totalPayroll = data.reduce((sum, row) => sum + Number(row.GrossSalary || 0), 0);
    const totalDeductions = data.reduce((sum, row) => sum + Number(row.TotalDeduction || 0), 0);
    const totalNet = data.reduce((sum, row) => sum + Number(row.NetSalary || 0), 0);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF' }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <div className="space-y-8 print:space-y-4">
            {/* Header - Printable */}
            <div className="hidden print:block text-center mb-8 border-b-2 border-gray-800 pb-4">
                <h1 className="text-4xl font-bold text-gray-900 uppercase tracking-wider">SmartPark Company</h1>
                <p className="text-gray-600 text-sm mt-1">123 Business Road, Tech City, Rwanda</p>
                <p className="text-gray-600 text-sm">Tel: +250 788 000 000 | Email: finance@smartpark.com</p>
            </div>

            {/* Controls - No Print */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 print:hidden">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Monthly Payroll Report</h2>
                    <p className="text-sm text-gray-500">View and print consolidated payroll data</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <input
                            type="month"
                            className="pl-4 pr-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-gray-700"
                            value={month}
                            onChange={e => setMonth(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={handlePrint}
                        className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2-4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                        Print Report
                    </button>
                </div>
            </div>

            {/* Report Content */}
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 print:shadow-none print:border-none print:p-0">
                {/* Report Title */}
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 uppercase underline decoration-2 decoration-gray-400 underline-offset-4">Payroll Summary</h2>
                    <p className="text-gray-600 font-medium mt-2 text-lg">{month ? new Date(month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'All Time Records'}</p>
                    <p className="text-gray-400 text-sm mt-1 print:hidden">Generated on: {new Date().toLocaleDateString()}</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 print:grid-cols-4 print:gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 print:border-gray-900">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Total Employees</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{data.length}</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 print:bg-white print:border-gray-900">
                        <p className="text-xs font-bold text-blue-600 uppercase tracking-wide print:text-gray-900">Total Gross</p>
                        <p className="text-xl font-bold text-blue-900 mt-1 print:text-gray-900">{formatCurrency(totalPayroll)}</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg border border-red-100 print:bg-white print:border-gray-900">
                        <p className="text-xs font-bold text-red-600 uppercase tracking-wide print:text-gray-900">Total Deductions</p>
                        <p className="text-xl font-bold text-red-900 mt-1 print:text-gray-900">{formatCurrency(totalDeductions)}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100 print:bg-white print:border-gray-900">
                        <p className="text-xs font-bold text-green-600 uppercase tracking-wide print:text-gray-900">Net Payable</p>
                        <p className="text-xl font-bold text-green-900 mt-1 print:text-gray-900">{formatCurrency(totalNet)}</p>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse border border-gray-300">
                        <thead>
                            <tr className="bg-gray-800 text-white print:bg-gray-200 print:text-black">
                                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider border border-gray-300">Employee</th>
                                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider border border-gray-300">Position</th>
                                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider border border-gray-300">Department</th>
                                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider border border-gray-300">Gross Salary</th>
                                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider border border-gray-300">Deductions</th>
                                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider border border-gray-300">Net Salary</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {data.length > 0 ? (
                                data.map((row, index) => (
                                    <tr key={index} className="hover:bg-gray-50 print:hover:bg-transparent">
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900 border border-gray-300">{row.FirstName} {row.LastName}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600 border border-gray-300">{row.Position}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600 border border-gray-300">{row.DepartmentName}</td>
                                        <td className="px-4 py-3 text-sm text-right text-gray-900 border border-gray-300">{formatCurrency(row.GrossSalary)}</td>
                                        <td className="px-4 py-3 text-sm text-right text-red-600 border border-gray-300">{formatCurrency(row.TotalDeduction)}</td>
                                        <td className="px-4 py-3 text-sm text-right font-bold text-green-700 border border-gray-300 print:text-black">{formatCurrency(row.NetSalary)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500 border border-gray-300">No payroll records found for this period.</td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot>
                            <tr className="bg-gray-100 font-bold print:bg-gray-200">
                                <td colSpan="3" className="px-4 py-3 text-right border border-gray-300 uppercase">Totals</td>
                                <td className="px-4 py-3 text-right border border-gray-300">{formatCurrency(totalPayroll)}</td>
                                <td className="px-4 py-3 text-right border border-gray-300 text-red-600 print:text-black">{formatCurrency(totalDeductions)}</td>
                                <td className="px-4 py-3 text-right border border-gray-300 text-green-700 print:text-black">{formatCurrency(totalNet)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Signatures */}
                <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 print:flex print:justify-between print:mt-24">
                    <div className="text-center">
                        <div className="border-b-2 border-gray-400 mb-2 w-48 mx-auto print:w-64"></div>
                        <p className="font-bold text-gray-700 uppercase text-sm">Prepared By</p>
                        <p className="text-xs text-gray-500">Accountant</p>
                    </div>
                    <div className="text-center">
                        <div className="border-b-2 border-gray-400 mb-2 w-48 mx-auto print:w-64"></div>
                        <p className="font-bold text-gray-700 uppercase text-sm">Approved By</p>
                        <p className="text-xs text-gray-500">Finance Manager</p>
                    </div>
                </div>

                {/* Print Footer */}
                <div className="hidden print:block mt-8 text-center text-xs text-gray-500 border-t pt-2">
                    <p>This document is system generated and is valid without a seal.</p>
                    <p>SmartPark Management System &copy; {new Date().getFullYear()}</p>
                </div>
            </div>
        </div>
    );
}
