import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/apiService';
import './LoginPage.css';

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // ✅ CRITIQUE - Empêcher rechargement
    
    console.log('🔑 Tentative connexion...', { email: formData.email, password: '***' });

    if (!formData.email || !formData.password) {
      setError('Email et mot de passe obligatoires');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('🚀 Envoi vers API login...');
      const result = await apiService.login(formData.email, formData.password);
      console.log('📨 Réponse login:', result);

      if (result.success) {
        console.log('✅ Connexion réussie');
        login(result.data.token, result.data.user);
        navigate('/');
      } else {
        console.error('❌ Connexion échouée:', result.message);
        setError(result.message || 'Email ou mot de passe incorrect');
      }
    } catch (err) {
      console.error('❌ Erreur connexion:', err);
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <img 
            src="/logo-saint-remeze.png" 
            alt="Saint-Remèze" 
            style={{ height: '60px' }} 
            onError={(e) => e.target.style.display='none'} 
          />
        </div>
        <h1>Connexion</h1>
        <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '30px' }}>
          Accédez à votre espace citoyen
        </p>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
          </div>

          <div style={{ textAlign: 'right', marginBottom: '20px', marginTop: '-8px' }}>
            <Link to="/forgot-password" style={{ color: '#2563eb', fontSize: '13px', fontWeight: '500' }}>
              Mot de passe oublié ?
            </Link>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', color: '#64748b' }}>
          Pas encore de compte ? <Link to="/register" style={{ color: '#2563eb', fontWeight: '600' }}>S'inscrire</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
