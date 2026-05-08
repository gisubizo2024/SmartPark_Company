import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/cars';

export const getCars = () => axios.get(API_BASE);
export const addCar = (carData) => axios.post(API_BASE, carData);
export const deleteCar = (plateNumber) => axios.delete(`${API_BASE}/${plateNumber}`);
export const updateCar = (plateNumber, carData) => axios.put(`${API_BASE}/${plateNumber}`, carData);
