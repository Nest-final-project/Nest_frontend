import React, { useEffect, useState } from 'react';
import { X, Clock, MessageCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import './NotificationToast.css';

const NotificationToast = ({ notification, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // 컴포넌트가 마운트되면 애니메이션 시작
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    // 자동 닫기 (알림 타입에 따라 다른 시간)
    const autoCloseTime = getAutoCloseTime(notification.type);
    const autoCloseTimer = setTimeout(() => {
      handleClose();
    }, autoCloseTime);

    return () => {
      clearTimeout(timer);
      clearTimeout(autoCloseTimer);
    };
  }, [notification]);

  const getAutoCloseTime = (type) => {
    switch (type) {
      case 'warning':
      case 'error':
        return 10000; // 10초
      case 'info':
        return 5000; // 5초
      default:
        return 7000; // 7초
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'warning':
        return <AlertTriangle className="notification-icon" />;
      case 'error':
        return <X className="notification-icon" />;
      case 'success':
        return <CheckCircle className="notification-icon" />;
      case 'chat':
        return <MessageCircle className="notification-icon" />;
      case 'session':
        return <Clock className="notification-icon" />;
      default:
        return <Info className="notification-icon" />;
    }
  };

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(notification.id);
    }, 300);
  };

  return (
    <div 
      className={`notification-toast ${notification.type} ${isVisible ? 'visible' : ''} ${isExiting ? 'exiting' : ''}`}
    >
      <div className="notification-content">
        <div className="notification-header">
          {getIcon()}
          <div className="notification-title">{notification.title}</div>
          <button className="close-button" onClick={handleClose}>
            <X className="close-icon" />
          </button>
        </div>
        
        <div className="notification-body">
          <p className="notification-message">{notification.message}</p>
          {notification.timestamp && (
            <span className="notification-time">
              {new Date(notification.timestamp).toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          )}
        </div>

        {notification.actions && (
          <div className="notification-actions">
            {notification.actions.map((action, index) => (
              <button
                key={index}
                className={`notification-action ${action.type || 'secondary'}`}
                onClick={() => {
                  action.onClick && action.onClick();
                  handleClose();
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
      
      <div className="notification-progress">
        <div 
          className="progress-bar" 
          style={{ 
            animationDuration: `${getAutoCloseTime(notification.type)}ms` 
          }}
        ></div>
      </div>
    </div>
  );
};

export default NotificationToast;