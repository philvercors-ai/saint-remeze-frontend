import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import './RemarkDetailPage.css';

function RemarkDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [remark, setRemark] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRemark();
  }, [id]);

  const loadRemark = async () => {
    try {
      const result = await apiService.getRemarkById(id);
      if (result.success) {
        setRemark(result.data);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
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

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  if (!remark) {
    return <div className="loading">Remarque non trouvée</div>;
  }

  return (
    <div className="detail-page">
      <header className="page-header">
        <button onClick={() => navigate(-1)} className="btn-back">← Retour</button>
        <h1>Détail de la remarque</h1>
      </header>

      <div className="detail-container">
        <div className="detail-card">
          <div className="detail-header">
            <h2>{remark.title}</h2>
            <span className="status-badge" style={{ background: getStatusColor(remark.status) }}>
              {remark.status}
            </span>
          </div>

          <div className="detail-info">
            <p><strong>Catégorie:</strong> {remark.category}</p>
            <p><strong>Date:</strong> {new Date(remark.createdAt).toLocaleDateString('fr-FR')}</p>
            {remark.priority && <p><strong>Priorité:</strong> {remark.priority}</p>}
            {remark.assignedTo && <p><strong>Assigné à:</strong> {remark.assignedTo}</p>}
          </div>

          <div className="detail-section">
            <h3>Description</h3>
            <p>{remark.description}</p>
          </div>

          {remark.image && (
            <div className="detail-section">
              <h3>Photo</h3>
              <img src={remark.image} alt="Remarque" className="detail-image" />
            </div>
          )}

          {remark.location && (
            <div className="detail-section">
              <h3>Localisation</h3>
              <a
                href={`https://www.google.com/maps?q=${remark.location.latitude},${remark.location.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                📍 Voir sur la carte
              </a>
            </div>
          )}

          {remark.adminNotes && (
            <div className="detail-section admin-notes">
              <h3>Notes de l'administration</h3>
              <p>{remark.adminNotes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RemarkDetailPage;
