import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import './NotificationsPage.css';

function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const result = await apiService.getNotifications();
      if (result.success) {
        setNotifications(result.data);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await apiService.markAsRead(id);
      loadNotifications();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await apiService.markAllAsRead();
      loadNotifications();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  return (
    <div className="notifications-page">
      <header className="page-header">
        <button onClick={() => navigate(-1)} className="btn-back">← Retour</button>
        <h1>Notifications</h1>
        {notifications.some(n => !n.read) && (
          <button onClick={handleMarkAllAsRead} className="btn btn-secondary">
            Tout marquer comme lu
          </button>
        )}
      </header>

      <div className="notifications-container">
        {loading ? (
          <div className="loading">Chargement...</div>
        ) : notifications.length === 0 ? (
          <div className="empty">
            <p>🔔 Aucune notification</p>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map(notif => (
              <div
                key={notif._id}
                className={`notification-card ${!notif.read ? 'unread' : ''}`}
                onClick={() => !notif.read && handleMarkAsRead(notif._id)}
              >
                <div className="notification-header">
                  <h3>{notif.title}</h3>
                  {!notif.read && <span className="unread-badge">●</span>}
                </div>
                <p>{notif.message}</p>
                <p className="notification-date">
                  {new Date(notif.createdAt).toLocaleDateString('fr-FR')} à{' '}
                  {new Date(notif.createdAt).toLocaleTimeString('fr-FR')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificationsPage;
