const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:10000';

const getToken = () => localStorage.getItem('token');

const apiService = {
  // Auth
  async register(data) {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async login(data) {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  // Remarks
  async createRemark(data) {
    const response = await fetch(`${API_URL}/api/remarks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async getRemarks() {
    const response = await fetch(`${API_URL}/api/remarks`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    return response.json();
  },

  async getRemarkById(id) {
    const response = await fetch(`${API_URL}/api/remarks/${id}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    return response.json();
  },

  // Notifications
  async getNotifications() {
    const response = await fetch(`${API_URL}/api/notifications`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    return response.json();
  },

  async markAsRead(id) {
    const response = await fetch(`${API_URL}/api/notifications/${id}/read`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    return response.json();
  },

  async markAllAsRead() {
    const response = await fetch(`${API_URL}/api/notifications/read-all`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    return response.json();
  }
};

export default apiService;
