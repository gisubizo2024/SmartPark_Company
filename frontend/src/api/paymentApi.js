import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/payments';

export const getPayments = () => axios.get(API_BASE);
export const getBillDetails = (recordId) => axios.get(`${API_BASE}/bill/${recordId}`);
export const addPayment = (paymentData) => axios.post(API_BASE, paymentData);
