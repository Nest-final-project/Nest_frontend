import React, { useState, useEffect } from 'react';
import { X, Clock, AlertTriangle } from 'lucide-react';

/**
 * 채팅방 종료 알림 컴포넌트
 * @param {Object} props
 * @param {Array} props.notifications - 알림 목록
 * @param {Function} props.onRemoveNotification - 알림 제거 함수
 * @param {Function} props.onClearAll - 모든 알림 제거 함수
 */
const ChatTerminationNotification = ({ 
  notifications = [], 
  onRemoveNotification, 
  onClearAll 
}) => {
  const [visibleNotifications, setVisibleNotifications] = useState([]);

  useEffect(() => {
    setVisibleNotifications(notifications);
  }, [notifications]);

  const handleRemove = (notificationId) => {
    // 애니메이션을 위해 먼저 로컬 상태에서 제거
    setVisibleNotifications(prev => 
      prev.filter(notification => notification.id !== notificationId)
    );
    
    // 부모 컴포넌트에 제거 요청
    setTimeout(() => {
      onRemoveNotification(notificationId);
    }, 300);
  };

  const formatTimeRemaining = (endTime) => {
    if (!endTime) return '곧';
    
    const now = new Date();
    const end = new Date(endTime);
    const diff = end - now;
    
    if (diff <= 0) return '종료됨';
    
    const minutes = Math.floor(diff / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    if (minutes > 0) {
      return `${minutes}분 ${seconds}초 후`;
    }
    return `${seconds}초 후`;
  };

  if (visibleNotifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {/* 전체 제거 버튼 */}
      {visibleNotifications.length > 1 && (
        <div className="flex justify-end">
          <button
            onClick={onClearAll}
            className="text-xs text-gray-500 hover:text-gray-700 bg-white px-2 py-1 rounded-md shadow-sm border"
          >
            모든 알림 제거
          </button>
        </div>
      )}

      {/* 알림 목록 */}
      {visibleNotifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={handleRemove}
          formatTimeRemaining={formatTimeRemaining}
        />
      ))}
    </div>
  );
};

/**
 * 개별 알림 아이템 컴포넌트
 */
const NotificationItem = ({ notification, onRemove, formatTimeRemaining }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    // 마운트 시 애니메이션 효과
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // 시간 업데이트
    const updateTime = () => {
      if (notification.data && notification.data.endTime) {
        setTimeRemaining(formatTimeRemaining(notification.data.endTime));
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [notification.data, formatTimeRemaining]);

  // 자동 제거 (10초 후)
  useEffect(() => {
    const autoRemoveTimer = setTimeout(() => {
      onRemove(notification.id);
    }, 10000);

    return () => clearTimeout(autoRemoveTimer);
  }, [notification.id, onRemove]);

  const handleRemove = () => {
    setIsVisible(false);
    setTimeout(() => onRemove(notification.id), 300);
  };

  const getNotificationContent = () => {
    if (notification.data) {
      return {
        title: '채팅방 종료 알림',
        message: notification.data.content || '채팅방이 곧 종료됩니다.',
        endTime: notification.data.endTime
      };
    }
    
    return {
      title: '채팅방 종료 알림',
      message: '채팅방이 곧 종료됩니다.',
      endTime: null
    };
  };

  const { title, message, endTime } = getNotificationContent();

  return (
    <div
      className={`
        transform transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        bg-white border-l-4 border-orange-500 rounded-lg shadow-lg p-4 min-w-80 max-w-sm
      `}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
        </div>
        
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-gray-900">
            {title}
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            {message}
          </p>
          
          {endTime && (
            <div className="mt-2 flex items-center text-xs text-orange-600">
              <Clock className="h-3 w-3 mr-1" />
              <span>{timeRemaining}</span>
            </div>
          )}
          
          <div className="mt-2 text-xs text-gray-400">
            {notification.timestamp.toLocaleTimeString()}
          </div>
        </div>
        
        <div className="flex-shrink-0 ml-2">
          <button
            onClick={handleRemove}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* 진행 바 (자동 제거까지의 시간) */}
      <div className="mt-3 w-full bg-gray-200 rounded-full h-1">
        <div 
          className="bg-orange-500 h-1 rounded-full transition-all duration-[10000ms] ease-linear"
          style={{ width: '100%' }}
        />
      </div>
    </div>
  );
};

export default ChatTerminationNotification;
