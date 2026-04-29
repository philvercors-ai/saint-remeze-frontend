import React, { useState, useRef, useEffect } from 'react';
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

const MAX_PHOTOS = 3;

function AddRemarkPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [formData, setFormData] = useState({
    category: '',
    title: '',
    description: '',
    photos: [],
    location: null
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [gettingLocation, setGettingLocation] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  // Branche le stream sur la balise vidéo quand la modale s'ouvre
  useEffect(() => {
    if (showCamera && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [showCamera]);

  // Libère les object URLs à la destruction du composant
  useEffect(() => {
    return () => {
      closeCamera();
      formData.photos.forEach(p => {
        if (p.preview?.startsWith('blob:')) URL.revokeObjectURL(p.preview);
      });
    };
  }, []); // eslint-disable-line

  // --- CAMERA getUserMedia (évite de recevoir un fichier full-res en mémoire) ---
  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width:  { ideal: 1280, max: 1920 },
          height: { ideal: 720,  max: 1080 }
        },
        audio: false
      });
      streamRef.current = stream;
      setShowCamera(true);
    } catch (err) {
      setError("Caméra inaccessible. Utilisez \"Choisir fichier\" à la place.");
    }
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const captureFromCamera = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width  = video.videoWidth  || 1280;
    canvas.height = video.videoHeight || 720;
    canvas.getContext('2d').drawImage(video, 0, 0);
    closeCamera();
    canvas.toBlob((blob) => {
      canvas.width = 0;
      canvas.height = 0;
      if (!blob) { setError('Erreur capture photo'); return; }
      const file    = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
      const preview = URL.createObjectURL(blob);
      setFormData(prev => ({ ...prev, photos: [...prev.photos, { file, preview }] }));
    }, 'image/jpeg', 0.85);
  };

  // --- FICHIER (galerie / fichier existant) ---
  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const remaining = MAX_PHOTOS - formData.photos.length;
    const toProcess = files.slice(0, remaining);

    if (toProcess.some(f => f.size > 10 * 1024 * 1024)) {
      setError('Une photo dépasse 10MB');
      return;
    }

    try {
      const newPhotos = [];
      for (const file of toProcess) {
        const compressed = await compressImage(file);
        const preview = URL.createObjectURL(compressed);
        newPhotos.push({ file: compressed, preview });
      }
      setFormData(prev => ({ ...prev, photos: [...prev.photos, ...newPhotos] }));
      setError('');
    } catch (err) {
      setError('Erreur traitement photo');
    }
    e.target.value = '';
  };

  const compressImage = async (file) => {
    if (file.size < 400 * 1024) return file;
    const maxSize = 1024;
    try {
      const bitmap = await createImageBitmap(file, { resizeWidth: maxSize, resizeQuality: 'medium' });
      const canvas = document.createElement('canvas');
      canvas.width  = bitmap.width;
      canvas.height = bitmap.height;
      canvas.getContext('2d').drawImage(bitmap, 0, 0);
      bitmap.close();
      return await new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          canvas.width = 0; canvas.height = 0;
          blob ? resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }))
               : reject(new Error('Compression failed'));
        }, 'image/jpeg', 0.8);
      });
    } catch (_) {
      return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
          URL.revokeObjectURL(url);
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          if (width > maxSize || height > maxSize) {
            if (width > height) { height = Math.round((maxSize / width) * height); width = maxSize; }
            else { width = Math.round((maxSize / height) * width); height = maxSize; }
          }
          canvas.width = width; canvas.height = height;
          canvas.getContext('2d').drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            canvas.width = 0; canvas.height = 0;
            blob ? resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }))
                 : reject(new Error('Compression failed'));
          }, 'image/jpeg', 0.8);
        };
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image load failed')); };
        img.src = url;
      });
    }
  };

  const removePhoto = (index) => {
    setFormData(prev => {
      const removed = prev.photos[index];
      if (removed?.preview?.startsWith('blob:')) URL.revokeObjectURL(removed.preview);
      return { ...prev, photos: prev.photos.filter((_, i) => i !== index) };
    });
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) { setError('Géolocalisation non disponible'); return; }
    setGettingLocation(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          location: { lat: position.coords.latitude, lng: position.coords.longitude }
        }));
        setGettingLocation(false);
      },
      () => { setError('Impossible obtenir position'); setGettingLocation(false); },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category || !formData.title) { setError('Catégorie et titre obligatoires'); return; }
    setLoading(true);
    setError('');
    try {
      const submitData = new FormData();
      submitData.append('category', formData.category);
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      formData.photos.forEach(p => submitData.append('photos', p.file));
      if (formData.location) {
        submitData.append('latitude', formData.location.lat);
        submitData.append('longitude', formData.location.lng);
      }
      const result = await apiService.createRemark(submitData);
      if (result.success) { navigate('/'); }
      else { setError(result.message || 'Erreur envoi'); }
    } catch (err) {
      setError('Erreur: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const canAddMore = formData.photos.length < MAX_PHOTOS;

  return (
    <div className="add-remark-page">

      {/* Modale caméra getUserMedia */}
      {showCamera && (
        <div className="camera-overlay">
          <video ref={videoRef} autoPlay playsInline muted className="camera-video" />
          <div className="camera-controls">
            <button type="button" className="camera-close-btn" onClick={closeCamera}>✕</button>
            <button type="button" className="camera-shutter-btn" onClick={captureFromCamera}>
              <span className="camera-shutter-inner" />
            </button>
            <div style={{ width: 48 }} />
          </div>
        </div>
      )}

      <header className="page-header">
        <button type="button" onClick={() => navigate('/')} className="btn-back">← Retour</button>
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
            <select id="category" value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})} required>
              <option value="">Sélectionnez...</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="title">Titre *</label>
            <input type="text" id="title" value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Ex: Nid de poule rue de la Gare" required />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea id="description" value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Décrivez le problème..." rows="4" />
          </div>
        </div>

        <div className="form-card">
          <h2 className="section-title">📸 Photos <span className="photos-counter">{formData.photos.length}/{MAX_PHOTOS}</span></h2>

          {formData.photos.length > 0 && (
            <div className="photos-grid">
              {formData.photos.map((p, i) => (
                <div key={i} className="photo-thumb">
                  <img src={p.preview} alt={`Photo ${i + 1}`} />
                  <button type="button" className="photo-thumb-remove" onClick={() => removePhoto(i)}>✕</button>
                </div>
              ))}
            </div>
          )}

          {canAddMore && (
            <div className="photo-buttons">
              <button type="button" className="btn-photo" onClick={openCamera}>
                📷<br/>Appareil photo
              </button>

              <button type="button" className="btn-photo" onClick={() => fileInputRef.current?.click()}>
                📁<br/>Choisir fichier
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" multiple
                onChange={handleFileSelect} style={{ display: 'none' }} />
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
              <button type="button" className="btn-location-reset"
                onClick={() => setFormData({...formData, location: null})}>✕</button>
            </div>
          ) : (
            <button type="button" className="btn-location" onClick={handleGetLocation} disabled={gettingLocation}>
              {gettingLocation ? (
                <><div className="spinner"></div><span>Localisation...</span></>
              ) : (
                <><span>📍</span><span>Partager ma position</span></>
              )}
            </button>
          )}
        </div>

        <button type="submit" className="btn-submit"
          disabled={loading || !formData.category || !formData.title}>
          {loading ? (
            <><div className="spinner"></div><span>Envoi...</span></>
          ) : (
            <><span>📤</span><span>Envoyer la remarque</span></>
          )}
        </button>
      </form>
    </div>
  );
}

export default AddRemarkPage;
