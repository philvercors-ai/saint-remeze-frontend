import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/apiService';
import './RemarkDetailPage.css';

const CATEGORIES = [
  'Aide à la personne',
  'Circulation / Stationnement',
  'Culture / Événements',
  'Eau et Assainissement',
  'École et périscolaire',
  'Éclairage public',
  'Espaces verts',
  'Propreté',
  'Travaux / Infrastructure',
  'Voirie',
  'Autre'
];

const API_URL = process.env.REACT_APP_API_URL || 'https://saint-remeze-backend.onrender.com';

function RemarkDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [remark, setRemark] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', description: '', category: '' });
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');

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
      setRemark(data.data || data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    const map = {
      'Terminée':   '#059669',
      'En cours':   '#2563eb',
      'Rejetée':    '#dc2626',
      'Vue':        '#7c3aed',
      'En attente': '#d97706',
    };
    return { color: map[status] || '#d97706' };
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric'
    });

  const remarkUserId = remark?.user?._id ?? remark?.user?.id ?? remark?.userId;
  const currentUserId = user?._id ?? user?.id;
  const canEdit = !!(
    remarkUserId && currentUserId &&
    remarkUserId.toString() === currentUserId.toString() &&
    ['En attente', 'Vue'].includes(remark?.status)
  );

  const handleEditOpen = () => {
    setEditForm({
      title: remark.title,
      description: remark.description || '',
      category: remark.category
    });
    setEditError('');
    setEditMode(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setEditError('');
    const result = await apiService.editRemark(id, editForm);
    if (result.success) {
      setRemark(result.remark);
      setEditMode(false);
    } else {
      setEditError(result.message || 'Erreur lors de la sauvegarde');
    }
    setSaving(false);
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

  return (
    <div className="rdp-page">
      {editMode && (
        <div className="rdp-edit-overlay" onClick={() => !saving && setEditMode(false)}>
          <div className="rdp-edit-modal" onClick={e => e.stopPropagation()}>
            <div className="rdp-edit-modal-header">
              <h2>Modifier la remarque</h2>
              <button className="rdp-edit-close" onClick={() => setEditMode(false)} disabled={saving}>×</button>
            </div>
            {editError && <div className="rdp-edit-error">{editError}</div>}
            <form onSubmit={handleEditSubmit} className="rdp-edit-form">
              <div className="rdp-edit-field">
                <label>Catégorie</label>
                <select name="category" value={editForm.category} onChange={handleEditChange} required disabled={saving}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="rdp-edit-field">
                <label>Titre</label>
                <input
                  type="text"
                  name="title"
                  value={editForm.title}
                  onChange={handleEditChange}
                  required
                  maxLength={100}
                  disabled={saving}
                />
              </div>
              <div className="rdp-edit-field">
                <label>Description</label>
                <textarea
                  name="description"
                  value={editForm.description}
                  onChange={handleEditChange}
                  rows={5}
                  disabled={saving}
                />
              </div>
              <div className="rdp-edit-actions">
                <button type="button" className="rdp-edit-cancel" onClick={() => setEditMode(false)} disabled={saving}>
                  Annuler
                </button>
                <button type="submit" className="rdp-edit-save" disabled={saving}>
                  {saving ? 'Enregistrement…' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <header className="rdp-header">
        <button className="rdp-back-btn" onClick={() => navigate('/')}>
          ← Retour
        </button>
        <span className="rdp-header-label">Mairie de Saint-Remèze</span>
        <div></div>
      </header>

      <main className="rdp-main">
        <div className="rdp-document">

          {/* Bandeau supérieur */}
          <div className="rdp-doc-topbar">
            Mairie de Saint-Remèze — Rapport de signalement
          </div>

          <div className="rdp-doc-body">

            {/* Titre */}
            <h1 className="rdp-title">{remark.title}</h1>

            {/* Statut */}
            <div className="rdp-status-line">
              <span className="rdp-status-label">STATUT :</span>
              <span className="rdp-status-value" style={getStatusStyle(remark.status)}>
                {remark.status?.toUpperCase()}
              </span>
              {canEdit && (
                <button className="rdp-edit-inline-btn" onClick={handleEditOpen}>
                  ✏️ Modifier
                </button>
              )}
            </div>

            {/* Déclarant / Catégorie */}
            <div className="rdp-info-grid">
              <div className="rdp-info-cell">
                <div className="rdp-info-key">Déclarant :</div>
                <div className="rdp-info-val">{remark.userName || remark.user?.name || 'Inconnu'}</div>
                <div className="rdp-info-sub">
                  {remark.userEmail || remark.user?.email
                    ? `Email : ${remark.userEmail || remark.user?.email}`
                    : ''}
                  {(remark.userPhone || remark.user?.phone)
                    ? ` | Tél : ${remark.userPhone || remark.user?.phone}`
                    : ''}
                </div>
                <div className="rdp-info-sub">
                  Signalé le {formatDate(remark.createdAt)}
                </div>
              </div>
              <div className="rdp-info-cell">
                <div className="rdp-info-key">Catégorie :</div>
                <div className="rdp-info-val">{remark.category}</div>
              </div>
            </div>

            {/* Description */}
            <div className="rdp-desc-block">
              <div className="rdp-desc-title">Description du déclarant :</div>
              <p className="rdp-desc-text">{remark.description}</p>
            </div>

            <div className="rdp-divider"></div>

            {/* Assigné / Notes admin */}
            <div className="rdp-admin-box">
              <div className="rdp-admin-row">
                <span className="rdp-admin-key">Assigné à :</span>
                <span className="rdp-admin-val">{remark.assignedTo || 'Non assigné'}</span>
              </div>
              <div className="rdp-admin-row">
                <span className="rdp-admin-key">Notes admin :</span>
                <span className="rdp-admin-val">{remark.adminNotes || 'Aucune note enregistrée.'}</span>
              </div>
            </div>

            {/* Localisation */}
            {remark.location?.coordinates && (
              <>
                <div className="rdp-divider"></div>
                <div className="rdp-location-block">
                  <div className="rdp-location-title">Localisation :</div>
                  <div className="rdp-coords">
                    <span>
                      <span className="rdp-coord-label">Latitude :</span>
                      {remark.location.coordinates[1].toFixed(6)}
                    </span>
                    <span>
                      <span className="rdp-coord-label">Longitude :</span>
                      {remark.location.coordinates[0].toFixed(6)}
                    </span>
                  </div>
                  <a
                    href={`https://www.google.com/maps?q=${remark.location.coordinates[1]},${remark.location.coordinates[0]}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rdp-map-btn"
                  >
                    🗺️ Voir sur Google Maps
                  </a>
                </div>
              </>
            )}

            {/* Photos */}
            {(() => {
              const allPhotos = remark.photos?.length > 0
                ? remark.photos.map(p => p.url)
                : (remark.photoUrl ? [remark.photoUrl] : []);
              if (allPhotos.length === 0) return null;
              return (
                <>
                  <div className="rdp-divider"></div>
                  <div className="rdp-photo-block">
                    <div className="rdp-photo-title">
                      Photo{allPhotos.length > 1 ? 's jointes' : ' jointe'} :
                    </div>
                    <div className="rdp-photos-grid">
                      {allPhotos.map((url, i) => (
                        <img
                          key={i}
                          src={url.replace(/https\/\//g, 'https://').replace(/http\/\//g, 'http://')}
                          alt={`${remark.title} - photo ${i + 1}`}
                          className={allPhotos.length === 1 ? 'rdp-photo-img' : 'rdp-photo-thumb'}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ))}
                    </div>
                  </div>
                </>
              );
            })()}

          </div>
        </div>
      </main>
    </div>
  );
}

export default RemarkDetailPage;
