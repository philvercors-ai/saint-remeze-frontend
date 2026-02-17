// src/services/apiService.js

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:10000';

console.log('🌐 API URL:', API_URL);

const apiService = {

  // ============================
  // AUTH
  // ============================

  async register(userData) {
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await response.json();
      console.log('Register response:', data);
      return data;
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, message: 'Erreur de connexion au serveur' };
    }
  },

  async login(email, password) {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Erreur de connexion au serveur' };
    }
  },

  // ============================
  // REMARKS
  // ============================

  async getRemarks() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/remarks`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return await response.json();
    } catch (error) {
      console.error('getRemarks error:', error);
      return { success: false, data: [] };
    }
  },

  async createRemark(remarkData) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/remarks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(remarkData)
      });
      return await response.json();
    } catch (error) {
      console.error('createRemark error:', error);
      return { success: false, message: 'Erreur de connexion au serveur' };
    }
  },

  async getRemark(id) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/remarks/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return await response.json();
    } catch (error) {
      console.error('getRemark error:', error);
      return { success: false, message: 'Erreur de connexion au serveur' };
    }
  },

  // ============================
  // NOTIFICATIONS
  // ============================

  async getNotifications() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return await response.json();
    } catch (error) {
      console.error('getNotifications error:', error);
      return { success: false, data: [] };
    }
  },

  async markNotificationRead(id) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return await response.json();
    } catch (error) {
      console.error('markNotificationRead error:', error);
      return { success: false };
    }
  },

  async markAllNotificationsRead() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/notifications/read-all`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return await response.json();
    } catch (error) {
      console.error('markAllRead error:', error);
      return { success: false };
    }
  }
};

export default apiService;
