import { useState, useEffect } from 'react';
import axios from 'axios';
import { CreditCard, Receipt, Eye, Printer, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Payments() {
    const [payments, setPayments] = useState([]);
    const [selectedBill, setSelectedBill] = useState(null);

    const fetchData = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/payments');
            setPayments(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const viewBill = async (recordId) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/payments/bill/${recordId}`);
            setSelectedBill(res.data);
        } catch (err) {
            console.error(err);
            alert('Error fetching bill details');
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Payment Management</h2>
                    <p className="text-gray-600">Review all parking transactions and generate invoices.</p>
                </div>
                <div className="p-4 bg-green-100 rounded-full text-green-600">
                    <CreditCard className="w-10 h-10" />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Payment ID</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Record ID</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Amount (RWF)</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Bill</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {payments.map(p => (
                            <tr key={p.PaymentID} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 text-gray-900 font-medium">#{p.PaymentID}</td>
                                <td className="px-6 py-4 text-gray-700">Rec #{p.RecordID}</td>
                                <td className="px-6 py-4 font-bold text-indigo-600">{p.AmountPaid} RWF</td>
                                <td className="px-6 py-4 text-gray-600 text-sm">{new Date(p.PaymentDate).toLocaleString()}</td>
                                <td className="px-6 py-4">
                                    <button 
                                        onClick={() => viewBill(p.RecordID)}
                                        className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-bold"
                                    >
                                        <Eye className="w-4 h-4" /> View Bill
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Bill Modal */}
            <AnimatePresence>
                {selectedBill && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4"
                    >
                        <motion.div
                            initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                        >
                            <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Receipt className="w-6 h-6" />
                                    <h3 className="text-xl font-bold uppercase tracking-widest">SmartPark Invoice</h3>
                                </div>
                                <button onClick={() => setSelectedBill(null)} className="hover:bg-indigo-500 p-1 rounded-full">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="p-8 space-y-6">
                                <div className="flex justify-between border-b pb-4">
                                    <div>
                                        <p className="text-xs text-gray-500 font-bold uppercase">Plate Number</p>
                                        <p className="text-2xl font-black text-gray-800">{selectedBill.PlateNumber}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500 font-bold uppercase">Payment Date</p>
                                        <p className="text-sm font-medium">{new Date(selectedBill.PaymentDate).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Entry Time:</span>
                                        <span className="font-medium">{new Date(selectedBill.EntryTime).toLocaleTimeString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Exit Time:</span>
                                        <span className="font-medium">{new Date(selectedBill.ExitTime).toLocaleTimeString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Duration:</span>
                                        <span className="font-medium">{selectedBill.DurationHours} hours</span>
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-6 rounded-xl border-2 border-dashed border-gray-200">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-bold text-gray-800">Total Amount</span>
                                        <span className="text-3xl font-black text-indigo-600">{selectedBill.AmountPaid} RWF</span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => window.print()}
                                    className="w-full py-4 bg-gray-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-900 transition-all shadow-lg"
                                >
                                    <Printer className="w-5 h-5" /> Print Invoice
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
