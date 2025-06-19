import React, { useEffect, useState } from 'react';
import NotificationToast from './NotificationToast';
import notificationService from '../services/notificationService';
import authService from '../services/authService';
import './NotificationContainer.css';

const NotificationContainer = ({ isLoggedIn = false }) => {
  const [notifications, setNotifications] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  useEffect(() => {
    // 로그인되지 않은 상태에서는 알림 서비스를 시작하지 않음
    if (!isLoggedIn) {
      setNotifications([]);
      setConnectionStatus('disconnected');
      return;
    }

    // 인증 토큰 설정 - authService에서 먼저 확인
    let token = authService.token;
    if (!token) {
      // authService에 토큰이 없으면 localStorage에서 확인
      token = localStorage.getItem('accessToken');
      console.log('localStorage에서 토큰 조회:', token);
    }
    
    console.log('NotificationContainer - 사용할 토큰:', token);
    console.log('토큰 타입:', typeof token);
    console.log('토큰 길이:', token ? token.length : 0);
    
    if (token && token !== 'null' && token !== 'undefined') {
      // 토큰이 올바른 JWT 형식인지 확인
      if (token.startsWith('eyJ') && token.length > 50) {
        notificationService.setAuthToken(token);
        console.log('알림 서비스에 토큰 설정 완료');
      } else {
        console.error('올바르지 않은 토큰 형식:', token);
        // 잘못된 토큰 제거
        localStorage.removeItem('accessToken');
        return;
      }
    } else {
      console.warn('토큰이 없어서 알림 서비스를 시작할 수 없습니다.');
      return;
    }

    // 알림 리스너 등록
    const handleNotification = (notification) => {
      addNotification(notification);
    };

    const handleConnection = (data) => {
      setConnectionStatus(data.status);
      console.log('SSE 연결 상태:', data.status);
      
      if (data.status === 'connected') {
        // 연결 성공 시 사용자에게 알림
        addNotification({
          id: `connected_${Date.now()}`,
          type: 'success',
          title: '알림 서비스 연결됨',
          message: '실시간 알림을 받을 수 있습니다.',
          timestamp: new Date().toISOString(),
          autoClose: true,
          duration: 3000
        });
        
        // 개발 환경에서만 테스트 알림 생성
        if (process.env.NODE_ENV === 'development') {
          notificationService.createTestNotifications();
        }
      } else if (data.status === 'failed') {
        // 연결 실패 시 오프라인 알림
        addNotification({
          id: `offline_${Date.now()}`,
          type: 'error',
          title: '연결 실패',
          message: '실시간 알림 서비스 연결에 실패했습니다.',
          timestamp: new Date().toISOString(),
          actions: [
            {
              label: '다시 연결',
              type: 'primary',
              onClick: () => {
                notificationService.connect();
              }
            },
            {
              label: '닫기',
              type: 'secondary',
              onClick: () => {}
            }
          ]
        });
      }
    };

    // 이벤트 리스너 등록
    notificationService.addEventListener('notification', handleNotification);
    notificationService.addEventListener('connection', handleConnection);

    // 인증된 상태에서만 SSE 연결 시작
    if (token && token.startsWith('eyJ')) {
      console.log('SSE 연결 시작...');
      notificationService.connect();
    } else {
      console.error('올바른 토큰이 없어서 SSE 연결을 시작하지 않습니다.');
    }

    // 컴포넌트 언마운트 시 정리
    return () => {
      notificationService.removeEventListener('notification', handleNotification);
      notificationService.removeEventListener('connection', handleConnection);
    };
  }, [isLoggedIn]);

  // 인증 상태 변경 감지
  useEffect(() => {
    const handleAuthStateChange = (authState) => {
      if (authState.isLoggedIn && authState.token) {
        notificationService.setAuthToken(authState.token);
        notificationService.connect();
      } else {
        notificationService.clearAuth();
        setNotifications([]);
        setConnectionStatus('disconnected');
      }
    };

    authService.addAuthStateListener(handleAuthStateChange);

    return () => {
      authService.removeAuthStateListener(handleAuthStateChange);
    };
  }, []);

  const addNotification = (notification) => {
    const newNotification = {
      ...notification,
      id: notification.id || `notification_${Date.now()}_${Math.random()}`,
      timestamp: notification.timestamp || new Date().toISOString()
    };

    setNotifications(prev => [...prev, newNotification]);

    // 자동 닫기 설정된 알림 처리
    if (newNotification.autoClose) {
      const duration = newNotification.duration || 5000;
      setTimeout(() => {
        removeNotification(newNotification.id);
      }, duration);
    }
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  // 모든 알림 제거
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // 전역 알림 함수 (다른 컴포넌트에서 사용할 수 있도록)
  useEffect(() => {
    if (isLoggedIn) {
      window.showNotification = addNotification;
      window.clearAllNotifications = clearAllNotifications;
    } else {
      // 로그아웃 상태에서는 전역 알림 함수 제거
      delete window.showNotification;
      delete window.clearAllNotifications;
    }

    return () => {
      delete window.showNotification;
      delete window.clearAllNotifications;
    };
  }, [isLoggedIn]);

  return (
    <div className="notification-container">
      {/* 연결 상태 표시 (개발 환경에서만) */}
      {process.env.NODE_ENV === 'development' && isLoggedIn && (
        <div className={`connection-status ${connectionStatus}`}>
          <span className="status-indicator"></span>
          알림 서비스: {connectionStatus === 'connected' ? '연결됨' : 
                      connectionStatus === 'reconnecting' ? '재연결 중...' :
                      connectionStatus === 'connecting' ? '연결 중...' : '연결 끊김'}
        </div>
      )}

      {/* 알림 목록 */}
      {notifications.map(notification => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onClose={removeNotification}
        />
      ))}

      {/* 다중 알림이 있을 때 전체 지우기 버튼 */}
      {notifications.length > 2 && (
        <div className="notification-controls">
          <button 
            className="clear-all-btn"
            onClick={clearAllNotifications}
            aria-label="모든 알림 지우기"
          >
            모든 알림 지우기
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationContainer;