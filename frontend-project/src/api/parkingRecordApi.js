import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/parking-records';

export const getRecords = () => axios.get(API_BASE);
export const carEntry = (entryData) => axios.post(`${API_BASE}/entry`, entryData);
export const carExit = (recordId) => axios.post(`${API_BASE}/exit/${recordId}`);
export const updateRecord = (id, data) => axios.put(`${API_BASE}/${id}`, data);
export const deleteRecord = (id) => axios.delete(`${API_BASE}/${id}`);
export const getBill = (recordId) => axios.get(`${API_BASE}/bill/${recordId}`);
