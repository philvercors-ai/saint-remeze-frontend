import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/apiService';
import './HomePage.css';

function HomePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [remarks, setRemarks] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, progress: 0, done: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  // Dans HomePage.js, sécurisez loadData :

const loadData = async () => {
  try {
    const response = await apiService.getRemarks();
    // Sécurité : on s'assure d'avoir un tableau
    const data = Array.isArray(response) ? response : (response?.data || []);
    setRemarks(data);
    
    setStats({
      total: data.length,
      pending: data.filter(r => r?.status === 'En attente').length,
      progress: data.filter(r => r?.status === 'En cours').length,
      done: data.filter(r => r?.status === 'Terminée').length
    });
  } catch (error) {
    console.error('Erreur:', error);
    setRemarks([]);
  } finally { setLoading(false); }
};

  const getStatusClass = (status) => {
    const map = {
      'En attente': 'status-en-attente',
      'En cours': 'status-en-cours',
      'Terminée': 'status-terminee',
      'Rejetée': 'status-rejetee'
    };
    return map[status] || '';
  };

  return (
    <div className="home-page">
      <header className="header">
        <div className="header-content">
          <div className="header-logo">
            <img src="/logo-saint-remeze.png" alt="Logo" onError={(e) => e.target.style.display='none'} />
            <h1>Saint-Remèze</h1>
          </div>
          
          <div className="header-actions">
            <button className="btn btn-icon" onClick={() => navigate('/notifications')} title="Notifications">
              🔔
              {stats.pending > 0 && <span className="badge">{stats.pending}</span>}
            </button>
            
            <button className="btn btn-icon" onClick={() => logout()} title="Déconnexion">
              🚪
            </button>
          </div>
        </div>
      </header>

      <div className="container">
        <div className="welcome">
          <h2>Bonjour, {user?.name || 'Citoyen'} 👋</h2>
          <p>Plateforme citoyenne</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total</div>
          </div>
          <div className="stat-card">
            <div className="stat-value pending">{stats.pending}</div>
            <div className="stat-label">En attente</div>
          </div>
          <div className="stat-card">
            <div className="stat-value progress">{stats.progress}</div>
            <div className="stat-label">En cours</div>
          </div>
          <div className="stat-card">
            <div className="stat-value done">{stats.done}</div>
            <div className="stat-label">Terminées</div>
          </div>
        </div>

        {loading ? (
          <div className="loading">Chargement...</div>
        ) : remarks.length === 0 ? (
          <div className="empty">Aucune remarque</div>
        ) : (
          <div className="remarks-list">
            {remarks.map(remark => (
              <div key={remark._id} className="remark-card" onClick={() => navigate(`/remark/${remark._id}`)}>
                <div className="remark-header">
                  <h3>{remark.title}</h3>
                  <span className={`status-badge ${getStatusClass(remark.status)}`}>
                    {remark.status}
                  </span>
                </div>
                <div className="remark-category">{remark.category}</div>
                <div className="remark-date">{new Date(remark.createdAt).toLocaleDateString('fr-FR')}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="btn-add-wrapper">
        <button className="btn-add" onClick={() => navigate('/add-remark')}>
          ➕ Nouvelle remarque
        </button>
      </div>
    </div>
  );
}

export default HomePage;
