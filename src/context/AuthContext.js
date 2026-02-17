import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Charger l'utilisateur depuis localStorage au démarrage
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    console.log('🔐 AuthContext init - Token:', token ? 'Présent' : 'Absent');
    console.log('👤 AuthContext init - User:', storedUser ? 'Présent' : 'Absent');
    
    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        console.log('✅ Utilisateur restauré:', parsedUser.email);
      } catch (error) {
        console.error('❌ Erreur parsing user:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    setLoading(false);
  }, []);

  const login = (token, userData) => {
    console.log('🔑 Login - Stockage token et user');
    console.log('Token:', token ? 'Présent' : 'Absent');
    console.log('User:', userData);
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    
    // Vérification immédiate
    const savedToken = localStorage.getItem('token');
    console.log('✅ Token sauvegardé:', savedToken ? 'OK' : '❌ ÉCHEC');
  };

  const logout = () => {
    console.log('👋 Logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
