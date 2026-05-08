import axios from 'axios';

const API_BASE = 'http://localhost:5000';

export const login = (username, password) => axios.post(`${API_BASE}/auth/login`, { username, password });
export const register = (username, password) => axios.post(`${API_BASE}/auth/register`, { username, password });
export const forgotPassword = (username, newPassword) => axios.post(`${API_BASE}/auth/forgot-password`, { username, newPassword });
