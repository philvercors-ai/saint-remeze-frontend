import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../services/apiService';
import './LoginPage.css';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Email obligatoire');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await apiService.forgotPassword(email);
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.message || "Erreur lors de l'envoi");
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

        <h1>Mot de passe oublié</h1>

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
            <div style={{ fontSize: '28px', marginBottom: '10px' }}>✉️</div>
            <strong>Email envoyé !</strong>
            <p style={{ marginTop: '10px', fontSize: '14px', lineHeight: '1.5' }}>
              Si cet email est associé à un compte, vous recevrez un lien de réinitialisation dans quelques minutes.
            </p>
            <p style={{ marginTop: '8px', fontSize: '13px', color: '#047857' }}>
              Pensez à vérifier vos spams.
            </p>
          </div>
        ) : (
          <>
            <p style={{ textAlign: 'center', color: '#64748b', margin: '8px 0 28px' }}>
              Saisissez votre email pour recevoir un lien de réinitialisation
            </p>

            {error && <div className="error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="votre@email.fr"
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
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

export default ForgotPasswordPage;
