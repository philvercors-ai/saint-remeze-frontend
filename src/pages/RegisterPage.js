import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/apiService';
import './AuthPages.css';

function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    rgpdConsent: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.rgpdConsent) {
      setError('Vous devez accepter la politique de confidentialité');
      return;
    }

    setLoading(true);

    try {
      const result = await apiService.register(formData);
      if (result.success) {
        login(result.data.user, result.data.token);
        navigate('/');
      } else {
        setError(result.message || 'Erreur d\'inscription');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="logo-container">
          <img src="/logo-saint-remeze.png" alt="Saint-Remèze" onError={(e) => e.target.style.display='none'} />
        </div>
        <h1>🏛️ Saint-Remèze</h1>
        <p className="subtitle">Inscription</p>

        {error && <div className="error-message">{error}</div>}

        <form onsubmit={handleSubmit}>
          <div className="form-group">
            <label>Nom complet</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Téléphone (optionnel)</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Mot de passe</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              disabled={loading}
            />
          </div>

          <div className="form-group" style={{ background: '#eff6ff', padding: '15px', borderRadius: '8px', marginTop: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'start', gap: '10px', cursor: 'pointer', marginBottom: 0 }}>
              <input
                type="checkbox"
                name="rgpdConsent"
                checked={formData.rgpdConsent}
                onChange={handleChange}
                style={{ marginTop: '4px' }}
                disabled={loading}
              />
              <span style={{ color: '#1e40af', fontSize: '14px' }}>
                J'accepte que mes données personnelles soient utilisées pour le traitement de mes remarques conformément au RGPD. 
                Mes données ne seront pas diffusées et resteront confidentielles.
              </span>
            </label>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading || !formData.rgpdConsent}>
            {loading ? 'Inscription...' : 'S\'inscrire'}
          </button>
        </form>

        <p className="link-text">
          Déjà un compte ? <Link to="/login">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
