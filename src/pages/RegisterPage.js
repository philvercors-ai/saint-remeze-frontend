import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/apiService';
import './RegisterPage.css';

function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    rgpdConsent: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData, 
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // ✅ CRITIQUE - Empêcher le rechargement
    
    console.log('📝 Tentative inscription...', formData);
    
    if (!formData.rgpdConsent) {
      setError('Vous devez accepter la politique RGPD');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('🚀 Envoi vers API...');
      const result = await apiService.register(formData);
      console.log('📨 Réponse reçue:', result);

      if (result.success) {
        console.log('✅ Inscription réussie');
        login(result.data.token, result.data.user);
        navigate('/');
      } else {
        console.error('❌ Inscription échouée:', result.message);
        setError(result.message || 'Erreur lors de l\'inscription');
      }
    } catch (err) {
      console.error('❌ Erreur inscription:', err);
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <img 
            src="/logo-saint-remeze.png" 
            alt="Saint-Remèze" 
            style={{ height: '60px' }} 
            onError={(e) => e.target.style.display='none'} 
          />
        </div>
        <h1>Créer un compte</h1>
        <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '30px' }}>
          Bienvenue sur l'application citoyenne de Saint-Remèze
        </p>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Nom complet *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Téléphone</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="06 12 34 56 78"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mot de passe *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
              autoComplete="new-password"
            />
            <small style={{ color: '#64748b', fontSize: '12px' }}>
              Minimum 6 caractères
            </small>
          </div>

          <div className="form-group" style={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            gap: '10px',
            marginTop: '20px'
          }}>
            <input
              type="checkbox"
              id="rgpdConsent"
              name="rgpdConsent"
              checked={formData.rgpdConsent}
              onChange={handleChange}
              required
              style={{ 
                marginTop: '4px',
                width: '18px',
                height: '18px',
                cursor: 'pointer'
              }}
            />
            <label 
              htmlFor="rgpdConsent" 
              style={{ 
                fontSize: '13px', 
                lineHeight: '1.5',
                cursor: 'pointer'
              }}
            >
              J'accepte que mes données personnelles soient collectées et traitées 
              conformément au Règlement Général sur la Protection des Données (RGPD). 
              Ces données ne seront utilisées que pour la gestion de mes remarques 
              et ne seront pas partagées avec des tiers. *
            </label>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading || !formData.rgpdConsent}
            style={{ 
              width: '100%',
              opacity: (!formData.rgpdConsent || loading) ? 0.5 : 1,
              cursor: (!formData.rgpdConsent || loading) ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Inscription...' : 'S\'inscrire'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', color: '#64748b' }}>
          Déjà un compte ? <Link to="/login" style={{ color: '#2563eb', fontWeight: '600' }}>Se connecter</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
