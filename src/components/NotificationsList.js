import React from 'react';
import { useNavigate } from 'react-router-dom';
import './NotificationsList.css';

function NotificationsList({ notifications, onMarkAsRead, onClose }) {
  const navigate = useNavigate();

  const handleNotificationClick = async (notification) => {
    // Marquer comme lue
    if (!notification.read) {
      await onMarkAsRead(notification._id);
    }
    
    // Fermer le dropdown
    if (onClose) onClose();
    
    // Naviguer vers la remarque
    if (notification.remarkId) {
      navigate(`/remark/${notification.remarkId}`);
    }
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'status_change': return '🔄';
      case 'new_comment': return '💬';
      case 'assigned': return '👤';
      default: return '🔔';
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    if (seconds < 60) return 'À l\'instant';
    if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)} min`;
    if (seconds < 86400) return `Il y a ${Math.floor(seconds / 3600)}h`;
    if (seconds < 604800) return `Il y a ${Math.floor(seconds / 86400)}j`;
    
    return new Date(date).toLocaleDateString('fr-FR');
  };

  if (!notifications || notifications.length === 0) {
    return (
      <div className="notifications-list">
        <div className="notifications-empty">
          <p>🔔 Aucune notification</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notifications-list">
      <div className="notifications-header">
        <h3>Notifications</h3>
        {notifications.some(n => !n.read) && (
          <button 
            className="mark-all-read"
            onClick={(e) => {
              e.stopPropagation();
              notifications.filter(n => !n.read).forEach(n => onMarkAsRead(n._id));
            }}
          >
            Tout marquer comme lu
          </button>
        )}
      </div>
      
      <div className="notifications-items">
        {notifications.map((notification) => (
          <div 
            key={notification._id}
            className={`notification-item ${notification.read ? 'read' : 'unread'}`}
            onClick={() => handleNotificationClick(notification)}
          >
            <div className="notification-icon">
              {getNotificationIcon(notification.type)}
            </div>
            
            <div className="notification-content">
              <p className="notification-message">{notification.message}</p>
              <span className="notification-time">{getTimeAgo(notification.createdAt)}</span>
            </div>
            
            {!notification.read && (
              <div className="notification-badge"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default NotificationsList;
