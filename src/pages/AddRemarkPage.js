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

  // ===== GESTION PHOTO =====
  const handlePhotoCapture = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Vérifier la taille (max 10MB avant compression)
    if (file.size > 10 * 1024 * 1024) {
      setError('Photo trop volumineuse (max 10MB)');
      return;
    }

    try {
      // ✅ COMPRESSION AUTOMATIQUE
      const compressedFile = await compressImage(file);
      
      // Créer preview
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
      setError('Erreur lors du traitement de la photo');
    }
  };

  // ===== COMPRESSION IMAGE =====
  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Redimensionner si trop grand (max 1200px)
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
          
          // Dessiner l'image redimensionnée
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convertir en blob avec qualité 0.7 (30% de compression)
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now()
                });
                console.log(`✅ Image compressée: ${(file.size / 1024).toFixed(0)}KB → ${(blob.size / 1024).toFixed(0)}KB`);
                resolve(compressedFile);
              } else {
                reject(new Error('Compression échouée'));
              }
            },
            'image/jpeg',
            0.7 // Qualité 70%
          );
        };
        img.onerror = () => reject(new Error('Chargement image échoué'));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error('Lecture fichier échouée'));
      reader.readAsDataURL(file);
    });
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

  // ===== GÉOLOCALISATION =====
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError('Géolocalisation non disponible sur cet appareil');
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
        setError('Impossible d\'obtenir votre position. Vérifiez les autorisations.');
        setGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // ===== SOUMISSION =====
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.category || !formData.title) {
      setError('Catégorie et titre sont obligatoires');
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
        setError(result.message || 'Erreur lors de l\'envoi');
      }
    } catch (err) {
      console.error('Erreur soumission:', err);
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-remark-page">
      {/* HEADER */}
      <header className="page-header">
        <button 
          type="button"
          onClick={() => navigate('/')} 
          className="btn-back"
          aria-label="Retour"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M12 4l-8 8 8 8" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Retour
        </button>
        <h1>Nouvelle remarque</h1>
        <div style={{width: '70px'}}></div> {/* Spacer pour centrer le titre */}
      </header>

      {/* FORMULAIRE */}
      <form onSubmit={handleSubmit} className="remark-form">
        
        {/* Erreur globale */}
        {error && (
          <div className="error-banner">
            <span>⚠️</span>
            <span>{error}</span>
            <button type="button" onClick={() => setError('')}>✕</button>
          </div>
        )}

        {/* SECTION 1 : Informations */}
        <div className="form-card">
          <h2 className="section-title">📋 Informations</h2>
          
          <div className="form-group">
            <label htmlFor="category">Catégorie *</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              required
            >
              <option value="">Sélectionnez une catégorie...</option>
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
              name="title"
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
              name="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Décrivez le problème en détail..."
              rows="4"
            />
          </div>
        </div>

        {/* SECTION 2 : Photo */}
        <div className="form-card">
          <h2 className="section-title">📸 Photo</h2>
          
          {formData.photoPreview ? (
            <div className="photo-preview">
              <img src={formData.photoPreview} alt="Preview" />
              <button 
                type="button"
                className="btn-remove-photo" 
                onClick={removePhoto}
                aria-label="Supprimer la photo"
              >
                🗑️ Supprimer
              </button>
            </div>
          ) : (
            <div className="photo-buttons">
              {/* Bouton Appareil Photo (mobile) */}
              <button
                type="button"
                className="btn-photo btn-camera"
                onClick={() => cameraInputRef.current?.click()}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
                <span>Appareil photo</span>
              </button>
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoCapture}
                style={{ display: 'none' }}
              />

              {/* Bouton Choisir fichier */}
              <button
                type="button"
                className="btn-photo btn-file"
                onClick={() => fileInputRef.current?.click()}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                <span>Choisir un fichier</span>
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

        {/* SECTION 3 : Localisation */}
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
                  <span>Localisation en cours...</span>
                </>
              ) : (
                <>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  <span>Obtenir ma position</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* BOUTON ENVOI */}
        <button
          type="submit"
          className="btn-submit"
          disabled={loading || !formData.category || !formData.title}
        >
          {loading ? (
            <>
              <div className="spinner"></div>
              <span>Envoi en cours...</span>
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
