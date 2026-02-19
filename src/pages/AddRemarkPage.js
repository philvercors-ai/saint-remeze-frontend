import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import './AddRemarkPage.css';

const categories = [
  '🤝 Aide à la personne', '🚗 Circulation / Stationnement',
  '🎭 Culture / Événements', '💧 Eau et Assainissement',
  '🏫 École et périscolaire', '💡 Éclairage public',
  '🌳 Espaces verts', '🚮 Propreté',
  '🚧 Travaux / Infrastructure', '📢 Autre'
];

function AddRemarkPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    category: '', title: '', description: '', image: null, location: null
  });
  const [loading, setLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setFormData({ ...formData, location: { lat: pos.coords.latitude, lng: pos.coords.longitude } }),
        () => alert('Géolocalisation refusée')
      );
    }
  };

  return (
    <div className="add-remark-page">
      <header className="page-header">
        <button onClick={() => navigate(-1)} className="btn-back">Retour</button>
        <h1>Nouvelle Remarque</h1>
      </header>

      <form onSubmit={(e) => { e.preventDefault(); /* submit logic */ }} className="remark-form">
        
        {/* Section 1 : Informations */}
        <div className="form-card">
          <div className="form-group">
            <label>Catégorie</label>
            <select name="category" required onChange={(e) => setFormData({...formData, category: e.target.value})}>
              <option value="">Que souhaitez-vous signaler ?</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          
          <div className="form-group" style={{marginTop: '15px'}}>
            <label>Titre</label>
            <input type="text" placeholder="Ex: Nid de poule rue de la Gare" required />
          </div>
        </div>

        {/* Section 2 : Media */}
        <div className="form-card">
          <label className="form-group"><label>Médias & Lieu</label></label>
          
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
            <button type="button" onClick={() => {/* camera logic */}} className="btn-modern btn-secondary">
              📸 Photo
            </button>
            <button type="button" onClick={handleGetLocation} className={formData.location ? "btn-modern btn-success" : "btn-modern btn-secondary"}>
              📍 {formData.location ? "Localisé" : "Position"}
            </button>
          </div>

          {formData.image && (
            <div className="image-preview">
              <img src={formData.image} alt="Preview" style={{width: '100%'}} />
              <button className="remove-image" onClick={() => setFormData({...formData, image: null})}>✕</button>
            </div>
          )}
        </div>

        {/* Section 3 : Détails */}
        <div className="form-card">
          <div className="form-group">
            <label>Description détaillée</label>
            <textarea rows="4" placeholder="Donnez-nous plus de précisions..."></textarea>
          </div>
        </div>

        <button type="submit" className="btn-modern btn-primary" disabled={loading} style={{marginTop: '10px'}}>
          {loading ? 'Envoi en cours...' : 'Envoyer le signalement'}
        </button>
      </form>
    </div>
  );
}

export default AddRemarkPage;