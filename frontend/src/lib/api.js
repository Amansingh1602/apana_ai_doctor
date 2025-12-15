// API Configuration for MERN Stack Backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper to get auth token
const getToken = () => localStorage.getItem('apna-doctor-token');

// Helper for API calls with auth
const apiCall = async (endpoint, options = {}) => {
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.errors?.[0]?.msg || 'Something went wrong');
  }

  return data;
};

// ==================== AUTH API ====================

export const authApi = {
  register: async (data) => {
    const response = await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (response.token) {
      localStorage.setItem('apna-doctor-token', response.token);
    }
    return response;
  },

  login: async (data) => {
    const response = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (response.token) {
      localStorage.setItem('apna-doctor-token', response.token);
    }
    return response;
  },

  logout: () => {
    localStorage.removeItem('apna-doctor-token');
  },

  getMe: async () => {
    return apiCall('/auth/me');
  },

  updateProfile: async (data) => {
    return apiCall('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  isAuthenticated: () => {
    return !!getToken();
  },
};

// ==================== CONSENT API ====================

export const consentApi = {
  check: async () => {
    return apiCall('/consent/check');
  },

  record: async (consentGiven) => {
    return apiCall('/consent', {
      method: 'POST',
      body: JSON.stringify({ consentGiven }),
    });
  },
};

// ==================== SYMPTOMS API ====================

export const symptomsApi = {
  analyze: async (data) => {
    return apiCall('/symptoms/analyze', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getHistory: async (page = 1, limit = 10) => {
    return apiCall(`/symptoms/history?page=${page}&limit=${limit}`);
  },

  getSession: async (id) => {
    return apiCall(`/symptoms/${id}`);
  },

  deleteSession: async (id) => {
    return apiCall(`/symptoms/${id}`, {
      method: 'DELETE',
    });
  },
};

export default {
  auth: authApi,
  consent: consentApi,
  symptoms: symptomsApi,
};
