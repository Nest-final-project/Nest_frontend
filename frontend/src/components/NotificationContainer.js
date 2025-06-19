import React, { useEffect, useState } from 'react';
import NotificationToast from './NotificationToast';
import notificationService from '../services/notificationService';
import './NotificationContainer.css';

const NotificationContainer = ({ isLoggedIn = false }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // 로그인되지 않은 상태에서는 알림 서비스를 시작하지 않음
    if (!isLoggedIn) {
      // 로그아웃 시 모든 알림 제거
      setNotifications([]);
      return;
    }

    // 알림 리스너 등록
    const handleNotification = (notification) => {
      addNotification(notification);
    };

    const handleConnection = (data) => {
      console.log('SSE 연결 상태:', data.status);
      
      if (data.status === 'connected') {
        // 연결 성공 시 테스트 알림 생성 (개발 환경)
        notificationService.createTestNotifications();
      } else if (data.status === 'failed') {
        // 연결 실패 시 오프라인 알림
        addNotification({
          id: `offline_${Date.now()}`,
          type: 'warning',
          title: '연결 끊김',
          message: '실시간 알림 서비스와의 연결이 끊어졌습니다.',
          timestamp: new Date().toISOString(),
          actions: [
            {
              label: '다시 연결',
              type: 'primary',
              onClick: () => {
                notificationService.connect();
              }
            }
          ]
        });
      }
    };

    // 이벤트 리스너 등록
    notificationService.addEventListener('notification', handleNotification);
    notificationService.addEventListener('connection', handleConnection);

    // SSE 연결 시작
    notificationService.connect();

    // 컴포넌트 언마운트 시 정리
    return () => {
      notificationService.removeEventListener('notification', handleNotification);
      notificationService.removeEventListener('connection', handleConnection);
      notificationService.disconnect();
    };
  }, [isLoggedIn]); // isLoggedIn이 변경될 때마다 useEffect 재실행

  const addNotification = (notification) => {
    setNotifications(prev => [...prev, {
      ...notification,
      id: notification.id || Date.now()
    }]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  // 전역 알림 함수 (다른 컴포넌트에서 사용할 수 있도록, 로그인된 상태에서만)
  if (isLoggedIn) {
    window.showNotification = addNotification;
  } else {
    // 로그아웃 상태에서는 전역 알림 함수 제거
    delete window.showNotification;
  }

  return (
    <div className="notification-container">
      {notifications.map(notification => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onClose={removeNotification}
        />
      ))}
    </div>
  );
};

export default NotificationContainer;