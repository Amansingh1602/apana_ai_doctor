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

  changePassword: async (data) => {
    return apiCall('/auth/change-password', {
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

// ==================== UPLOAD API ====================

export const uploadApi = {
  uploadReport: async (file) => {
    const formData = new FormData();
    formData.append('report', file);

    const token = getToken();
    const response = await fetch(`${API_URL}/files/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Upload failed');
    }
    return data;
  },

  getReports: async () => {
    return apiCall('/files/reports');
  },

  downloadReport: async (id, filename) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/files/reports/${id}/download`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Download failed');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  },

  downloadHistoryPDF: async () => {
    const token = getToken();
    const response = await fetch(`${API_URL}/files/history-pdf`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Download failed');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'health-history.pdf';
    document.body.appendChild(a);
    a.click();
    a.remove();
  },

  analyze: async (id) => {
    return apiCall(`/files/analyze/${id}`, { method: 'POST' });
  }
};

// ==================== NOTIFICATION API ====================

export const notificationApi = {
  getAll: async () => {
    return apiCall('/notifications');
  },

  markRead: async (id) => {
    return apiCall(`/notifications/${id}/read`, { method: 'PUT' });
  },

  markAllRead: async () => {
    return apiCall('/notifications/read-all', { method: 'PUT' });
  },

  delete: async (id) => {
    return apiCall(`/notifications/${id}`, { method: 'DELETE' });
  },

  deleteAll: async () => {
    return apiCall('/notifications', { method: 'DELETE' });
  },

  sendTestEmail: async () => {
    return apiCall('/notifications/test-email', { method: 'POST' });
  }
};

// ==================== SCHEDULED NOTIFICATION API ====================

export const scheduledNotificationApi = {
  getAll: async () => {
    return apiCall('/scheduled-notifications');
  },

  create: async (data) => {
    return apiCall('/scheduled-notifications', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  delete: async (id) => {
    return apiCall(`/scheduled-notifications/${id}`, {
      method: 'DELETE'
    });
  },

  toggle: async (id) => {
    return apiCall(`/scheduled-notifications/${id}/toggle`, {
      method: 'PUT'
    });
  }
};

// ==================== ANALYTICS API ====================

export const analyticsApi = {
  getDashboard: async () => {
    return apiCall('/analytics/dashboard');
  }
};

// ==================== REPORTS API ====================

export const reportsApi = {
  downloadStream: async (sessionId) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/reports/generate/${sessionId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) throw new Error("Failed to download report");
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Health_Report_${sessionId}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
};

// ==================== DOCTORS API ====================

export const doctorApi = {
  search: async (city, specialty) => {
    return apiCall(`/doctors/search?city=${encodeURIComponent(city)}&specialty=${encodeURIComponent(specialty)}`);
  }
};

// ==================== CHAT API ====================

export const chatApi = {
  send: async (message, history) => {
    return apiCall('/chat', {
      method: 'POST',
      body: JSON.stringify({ message, history })
    });
  }
};

export default {
  auth: authApi,
  consent: consentApi,
  symptoms: symptomsApi,
  upload: uploadApi,
  notifications: notificationApi,
  scheduledNotifications: scheduledNotificationApi,
  analytics: analyticsApi,
  reports: reportsApi,
  doctors: doctorApi,
  chat: chatApi
};
