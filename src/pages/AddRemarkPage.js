import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import './AddRemarkPage.css';

const categories = [
  '🤝 Aide à la personne',
  '🚗 Circulation / Stationnement',
  '🎭 Culture / Événements',
  '💧 Eau et Assainissement',
  '🏫 École et périscolaire',
  '💡 Éclairage public',
  '🌳 Espaces verts',
  '🚮 Propreté',
  '🚧 Travaux / Infrastructure',
  '📢 Autre'
];

function AddRemarkPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    description: '',
    image: null,
    location: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCamera, setShowCamera] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTakePhoto = () => {
    setShowCamera(true);
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(stream => {
        const video = document.getElementById('camera-video');
        if (video) {
          video.srcObject = stream;
          video.play();
        }
      })
      .catch(err => {
        alert('Impossible d\'accéder à la caméra');
        setShowCamera(false);
      });
  };

  const capturePhoto = () => {
    const video = document.getElementById('camera-video');
    const canvas = document.getElementById('photo-canvas');
    
    if (video && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      
      const imageData = canvas.toDataURL('image/jpeg');
      setFormData({ ...formData, image: imageData });
      
      const stream = video.srcObject;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      setShowCamera(false);
    }
  };

  const cancelCamera = () => {
    const video = document.getElementById('camera-video');
    if (video && video.srcObject) {
      video.srcObject.getTracks().forEach(track => track.stop());
    }
    setShowCamera(false);
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            location: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            }
          });
        },
        (error) => {
          alert('Impossible d\'obtenir la localisation');
        }
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await apiService.createRemark(formData);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.message || 'Erreur lors de la création');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-remark-page">
      <header className="page-header">
        <button onClick={() => navigate(-1)} className="btn-back">← Retour</button>
        <h1>Nouvelle remarque</h1>
      </header>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="remark-form">
        <div className="form-group">
          <label>Catégorie *</label>
          <select name="category" value={formData.category} onChange={handleChange} required disabled={loading}>
            <option value="">Sélectionnez une catégorie</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Titre *</label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} required placeholder="Résumé du problème" disabled={loading} />
        </div>

        <div className="form-group">
          <label>Description *</label>
          <textarea name="description" value={formData.description} onChange={handleChange} required rows="5" placeholder="Décrivez le problème en détail..." disabled={loading} />
        </div>

        <div className="form-group">
          <label>Photo (optionnel)</label>
          <div className="photo-buttons">
            <button type="button" onClick={handleTakePhoto} className="btn-secondary" disabled={loading}>
              📷 Prendre une photo
            </button>
            <span style={{ margin: '0 10px', color: '#64748b' }}>ou</span>
            <label className="btn-secondary" style={{ cursor: 'pointer', display: 'inline-block' }}>
              📁 Choisir un fichier
              <input type="file" accept="image/*" onChange={handleImageChange} disabled={loading} style={{ display: 'none' }} />
            </label>
          </div>
          
          {formData.image && (
            <div className="image-preview">
              <img src={formData.image} alt="Aperçu" />
              <button type="button" className="remove-image" onClick={() => setFormData({ ...formData, image: null })}>
                ✕ Supprimer
              </button>
            </div>
          )}
        </div>

        {showCamera && (
          <div className="camera-modal">
            <div className="camera-container">
              <video id="camera-video" autoPlay playsInline></video>
              <canvas id="photo-canvas" style={{ display: 'none' }}></canvas>
              <div className="camera-controls">
                <button type="button" onClick={capturePhoto} className="btn btn-primary">📸 Capturer</button>
                <button type="button" onClick={cancelCamera} className="btn-secondary">Annuler</button>
              </div>
            </div>
          </div>
        )}

        <div className="form-group">
          <label>Localisation (optionnel)</label>
          <button type="button" onClick={handleGetLocation} className="btn-secondary" disabled={loading}>
            📍 {formData.location ? 'Position enregistrée ✓' : 'Obtenir ma position'}
          </button>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Envoi...' : 'Envoyer la remarque'}
        </button>
      </form>
    </div>
  );
}

export default AddRemarkPage;
