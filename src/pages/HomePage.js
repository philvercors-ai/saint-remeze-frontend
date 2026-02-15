import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/apiService';
import './HomePage.css';

function HomePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [remarks, setRemarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, enAttente: 0, enCours: 0, terminees: 0 });
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    loadRemarks();
    loadUnreadNotifications();
    
    // Auto-refresh toutes les 30 secondes
    const interval = setInterval(() => {
      loadUnreadNotifications();
      loadRemarks();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadRemarks = async () => {
    try {
      const result = await apiService.getRemarks();
      if (result.success) {
        setRemarks(result.data);
        setStats({
          total: result.data.length,
          enAttente: result.data.filter(r => r.status === 'En attente').length,
          enCours: result.data.filter(r => r.status === 'En cours').length,
          terminees: result.data.filter(r => r.status === 'Terminée').length
        });
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadNotifications = async () => {
    try {
      const result = await apiService.getNotifications();
      if (result.success) {
        const unread = result.data.filter(n => !n.read).length;
        setUnreadNotifications(unread);
      }
    } catch (error) {
      console.error('Erreur notifications:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'En attente': return '#f59e0b';
      case 'En cours': return '#3b82f6';
      case 'Terminée': return '#10b981';
      case 'Rejetée': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className="home-page">
      <header className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <img src="/logo-saint-remeze.png" alt="Saint-Remèze" style={{ height: '40px' }} onError={(e) => e.target.style.display='none'} />
          <h1>Saint-Remèze</h1>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-secondary" 
            onClick={() => navigate('/notifications')}
            style={{ position: 'relative' }}
          >
            🔔 Notifications
            {unreadNotifications > 0 && (
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                background: '#ef4444',
                color: 'white',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold',
                border: '2px solid white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}>
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </span>
            )}
          </button>
          <button className="btn btn-secondary" onClick={logout}>
            Déconnexion
          </button>
        </div>
      </header>

      <div className="container">
        <div className="welcome">
          <h2>Bonjour {user?.name} 👋</h2>
          <p>Bienvenue sur votre espace citoyen</p>
          {unreadNotifications > 0 && (
            <div style={{
              background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
              border: '2px solid #3b82f6',
              borderRadius: '12px',
              padding: '16px 20px',
              marginTop: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '0 4px 6px rgba(59, 130, 246, 0.1)',
              animation: 'slideIn 0.3s ease-out'
            }}>
              <span style={{ fontSize: '24px', animation: 'pulse 2s infinite' }}>🔔</span>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#1e40af', fontWeight: '600', fontSize: '15px' }}>
                  Vous avez {unreadNotifications} nouvelle{unreadNotifications > 1 ? 's' : ''} notification{unreadNotifications > 1 ? 's' : ''}
                </div>
                <div style={{ color: '#3b82f6', fontSize: '13px', marginTop: '4px' }}>
                  Une remarque a peut-être été mise à jour
                </div>
              </div>
              <button 
                onClick={() => navigate('/notifications')}
                style={{
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '14px',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)'
                }}
                onMouseOver={(e) => e.target.style.background = '#2563eb'}
                onMouseOut={(e) => e.target.style.background = '#3b82f6'}
              >
                Voir
              </button>
            </div>
          )}
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: '#f59e0b' }}>{stats.enAttente}</div>
            <div className="stat-label">En attente</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: '#3b82f6' }}>{stats.enCours}</div>
            <div className="stat-label">En cours</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: '#10b981' }}>{stats.terminees}</div>
            <div className="stat-label">Terminées</div>
          </div>
        </div>

        <button className="btn btn-primary btn-add" onClick={() => navigate('/add-remark')}>
          ➕ Nouvelle remarque
        </button>

        {loading ? (
          <div className="loading">Chargement...</div>
        ) : remarks.length === 0 ? (
          <div className="empty">
            <p>📋 Aucune remarque pour le moment</p>
            <button className="btn btn-primary" onClick={() => navigate('/add-remark')}>
              Créer votre première remarque
            </button>
          </div>
        ) : (
          <div className="remarks-list">
            {remarks.map(remark => (
              <div key={remark._id} className="remark-card" onClick={() => navigate(`/remark/${remark._id}`)}>
                <div className="remark-header">
                  <h3>{remark.title}</h3>
                  <span className="status-badge" style={{ background: getStatusColor(remark.status), color: 'white' }}>
                    {remark.status}
                  </span>
                </div>
                <p className="remark-category">{remark.category}</p>
                <p className="remark-date">{new Date(remark.createdAt).toLocaleDateString('fr-FR')}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }
      `}</style>
    </div>
  );
}

export default HomePage;
