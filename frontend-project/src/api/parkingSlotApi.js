import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/parking-slots';

export const getSlots = () => axios.get(API_BASE);
export const addSlot = (slotData) => axios.post(API_BASE, slotData);
export const updateSlotStatus = (slotNumber, status) => axios.put(`${API_BASE}/${slotNumber}`, { status });
