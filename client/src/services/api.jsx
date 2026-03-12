import axios from 'axios';

const API_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = (data) => api.post('/auth/login', data);
export const getProduits = () => api.get('/produits');
export const createProduit = (data) => api.post('/produits', data);
export const updateProduit = (id, data) => api.put(`/produits/${id}`, data);
export const deleteProduit = (id) => api.delete(`/produits/${id}`);

export const getFournisseurs = () => api.get('/fournisseurs');
export const createFournisseurs = () => api.post('/fournisseurs');
export const updateFournisseurs = () => api.put('/fournisseurs');
export const deleteFournisseurs = () => api.delete('/fournisseurs');

export const getApprovisionnements = () => api.get('/approvisionnements');
export const getAudits = () => api.get('/audits');