// src/services/api.ts
import axios, { AxiosInstance, AxiosError } from 'axios';

// Définir apiClient
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api' || 'http://localhost:9000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Configuration de base
const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://127.0.0.1:8000';

// Créer l'instance Axios
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============ INTERCEPTEUR - Ajouter le token JWT ============
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ============ INTERCEPTEUR - Gérer l'expiration (Refresh Token) ============
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('No refresh token');

        const response = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const { access_token, refresh_token: newRefreshToken } = response.data;
        localStorage.setItem('access_token', access_token);
        if (newRefreshToken) localStorage.setItem('refresh_token', newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// ============ ENDPOINTS D'AUTHENTIFICATION ============
export const authAPI = {
  register: (data: any) => api.post('/api/v1/auth/register', data).then(r => r.data),
  login: async (email: string, password: string) => {
    const response = await api.post('/api/v1/auth/login', { email, password });
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);
    }
    return response.data;
  },
  refreshToken: (token: string) => api.post('/api/v1/auth/refresh', { refresh_token: token }).then(r => r.data),
  getCurrentUser: () => api.get('/api/v1/auth/me').then(r => r.data),
  changePassword: (data: any) => api.post('/api/v1/auth/change-password', data).then(r => r.data),
  logout: () => api.post('/api/v1/auth/logout').finally(() => localStorage.clear()),
};


// ============ ENDPOINTS USERS ============
export const usersAPI = {
  getCollaborators: () => api.get('/api/v1/users/collaborators').then(r => r.data),
  getMe: () => api.get('/api/v1/users/me').then(r => r.data),
  getMyFarms: () => api.get('/api/v1/users/my-farms').then(r => r.data),
  updateUser: (userId: string, data: { name?: string; telephone?: string; avatar?: string; role?: string }) => 
    api.put(`/api/v1/users/${userId}`, data).then(r => r.data),
  toggleUserStatus: (userId: string) => 
    api.put(`/api/v1/users/${userId}/toggle-status`, {}).then(r => r.data),
  deleteUser: (userId: string) => 
    api.delete(`/api/v1/users/${userId}`).then(r => r.data),
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/v1/users/upload-avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(r => r.data);
  },
    inviteCollaborator: (data: any) => api.post('/api/v1/users/invite', data).then(r => r.data),
    getMyAccessibleFarms: () => api.get('/api/v1/users/my-accessible-farms').then(r => r.data),
};

// ============ ENDPOINTS ADMIN (INVITATION) ============
// export const adminAPI = {
//   inviteCollaborator: (data: any) => api.post('/api/v1/users/invite', data).then(r => r.data),
// };

// ============ ENDPOINTS FARMS ============
export const farmsAPI = {
  getAll: (skip = 0, limit = 100, search?: string, poultryType?: string, activeOnly = true) => {
    const params: any = { skip, limit, active_only: activeOnly };
    if (search) params.search = search;
    if (poultryType) params.poultry_type = poultryType;
    return api.get('/api/v1/farms', { params }).then(r => r.data);
  },
  getById: (id: string) => api.get(`/api/v1/farms/${id}`).then(r => r.data),
  getDetails: (id: string) => api.get(`/api/v1/farms/${id}/details`).then(r => r.data),
  getPoultryHouses: (farmId: string, includeInactive = false) => 
    api.get(`/api/v1/farms/${farmId}/poultry-houses`, { params: { include_inactive: includeInactive } }).then(r => r.data),
  getMyManagedFarms: () => api.get('/api/v1/users/my-farms').then(r => r.data),
  create: (data: any) => api.post('/api/v1/farms', data).then(r => r.data),
  update: (id: string, data: any) => api.put(`/api/v1/farms/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/api/v1/farms/${id}`).then(r => r.data),
};

// ============ ENDPOINTS POULTRY HOUSES ============
export const poultryHousesAPI = {
  getAll: (skip = 0, limit = 100, farmId?: string, activeOnly = true) => {
    const params: any = { skip, limit };
    if (farmId) params.farm_id = farmId;
    if (activeOnly) params.active_only = activeOnly;
    return api.get('/api/v1/poultry-houses', { params }).then(r => r.data);
  },
  getByFarm: (farmId: string, includeInactive = false) => 
    api.get(`/api/v1/poultry-houses/farm/${farmId}`, { params: { include_inactive: includeInactive } }).then(r => r.data),
  getById: (id: string) => api.get(`/api/v1/poultry-houses/${id}`).then(r => r.data),
  getWithFlock: (houseId: string) => api.get(`/api/v1/farms/poultry-houses/${houseId}`).then(r => r.data),
  create: (data: any) => api.post('/api/v1/poultry-houses', data).then(r => r.data),
  update: (id: string, data: any) => api.put(`/api/v1/poultry-houses/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/api/v1/poultry-houses/${id}`).then(r => r.data),
};


// ============ ENDPOINTS BANDS ============
export const bandsAPI = {
  getAll: () => api.get('/api/v1/bands').then(r => r.data),
  getByFarm: (farmId: string) => api.get(`/api/v1/bands/farm/${farmId}`).then(r => r.data),
  getById: (id: string) => api.get(`/api/v1/bands/${id}`).then(r => r.data),
  create: (data: any) => api.post('/api/v1/bands', data).then(r => r.data),
  update: (id: string, data: any) => api.put(`/api/v1/bands/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/api/v1/bands/${id}`).then(r => r.data),
};

// ============ ENDPOINTS ESPECES ============
export const especesAPI = {
  getAll: () => api.get('/api/v1/especes').then(r => r.data),
  getById: (id: string) => api.get(`/api/v1/especes/${id}`).then(r => r.data),
  create: (data: any) => api.post('/api/v1/especes', data).then(r => r.data),
  update: (id: string, data: any) => api.put(`/api/v1/especes/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/api/v1/especes/${id}`).then(r => r.data),
};

// ============ ENDPOINTS FLOCKS ============

export const flocksAPI = {
  getAll: () => api.get('/api/v1/flocks').then(res => res.data),
  getById: (id: string) => api.get(`/api/v1/flocks/${id}`).then(res => res.data),
  create: (data: any) => api.post('/api/v1/flocks', data).then(res => res.data),
  getWeightHistory: (id: string) => api.get(`/api/v1/flocks/${id}/weight-history`).then(res => res.data),
  getTreatments: (id: string) => api.get(`/api/v1/flocks/${id}/treatments`).then(res => res.data),
  update: (id: string, data: any) => api.patch(`/api/v1/flocks/${id}`, data).then(res => res.data),
  getWeighings: (id: string) => api.get(`/api/v1/flocks/${id}/weighings`).then(res => res.data),
  

  // Alimentation
  recordFeeding: async (flockId: string, data: {
    feed_type: string;
    quantity_kg: number;
    stock_item_id: string;
    date: string;
  }) => {
    const response = await api.post(`/api/v1/flocks/${flockId}/feeding`, data);
    return response.data;
  },

  // Pesée
   recordWeighing: async (flockId: string, data: {
    average_weight: number;
    sample_size: number;
    weights?: number[];
  }) => {
    const response = await api.post(`/api/v1/flocks/${flockId}/weighings`, data);
    return response.data;
  },
  // Mortalité
  recordMortality: async (flockId: string, data: {
    quantity: number;
    cause?: string;
    // date: string;
  }) => {
    const response = await api.post(`/api/v1/flocks/${flockId}/mortality`, data);
    return response.data;
  },

  // Division du lot (quarantaine)
  splitFlock: async (flockId: string, data: {
    quantity: number;
    new_flock_name: string;
    is_quarantine: boolean;
    reason?: string;
  }) => {
    const response = await api.post(`/api/v1/flocks/${flockId}/split`, data);
    return response.data;
  },

  // Collecte d'œufs
  recordEggCollection: async (flockId: string, data: {
    egg_count: number;
    egg_size: string;
    notes?: string;
    date: string;
  }) => {
    const response = await api.post(`/api/v1/flocks/${flockId}/egg-collections`, data);
    return response.data;
  },
};

// ============ ENDPOINTS STOCK ============
export const stockAPI = {
  getAll: (params?: { farmId?: string; category?: string; status?: string; search?: string }) => {
    return api.get('/api/v1/stock', { params }).then(r => r.data);
  },
  getById: (id: string) => api.get(`/api/v1/stock/${id}`).then(r => r.data),
  create: (data: any) => api.post('/api/v1/stock', data).then(r => r.data),
  update: (id: string, data: any) => api.put(`/api/v1/stock/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/api/v1/stock/${id}`).then(r => r.data),
  adjustQuantity: (id: string, quantity: number, type: string, comment?: string) => 
    api.post(`/api/v1/stock/${id}/adjust-quantity`, null, { params: { quantity, type, comment } }).then(r => r.data),
  getMovements: (stockItemId?: string, limit?: number) => {
    const params: any = {};
      if (stockItemId && stockItemId.trim() !== "") {
        params.stock_item_id = stockItemId;
      }
      if (stockItemId) params.stock_item_id = stockItemId;
      if (limit) params.limit = limit;
      return api.get('/api/v1/stock/movements', { params }).then(r => r.data).catch(err => {
        console.error("Erreur API getMovements:", err);
        throw err;
      });
  },
  createMovement: (data: any) => api.post('/api/v1/stock/movements', data).then(r => r.data),
  checkAvailability: (category: string, productName: string, quantity: number, farmId: string) => 
    api.get('/api/v1/stock/check', {
      params: { category, product_name: productName, quantity, farm_id: farmId } 
    }).then(r => r.data),
};

// ============ ENDPOINTS SUPPLIERS ============
export const suppliersAPI = {
  getAll: (farmId?: string, activeOnly: boolean = true) => {
    const params: any = { active_only: activeOnly };
    if (farmId) params.farm_id = farmId;
    return api.get('/api/v1/suppliers', { params }).then(r => r.data);
  },
  getById: (id: string) => api.get(`/api/v1/suppliers/${id}`).then(r => r.data),
  create: (data: any) => api.post('/api/v1/suppliers', data).then(r => r.data),
  update: (id: string, data: any) => api.put(`/api/v1/suppliers/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/api/v1/suppliers/${id}`).then(r => r.data),
};

// ============ ENDPOINTS DISEASES ============
export const diseasesAPI = {
  getAll: (params?: { skip?: number; limit?: number; search?: string }) => 
    api.get('/api/v1/diseases', { params }).then(r => r.data),  // PAS de slash final
  getById: (id: string) => api.get(`/api/v1/diseases/${id}`).then(r => r.data),
  create: (data: any) => api.post('/api/v1/diseases', data).then(r => r.data),
  update: (id: string, data: any) => api.put(`/api/v1/diseases/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/api/v1/diseases/${id}`).then(r => r.data),
};

// ============ ENDPOINTS VACCINATIONS ============
export const vaccinationsAPI = {
  getAll: (params?: { flock_id?: string }) => 
    api.get('/api/v1/vaccinations', { params }).then(r => r.data),  // PAS de slash final
  getById: (id: string) => api.get(`/api/v1/vaccinations/${id}`).then(r => r.data),
  create: (data: any) => api.post('/api/v1/vaccinations/', data).then(r => r.data),
  update: (id: string, data: any) => api.put(`/api/v1/vaccinations/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/api/v1/vaccinations/${id}`).then(r => r.data),
  getByFlock: (flockId: string) => 
    api.get('/api/v1/vaccinations', { params: { flock_id: flockId } }).then(r => r.data),
};

// ============ ENDPOINTS TREATMENTS ============
export const treatmentsAPI = {
  getAll: (params?: { flock_id?: string }) => 
    api.get('/api/v1/treatments', { params }).then(r => r.data),  // PAS de slash final
  getById: (id: string) => api.get(`/api/v1/treatments/${id}`).then(r => r.data),
  create: (data: any) => api.post('/api/v1/treatments/', data).then(r => r.data),
  update: (id: string, data: any) => api.put(`/api/v1/treatments/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/api/v1/treatments/${id}`).then(r => r.data),
  getByFlock: (flockId: string) => 
    api.get('/api/v1/treatments', { params: { flock_id: flockId } }).then(r => r.data),
};


// ============ ENDPOINTS TASKS ============
export const tasksAPI = {
  getAll: (params?: { status?: string; assigned_to?: string; limit?: number }) => 
    api.get('/api/v1/tasks', { params }).then(r => r.data),
  getMyTasks: (status?: string) => 
    api.get('/api/v1/tasks/my-tasks', { params: status ? { status } : {} }).then(r => r.data),
  getById: (id: string) => api.get(`/api/v1/tasks/${id}`).then(r => r.data),
  create: (data: any) => api.post('/api/v1/tasks', data).then(r => r.data),
  update: (id: string, data: any) => api.put(`/api/v1/tasks/${id}`, data).then(r => r.data),
  complete: (id: string) => api.patch(`/api/v1/tasks/${id}/complete`).then(r => r.data),
  delete: (id: string) => api.delete(`/api/v1/tasks/${id}`).then(r => r.data),
};
export default api;
