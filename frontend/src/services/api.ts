// src/services/api.ts
import axios, { AxiosInstance, AxiosError } from 'axios';

// Configuration de base - Utilisation de 127.0.0.1 pour éviter les conflits DNS de localhost sous Windows
const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://127.0.0.1:8000';

// Créer l'instance Axios
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============ INTERCEPTEUR - Ajouter le token JWT à chaque requête ============

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============ INTERCEPTEUR - Gérer l'expiration du token ============

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Si erreur 401 (non autorisé) et pas déjà une tentative de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          // Pas de refresh token, redirection vers login
          localStorage.clear();
          window.location.href = '/login';
          return Promise.reject(error);
        }

        // Essayer de rafraîchir le token - Alignement sur la structure attendue par ton auth_service backend
        const response = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const { access_token, refresh_token: newWithdrawnRefreshToken } = response.data;

        // Sauvegarder les nouveaux tokens
        localStorage.setItem('access_token', access_token);
        if (newWithdrawnRefreshToken) {
          localStorage.setItem('refresh_token', newWithdrawnRefreshToken);
        }

        // Réessayer la requête originale avec le nouveau token rafraîchi
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token invalide ou expiré, nettoyage complet et redirection
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ============ ENDPOINTS D'AUTHENTIFICATION ============

export const authAPI = {
  // Enregistrement
  register: async (data: {
    name: string;
    email: string;
    password: string;
    telephone: string;
  }) => {
    const response = await api.post('/api/v1/auth/register', data);
    return response.data;
  },

  // Connexion au format JSON - Aligné sur le schéma LoginRequest de ton Backend
  login: async (email: string, password: string) => {
    const response = await api.post('/api/v1/auth/login', {
      email: email,
      password: password,
    });
    
    // Automatisation : On stocke directement lors d'une réussite d'authentification
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);
    }
    return response.data;
  },

  // Rafraîchir le token
  refreshToken: async (refresh_token: string) => {
    const response = await api.post('/api/v1/auth/refresh', {
      refresh_token,
    });
    return response.data;
  },

  // Récupérer les infos de l'utilisateur connecté
  getCurrentUser: async () => {
    const response = await api.get('/api/v1/auth/me');
    return response.data;
  },

  // Changer le password
  changePassword: async (data: {
    old_password: string;
    new_password: string;
    confirm_password: string;
  }) => {
    const response = await api.post('/api/v1/auth/change-password', data);
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await api.post('/api/v1/auth/logout');
    localStorage.clear(); // Nettoie le cache local au logout
    return response.data;
  },
};

// ============ ENDPOINTS POUR COLLABORATEURS (DASHBOARD ADMIN) ============

export const adminAPI = {
  // 🔄 CORRECTION : Route changée de '/api/v1/farm/invite' vers '/api/v1/auth/invite' pour correspondre au backend
  inviteCollaborator: async (data: {
    name: string;
    email: string;
    telephone: string;
    role: 'agent' | 'veterinarian' | 'commercial';
    farm_id: string; // Ajout requis pour l'association FarmMember du backend
  }) => {
    const response = await api.post('/api/v1/auth/invite', data);
    return response.data;
  },
};

// ============ ENDPOINTS POUR AUTRES RESSOURCES ============

export const farmsAPI = {
  // Lister les fermes
  getAll: async (skip: number = 0, limit: number = 100) => {
    const response = await api.get('/api/v1/farms', {
      params: { skip, limit },
    });
    return response.data;
  },

  // Récupérer une ferme
  getById: async (id: string) => {
    const response = await api.get(`/api/v1/farms/${id}`);
    return response.data;
  },

  // Créer une ferme
  create: async (data: any) => {
    const response = await api.post('/api/v1/farms', data);
    return response.data;
  },

  // Modifier une ferme
  update: async (id: string, data: any) => {
    const response = await api.put(`/api/v1/farms/${id}`, data);
    return response.data;
  },

  // Supprimer une ferme
  delete: async (id: string) => {
    const response = await api.delete(`/api/v1/farms/${id}`);
    return response.data;
  },
};

// ============ ENDPOINTS POUR POULTRY HOUSES ============

export const poultryHousesAPI = {
  getAll: async (skip: number = 0, limit: number = 100) => {
    const response = await api.get('/api/v1/poultry-houses', {
      params: { skip, limit },
    });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/api/v1/poultry-houses/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/api/v1/poultry-houses', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.put(`/api/v1/poultry-houses/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/api/v1/poultry-houses/${id}`);
    return response.data;
  },
};

// ============ EXPORT ============

export default api;