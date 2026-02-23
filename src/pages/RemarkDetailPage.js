import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './RemarkDetailPage.css';

const API_URL = process.env.REACT_APP_API_URL || 'https://saint-remeze-backend.onrender.com';

function RemarkDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [remark, setRemark] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRemarkDetail();
  }, [id]);

  const fetchRemarkDetail = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/remarks/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Erreur chargement');
      const data = await response.json();
      const remarkData = data.data || data;
      setRemark(remarkData);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const getImageUrl = (remarkData) => {
    if (!remarkData) return null;
    const fixUrl = (url) => {
      if (!url) return null;
      let fixed = url.replace(/https\/\//g, 'https://');
      fixed = fixed.replace(/http\/\//g, 'http://');
      return fixed;
    };
    if (remarkData.photoUrl) return fixUrl(remarkData.photoUrl);
    if (remarkData.image) return fixUrl(remarkData.image);
    return null;
  };

  const getStatusConfig = (status) => {
    const configs = {
      'Terminée':  { color: '#059669', bg: '#d1fae5', label: 'Terminée' },
      'En cours':  { color: '#2563eb', bg: '#dbeafe', label: 'En cours' },
      'Rejetée':   { color: '#dc2626', bg: '#fee2e2', label: 'Rejetée' },
      'En attente':{ color: '#d97706', bg: '#fef3c7', label: 'En attente' },
    };
    return configs[status] || configs['En attente'];
  };

  if (loading) {
    return (
      <div className="rdp-page">
        <div className="rdp-loading">
          <div className="rdp-spinner"></div>
          <p>Chargement…</p>
        </div>
      </div>
    );
  }

  if (error || !remark) {
    return (
      <div className="rdp-page">
        <div className="rdp-error-box">
          <div className="rdp-error-icon">!</div>
          <h2>Remarque introuvable</h2>
          <p>{error || "Cette remarque n'existe pas ou a été supprimée."}</p>
          <button className="rdp-btn-back" onClick={() => navigate('/')}>
            ← Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  const imageUrl = getImageUrl(remark);
  const statusConfig = getStatusConfig(remark.status);

  return (
    <div className="rdp-page">
      <header className="rdp-header">
        <button className="rdp-back-btn" onClick={() => navigate('/')}>
          <span>←</span>
          <span>Retour</span>
        </button>
        <span className="rdp-header-label">Remarque citoyenne</span>
        <div></div>
      </header>

      <main className="rdp-main">
        {imageUrl ? (
          <div className="rdp-image-wrapper">
            <img
              src={imageUrl}
              alt={remark.title}
              className="rdp-hero-image"
              onError={(e) => { e.target.parentElement.style.display = 'none'; }}
            />
          </div>
        ) : (
          <div className="rdp-no-image">
            <span>📷</span>
            <p>Aucune photo jointe</p>
          </div>
        )}

        <div className="rdp-card">
          <div className="rdp-meta">
            <span className="rdp-status" style={{ color: statusConfig.color, background: statusConfig.bg }}>
              <span className="rdp-status-dot" style={{ background: statusConfig.color }}></span>
              {statusConfig.label}
            </span>
            <span className="rdp-date">
              {new Date(remark.createdAt).toLocaleDateString('fr-FR', {
                day: 'numeric', month: 'long', year: 'numeric'
              })}
            </span>
          </div>

          <h1 className="rdp-title">{remark.title}</h1>

          <div className="rdp-category">
            <span>📁</span>
            {remark.category}
          </div>

          <div className="rdp-divider"></div>

          <section className="rdp-section">
            <h3 className="rdp-section-title">Description</h3>
            <p className="rdp-description">{remark.description}</p>
          </section>

          {remark.location?.coordinates && (
            <>
              <div className="rdp-divider"></div>
              <section className="rdp-section">
                <h3 className="rdp-section-title">Localisation</h3>
                <div className="rdp-coords">
                  <div className="rdp-coord-item">
                    <span className="rdp-coord-label">Latitude</span>
                    <span className="rdp-coord-value">{remark.location.coordinates[1].toFixed(6)}</span>
                  </div>
                  <div className="rdp-coord-item">
                    <span className="rdp-coord-label">Longitude</span>
                    <span className="rdp-coord-value">{remark.location.coordinates[0].toFixed(6)}</span>
                  </div>
                </div>
                <a
                  href={`https://www.google.com/maps?q=${remark.location.coordinates[1]},${remark.location.coordinates[0]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rdp-map-btn"
                >
                  🗺️ Voir sur Google Maps
                </a>
              </section>
            </>
          )}

          {remark.assignedTo && (
            <>
              <div className="rdp-divider"></div>
              <section className="rdp-section">
                <h3 className="rdp-section-title">Assigné à</h3>
                <div className="rdp-assigned">
                  <div className="rdp-avatar">{remark.assignedTo[0]?.toUpperCase()}</div>
                  <span>{remark.assignedTo}</span>
                </div>
              </section>
            </>
          )}

          {remark.adminNotes && (
            <>
              <div className="rdp-divider"></div>
              <section className="rdp-section">
                <h3 className="rdp-section-title">Note de l'administration</h3>
                <div className="rdp-admin-note">
                  <p>{remark.adminNotes}</p>
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default RemarkDetailPage;
