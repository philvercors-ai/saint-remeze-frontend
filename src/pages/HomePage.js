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
  const [unreadCount, setUnreadCount] = useState(0);
  const [showChangelog, setShowChangelog] = useState(false);

  useEffect(() => {
    loadData();
    loadUnreadCount();
  }, []);

  const loadUnreadCount = async () => {
    try {
      const result = await apiService.getNotifications();
      const data = result.data || (Array.isArray(result) ? result : []);
      setUnreadCount(data.filter(n => !n.read).length);
    } catch (error) {
      console.error('Erreur notifications:', error);
    }
  };

  const loadData = async () => {
    try {
      const response = await apiService.getRemarks();
      console.log('📦 HomePage - Réponse API:', response);
      console.log('📦 Type:', Array.isArray(response) ? 'Array' : typeof response);
      
      // Le backend renvoie maintenant un tableau direct
      const data = Array.isArray(response) ? response : (response.data || response.remarks || []);
      
      console.log('📦 Données extraites:', data);
      console.log('📦 Nombre de remarques:', data.length);
      
      if (!Array.isArray(data)) {
        console.error('❌ Données non valides:', data);
        setRemarks([]);
        setLoading(false);
        return;
      }
      
      setRemarks(data);
      
      const statsData = {
        total: data.length,
        pending: data.filter(r => r.status === 'En attente').length,
        progress: data.filter(r => r.status === 'En cours').length,
        done: data.filter(r => r.status === 'Terminée').length
      };
      setStats(statsData);
      
      console.log('📊 Stats calculées:', statsData);
    } catch (error) {
      console.error('❌ Erreur chargement:', error);
      setRemarks([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    const map = {
      'En attente': 'status-en-attente',
      'Vue': 'status-vue',
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
            <button className="version-badge" onClick={() => setShowChangelog(true)}>v7.2.10</button>
          </div>
          
          <div className="header-actions">
            <button className="btn btn-icon" onClick={() => navigate('/notifications')} title="Notifications">
              🔔
              {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
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
          <div className="empty">Aucune remarque pour le moment</div>
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

      {showChangelog && (
        <div className="changelog-overlay" onClick={() => setShowChangelog(false)}>
          <div className="changelog-modal" onClick={e => e.stopPropagation()}>
            <h2>📋 Historique des versions</h2>

            <div className="cl-version">
              <div className="cl-version-header">
                <span className="cl-tag current">v7.2.10</span>
                <span className="cl-date">29 avril 2026</span>
              </div>
              <ul className="cl-list">
                <li>Bouton "✏️ Modifier" affiché directement sur la ligne du statut</li>
                <li>Visible uniquement pour l'auteur si statut "En attente" ou "Vue"</li>
                <li>Correction du chargement : index.html toujours à jour (no-cache)</li>
              </ul>
            </div>

            <div className="cl-version">
              <div className="cl-version-header">
                <span className="cl-tag">v7.2.9</span>
                <span className="cl-date">29 avril 2026</span>
              </div>
              <ul className="cl-list">
                <li>Correction de remarque : bouton "Modifier" sur la page de détail</li>
                <li>Disponible uniquement pour l'auteur si statut "En attente" ou "Vue"</li>
                <li>Champs modifiables : titre, catégorie, description</li>
              </ul>
            </div>

            <div className="cl-version">
              <div className="cl-version-header">
                <span className="cl-tag">v7.2.8</span>
                <span className="cl-date">18 avril 2026</span>
              </div>
              <ul className="cl-list">
                <li>Caméra : remplacement de l'input fichier par getUserMedia — plus de crash mémoire</li>
                <li>Admin : filtre temporel (Du / Au) sur les exports PDF et CSV</li>
                <li>PDF : plage de dates et nombre de signalements affichés en page 1</li>
              </ul>
            </div>

            <div className="cl-version">
              <div className="cl-version-header">
                <span className="cl-tag">v7.2.3</span>
                <span className="cl-date">13 mars 2026</span>
              </div>
              <ul className="cl-list">
                <li>Correction export PDF/CSV : numéro de téléphone maintenant affiché</li>
                <li>Fix populate MongoDB : ajout du champ <code>phone</code> dans les requêtes admin</li>
              </ul>
            </div>

            <div className="cl-version">
              <div className="cl-version-header">
                <span className="cl-tag">v7.2.2</span>
                <span className="cl-date">13 mars 2026</span>
              </div>
              <ul className="cl-list">
                <li>Correction variable Vercel : <code>REACT_APP_API_URL</code> pointait sur le backend DEV</li>
                <li>Fix <code>vercel.json</code> : conflit headers + routes résolu</li>
                <li>Correction vulnérabilité sécurité Multer (v2.1.0)</li>
              </ul>
            </div>

            <div className="cl-version">
              <div className="cl-version-header">
                <span className="cl-tag">v7.2.1</span>
                <span className="cl-date">Mars 2026</span>
              </div>
              <ul className="cl-list">
                <li>Ajout statut "Vue" pour les signalements consultés par l'admin</li>
                <li>Réinitialisation de mot de passe par email (token sécurisé)</li>
                <li>Support PWA (Progressive Web App) sur iOS et Android</li>
              </ul>
            </div>

            <div className="cl-version">
              <div className="cl-version-header">
                <span className="cl-tag">v7.2.0</span>
                <span className="cl-date">Février 2026</span>
              </div>
              <ul className="cl-list">
                <li>Mise en production PROD (Render + Vercel + MongoDB Atlas)</li>
                <li>Export PDF avec graphiques et export CSV complet</li>
                <li>Archivage automatique et suppression après 1 an</li>
                <li>Authentification JWT + rôles admin/user</li>
                <li>Upload photos via Cloudinary, géolocalisation GPS</li>
              </ul>
            </div>

            <div className="changelog-footer">
              <button className="btn-close-changelog" onClick={() => setShowChangelog(false)}>Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;
