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
    console.log('📋 Chargement remarque:', id);
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
      console.log('✅ Remarque chargée:', data.data);
      setRemark(data.data);
      setLoading(false);
    } catch (err) {
      console.error('❌ Erreur:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  // FONCTION DE CORRECTION URL INTÉGRÉE
  const getImageUrl = (remarkData) => {
    console.log('🔍 [INLINE] getImageUrl appelé');
    console.log('🔍 [INLINE] remarkData:', remarkData);
    
    if (!remarkData) {
      console.log('❌ [INLINE] Pas de données');
      return null;
    }

    // Fonction de correction
    const fixUrl = (url) => {
      if (!url) return null;
      
      console.log('🔧 [INLINE] Avant correction:', url);
      
      // CORRECTION : https// → https://
      let fixed = url;
      if (fixed.includes('https//')) {
        fixed = fixed.replace(/https\/\//g, 'https://');
        console.log('✅ [INLINE] CORRIGÉ https//:', fixed);
      }
      if (fixed.includes('http//')) {
        fixed = fixed.replace(/http\/\//g, 'http://');
        console.log('✅ [INLINE] CORRIGÉ http//:', fixed);
      }
      
      console.log('🔧 [INLINE] Après correction:', fixed);
      return fixed;
    };

    // Vérifier photoUrl
    if (remarkData.photoUrl) {
      console.log('📸 [INLINE] photoUrl trouvé:', remarkData.photoUrl);
      const fixed = fixUrl(remarkData.photoUrl);
      console.log('📸 [INLINE] photoUrl final:', fixed);
      return fixed;
    }

    // Vérifier image
    if (remarkData.image) {
      console.log('📸 [INLINE] image trouvé:', remarkData.image);
      const fixed = fixUrl(remarkData.image);
      console.log('📸 [INLINE] image final:', fixed);
      return fixed;
    }

    console.log('❌ [INLINE] Aucune photo');
    return null;
  };

  if (loading) {
    return (
      <div className="detail-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  if (error || !remark) {
    return (
      <div className="detail-page">
        <div className="error-container">
          <h2>❌ Erreur</h2>
          <p>{error || 'Remarque introuvable'}</p>
          <button className="btn-primary" onClick={() => navigate('/my-remarks')}>
            Retour
          </button>
        </div>
      </div>
    );
  }

  const imageUrl = getImageUrl(remark);
  console.log('🖼️ [INLINE] URL finale:', imageUrl);

  return (
    <div className="detail-page">
      <div className="detail-header">
        <button className="btn-back" onClick={() => navigate('/my-remarks')}>
          ← Retour
        </button>
        <h1>Détails de la remarque</h1>
      </div>

      <div className="detail-content">
        <div className="detail-card">
          <div className="detail-status">
            <span 
              className="status-badge" 
              style={{ 
                backgroundColor: remark.status === 'Terminée' ? '#10b981' : 
                                remark.status === 'En cours' ? '#3b82f6' : 
                                remark.status === 'Rejetée' ? '#ef4444' : '#f59e0b'
              }}
            >
              {remark.status === 'Terminée' ? '✅' : 
               remark.status === 'En cours' ? '🔄' : 
               remark.status === 'Rejetée' ? '❌' : '⏳'} {remark.status}
            </span>
            <span className="detail-date">
              {new Date(remark.createdAt).toLocaleDateString('fr-FR')}
            </span>
          </div>

          <div className="detail-section">
            <h2>{remark.title}</h2>
            <p className="detail-category">📁 {remark.category}</p>
          </div>

          {imageUrl && (
            <div className="detail-section">
              <h3>📸 Photo</h3>
              <div className="image-container">
                <img 
                  src={imageUrl} 
                  alt={remark.title}
                  onError={(e) => {
                    console.error('❌ [INLINE] Erreur chargement image:', imageUrl);
                    e.target.style.display = 'none';
                    const errorDiv = document.createElement('div');
                    errorDiv.style.padding = '1rem';
                    errorDiv.style.background = '#fef3c7';
                    errorDiv.style.borderRadius = '8px';
                    errorDiv.style.color = '#92400e';
                    errorDiv.innerHTML = `<p>⚠️ Photo non disponible</p><small style="font-size:0.875rem;display:block;margin-top:0.5rem">URL: ${imageUrl}</small>`;
                    e.target.parentElement.appendChild(errorDiv);
                  }}
                  onLoad={() => {
                    console.log('✅ [INLINE] Image chargée avec succès:', imageUrl);
                  }}
                  crossOrigin="anonymous"
                  style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }}
                />
              </div>
            </div>
          )}

          <div className="detail-section">
            <h3>📝 Description</h3>
            <p className="detail-description">{remark.description}</p>
          </div>

          {remark.location?.coordinates && (
            <div className="detail-section">
              <h3>📍 Localisation</h3>
              <div className="location-info">
                <p>
                  Latitude: {remark.location.coordinates[1].toFixed(6)}<br/>
                  Longitude: {remark.location.coordinates[0].toFixed(6)}
                </p>
                <a 
                  href={`https://www.google.com/maps?q=${remark.location.coordinates[1]},${remark.location.coordinates[0]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-map"
                >
                  🗺️ Voir sur Google Maps
                </a>
              </div>
            </div>
          )}

          {remark.assignedTo && (
            <div className="detail-section">
              <h3>👤 Assigné à</h3>
              <p>{remark.assignedTo}</p>
            </div>
          )}

          {remark.adminNotes && (
            <div className="detail-section admin-notes">
              <h3>💬 Notes de l'administration</h3>
              <p>{remark.adminNotes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RemarkDetailPage;
