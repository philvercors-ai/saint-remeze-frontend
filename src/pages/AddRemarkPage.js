import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import './AddRemarkPage.css';

const categories = [
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

function AddRemarkPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    description: '',
    photo: null,
    photoPreview: null,
    location: null
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [gettingLocation, setGettingLocation] = useState(false);

  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          let width = img.width;
          let height = img.height;
          const maxSize = 1200;
          
          if (width > maxSize || height > maxSize) {
            if (width > height) {
              height = (maxSize / width) * height;
              width = maxSize;
            } else {
              width = (maxSize / height) * width;
              height = maxSize;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now()
                });
                const originalSize = (file.size / 1024).toFixed(0);
                const compressedSize = (blob.size / 1024).toFixed(0);
                console.log('Image compressée: ' + originalSize + 'KB -> ' + compressedSize + 'KB');
                resolve(compressedFile);
              } else {
                reject(new Error('Compression échouée'));
              }
            },
            'image/jpeg',
            0.7
          );
        };
        img.onerror = () => reject(new Error('Chargement image échoué'));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error('Lecture fichier échouée'));
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoCapture = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('Photo trop volumineuse (max 10MB)');
      return;
    }

    try {
      const compressedFile = await compressImage(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          photo: compressedFile,
          photoPreview: reader.result
        });
        setError('');
      };
      reader.readAsDataURL(compressedFile);
    } catch (err) {
      console.error('Erreur compression:', err);
      setError('Erreur traitement photo');
    }
  };

  const removePhoto = () => {
    setFormData({
      ...formData,
      photo: null,
      photoPreview: null
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError('Géolocalisation non disponible');
      return;
    }

    setGettingLocation(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData({
          ...formData,
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
        });
        setGettingLocation(false);
      },
      (err) => {
        console.error('Erreur géolocalisation:', err);
        setError('Impossible obtenir position');
        setGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.category || !formData.title) {
      setError('Catégorie et titre obligatoires');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const submitData = new FormData();
      submitData.append('category', formData.category);
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      
      if (formData.photo) {
        submitData.append('photo', formData.photo);
      }
      
      if (formData.location) {
        submitData.append('latitude', formData.location.lat);
        submitData.append('longitude', formData.location.lng);
      }

      const result = await apiService.createRemark(submitData);

      if (result.success) {
        navigate('/');
      } else {
        setError(result.message || 'Erreur envoi');
      }
    } catch (err) {
      console.error('Erreur soumission:', err);
      setError('Erreur connexion serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-remark-page">
      <header className="page-header">
        <button 
          type="button"
          onClick={() => navigate('/')} 
          className="btn-back"
        >
          ← Retour
        </button>
        <h1>Nouvelle remarque</h1>
        <div style={{width: '70px'}}></div>
      </header>

      <form onSubmit={handleSubmit} className="remark-form">
        
        {error && (
          <div className="error-banner">
            <span>⚠️</span>
            <span>{error}</span>
            <button type="button" onClick={() => setError('')}>✕</button>
          </div>
        )}

        <div className="form-card">
          <h2 className="section-title">📋 Informations</h2>
          
          <div className="form-group">
            <label htmlFor="category">Catégorie *</label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              required
            >
              <option value="">Sélectionnez...</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="title">Titre *</label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Ex: Nid de poule rue de la Gare"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Décrivez le problème..."
              rows="4"
            />
          </div>
        </div>

        <div className="form-card">
          <h2 className="section-title">📸 Photo</h2>
          
          {formData.photoPreview ? (
            <div className="photo-preview">
              <img src={formData.photoPreview} alt="Preview" />
              <button 
                type="button"
                className="btn-remove-photo" 
                onClick={removePhoto}
              >
                🗑️ Supprimer
              </button>
            </div>
          ) : (
            <div className="photo-buttons">
              <button
                type="button"
                className="btn-photo"
                onClick={() => cameraInputRef.current?.click()}
              >
                📷<br/>Appareil photo
              </button>
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoCapture}
                style={{ display: 'none' }}
              />

              <button
                type="button"
                className="btn-photo"
                onClick={() => fileInputRef.current?.click()}
              >
                📁<br/>Choisir fichier
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoCapture}
                style={{ display: 'none' }}
              />
            </div>
          )}
        </div>

        <div className="form-card">
          <h2 className="section-title">📍 Localisation</h2>
          
          {formData.location ? (
            <div className="location-success">
              <div className="location-icon">✓</div>
              <div className="location-info">
                <strong>Position enregistrée</strong>
                <small>Lat: {formData.location.lat.toFixed(6)}, Lng: {formData.location.lng.toFixed(6)}</small>
              </div>
              <button
                type="button"
                className="btn-location-reset"
                onClick={() => setFormData({...formData, location: null})}
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="btn-location"
              onClick={handleGetLocation}
              disabled={gettingLocation}
            >
              {gettingLocation ? (
                <>
                  <div className="spinner"></div>
                  <span>Localisation...</span>
                </>
              ) : (
                <>
                  <span>📍</span>
                  <span>Obtenir ma position</span>
                </>
              )}
            </button>
          )}
        </div>

        <button
          type="submit"
          className="btn-submit"
          disabled={loading || !formData.category || !formData.title}
        >
          {loading ? (
            <>
              <div className="spinner"></div>
              <span>Envoi...</span>
            </>
          ) : (
            <>
              <span>📤</span>
              <span>Envoyer la remarque</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default AddRemarkPage;
