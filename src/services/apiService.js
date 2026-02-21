// src/services/apiService.js

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:10000';

console.log('🌐 API URL:', API_URL);

const apiService = {

  // ============================
  // AUTH
  // ============================

  async register(userData) {
    try {
      console.log('📝 Register - Envoi vers:', `${API_URL}/api/auth/register`);
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await response.json();
      console.log('📝 Register - Réponse:', data);
      return data;
    } catch (error) {
      console.error('❌ Register error:', error);
      return { success: false, message: 'Erreur de connexion au serveur' };
    }
  },

  async login(email, password) {
    try {
      console.log('🔑 Login - Envoi vers:', `${API_URL}/api/auth/login`);
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      console.log('🔑 Login - Réponse:', data);
      return data;
    } catch (error) {
      console.error('❌ Login error:', error);
      return { success: false, message: 'Erreur de connexion au serveur' };
    }
  },

  // ============================
  // REMARKS
  // ============================

  async getRemarks() {
    try {
      const token = localStorage.getItem('token');
      console.log('📋 getRemarks - Token:', token ? `${token.substring(0, 20)}...` : '❌ ABSENT');
      
      if (!token) {
        console.error('❌ getRemarks - Pas de token !');
        return { success: false, data: [] };
      }

      const response = await fetch(`${API_URL}/api/remarks`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📋 getRemarks - Status:', response.status);

      if (response.status === 401) {
        console.error('❌ Token invalide ou expiré');
        return { success: false, data: [] };
      }

      return await response.json();
    } catch (error) {
      console.error('❌ getRemarks error:', error);
      return { success: false, data: [] };
    }
  },

 // Dans apiService.js, modifiez createRemark :

async createRemark(remarkData) {
  try {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };
    
    // Si ce n'est PAS un FormData, on ajoute le Content-Type JSON
    const isFormData = remarkData instanceof FormData;
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_URL}/api/remarks`, {
      method: 'POST',
      headers: headers,
      // On ne stringify que si ce n'est pas un FormData
      body: isFormData ? remarkData : JSON.stringify(remarkData)
    });

    if (response.status === 401) return { success: false, message: 'Session expirée' };
    return await response.json();
  } catch (error) {
    return { success: false, message: 'Erreur de connexion' };
  }
},

  async getRemark(id) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return { success: false, message: 'Non authentifié' };
      }

      const response = await fetch(`${API_URL}/api/remarks/${id}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        return { success: false, message: 'Session expirée' };
      }

      return await response.json();
    } catch (error) {
      console.error('❌ getRemark error:', error);
      return { success: false, message: 'Erreur de connexion au serveur' };
    }
  },

  // ============================
  // NOTIFICATIONS
  // ============================

  async getNotifications() {
    try {
      const token = localStorage.getItem('token');
      console.log('🔔 getNotifications - Token:', token ? 'Présent' : '❌ ABSENT');

      if (!token) {
        return { success: false, data: [] };
      }

      const response = await fetch(`${API_URL}/api/notifications`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('🔔 getNotifications - Status:', response.status);

      if (response.status === 401) {
        return { success: false, data: [] };
      }

      return await response.json();
    } catch (error) {
      console.error('❌ getNotifications error:', error);
      return { success: false, data: [] };
    }
  },

  async markNotificationRead(id) {
    try {
      const token = localStorage.getItem('token');
      if (!token) return { success: false };

      const response = await fetch(`${API_URL}/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        return { success: false };
      }

      return await response.json();
    } catch (error) {
      console.error('❌ markNotificationRead error:', error);
      return { success: false };
    }
  },

  async markAllNotificationsRead() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return { success: false };

      const response = await fetch(`${API_URL}/api/notifications/read-all`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        return { success: false };
      }

      return await response.json();
    } catch (error) {
      console.error('❌ markAllRead error:', error);
      return { success: false };
    }
  },

async getRemarkById(id) {
    return this.getRemark(id);
  }


};

export default apiService;
