import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  timeout: 15000,
});

export const saveScan = (data) => API.post('/scan/save', data);
export const getLatestScan = () => API.get('/scan/latest');
export const getScanById = (id) => API.get(`/scan/${id}`);
export const getAllDoctors = () => API.get('/doctors/');
export const getDoctorsBySpecialization = (spec) =>
  API.get(`/doctors/${encodeURIComponent(spec)}`);
export const downloadReport = (scanId) =>
  API.get(`/report/${scanId}`, { responseType: 'blob' });

export default API;
