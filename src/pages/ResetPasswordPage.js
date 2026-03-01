import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import apiService from '../services/apiService';
import './LoginPage.css';

function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await apiService.resetPassword(token, password);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setError(result.message || 'Lien invalide ou expiré');
      }
    } catch {
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
            onError={(e) => (e.target.style.display = 'none')}
          />
        </div>

        <h1>Nouveau mot de passe</h1>

        {success ? (
          <div style={{
            background: '#d1fae5',
            color: '#065f46',
            padding: '20px',
            borderRadius: '10px',
            textAlign: 'center',
            border: '1px solid #a7f3d0',
            marginTop: '16px'
          }}>
            <div style={{ fontSize: '28px', marginBottom: '10px' }}>✅</div>
            <strong>Mot de passe mis à jour !</strong>
            <p style={{ marginTop: '10px', fontSize: '14px' }}>
              Vous allez être redirigé vers la page de connexion…
            </p>
          </div>
        ) : (
          <>
            <p style={{ textAlign: 'center', color: '#64748b', margin: '8px 0 28px' }}>
              Choisissez votre nouveau mot de passe
            </p>

            {error && <div className="error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="password">Nouveau mot de passe</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength="6"
                  autoComplete="new-password"
                />
                <small style={{ color: '#64748b', fontSize: '12px' }}>
                  Minimum 6 caractères
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="confirm">Confirmer le mot de passe</label>
                <input
                  type="password"
                  id="confirm"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  minLength="6"
                  autoComplete="new-password"
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Mise à jour...' : 'Réinitialiser le mot de passe'}
              </button>
            </form>
          </>
        )}

        <p style={{ textAlign: 'center', marginTop: '24px', color: '#64748b' }}>
          <Link to="/login" style={{ color: '#2563eb', fontWeight: '600' }}>
            ← Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
