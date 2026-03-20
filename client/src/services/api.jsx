import axios from 'axios';

const API_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (!config.url.includes('/auth/login')) {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});



export const login = (credentials) => api.post('/auth/login', credentials);


export const getProduits = () => api.get('/produits');
export const getProduitById = (id) => api.get(`/produits/${id}`);
export const createProduit = (data) => api.post('/produits', data);
export const updateProduit = (id, data) => api.put(`/produits/${id}`, data);
export const deleteProduit = (id) => api.delete(`/produits/${id}`);


export const getFournisseurs = () => api.get('/fournisseurs');
export const getFournisseurById = (id) => api.get(`/fournisseurs/${id}`);
export const createFournisseur = (data) => api.post('/fournisseurs', data);
export const updateFournisseur = (id, data) => api.put(`/fournisseurs/${id}`, data);
export const deleteFournisseur = (id) => api.delete(`/fournisseurs/${id}`);

export const getApprovisionnements = () => api.get('/approvisionnements');

export const getApprovisionnement = (n_frs, n_produit) =>
  api.get(`/approvisionnements/${n_frs}/${n_produit}`);

export const createApprovisionnement = (data) =>
  api.post('/approvisionnements', data);

export const updateApprovisionnement = (n_frs, n_produit, data) =>
  api.put(`/approvisionnements/${n_frs}/${n_produit}`, data);

export const deleteApprovisionnement = (n_frs, n_produit) =>
  api.delete(`/approvisionnements/${n_frs}/${n_produit}`);

export const getAudits = () => api.get('/audits');

export const getStatsDashboard = async () => {
  const [produitsRes, fournisseursRes, approvisionnementsRes] = await Promise.all([
    getProduits(),
    getFournisseurs(),
    getApprovisionnements(),
  ]);

  const totalStock = produitsRes.data.reduce((sum, p) => sum + (p.stock || 0), 0);

  return {
    produitsCount: produitsRes.data.length,
    fournisseursCount: fournisseursRes.data.length,
    approvisionnementsCount: approvisionnementsRes.data.length,
    totalStock,
  };
};
export default api;