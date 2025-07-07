import React, { useEffect, useState } from 'react';
import { X, Clock, MessageCircle, AlertTriangle, CheckCircle, Info, Calendar } from 'lucide-react';
import '../NotificationToast.css'; // 메인 CSS 파일로 변경

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
        return 8000; // 8초
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'warning':
        return <AlertTriangle />;
      case 'error':
        return <X />;
      case 'success':
        return <CheckCircle />;
      case 'chat':
        return <MessageCircle />;
      case 'session':
        return <Clock />;
      default:
        return <Info />;
    }
  };

  const handleToastClick = () => {
    // 채팅 시작 알림인 경우 클릭 시 채팅방으로 이동
    if ((notification.type === 'success' || notification.type === 'chat') && notification.chatRoomId) {
      if (window.openChatRoom) {
        window.openChatRoom(notification.chatRoomId);
      } else {
        // 직접 이동
        window.location.href = `/chat/${notification.chatRoomId}`;
      }
      handleClose();
    }
  };

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(notification.id);
    }, 300);
  };

  // 시간 계산 헬퍼 함수
  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return '';
    
    try {
      const start = new Date(`2000-01-01T${startTime}`);
      const end = new Date(`2000-01-01T${endTime}`);
      const diffMs = end - start;
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins >= 60) {
        const hours = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        return mins > 0 ? `${hours}시간 ${mins}분` : `${hours}시간`;
      }
      return `${diffMins}분`;
    } catch (error) {
      return '';
    }
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    if (!dateString || dateString === '오늘' || dateString === '날짜 미정') {
      return dateString; // 특수한 값들은 그대로 반환
    }
    
    try {
      // YYYY-MM-DD 형태인지 확인
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString; // 올바른 날짜 형태가 아니면 그대로 반환
      }
      
      const date = new Date(dateString);
      
      // 유효한 날짜인지 확인
      if (isNaN(date.getTime())) {
        return dateString;
      }
      
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
      const dayName = dayNames[date.getDay()];
      
      return `${year}년 ${month}월 ${day}일 (${dayName})`;
    } catch (error) {
      return dateString; // 오류 시 원본 문자열 반환
    }
  };

  // 시간 포맷팅 함수  
  const formatTime = (timeString) => {
    if (!timeString || timeString === '지금' || timeString === '시간 미정') {
      return timeString; // 특수한 값들은 그대로 반환
    }
    
    try {
      // HH:MM 형태인지 확인
      if (!/^\d{1,2}:\d{2}$/.test(timeString)) {
        return timeString; // 올바른 시간 형태가 아니면 그대로 반환
      }
      
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? '오후' : '오전';
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      
      return `${ampm} ${displayHour}:${minutes}`;
    } catch (error) {
      return timeString; // 오류 시 원본 문자열 반환
    }
  };

  // 시간 계산 헬퍼 함수 (종료 알림용)
  const calculateTimeRemaining = (endTime) => {
    if (!endTime) return '곧 종료됩니다';
    
    try {
      const now = new Date();
      const end = new Date(endTime);
      const diff = end - now;
      
      if (diff <= 0) return '종료되었습니다';
      
      const minutes = Math.floor(diff / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      if (minutes > 0) {
        return `${minutes}분 ${seconds}초 후 종료`;
      }
      return `${seconds}초 후 종료`;
    } catch (error) {
      return '곧 종료됩니다';
    }
  };

  // 예약 정보 포함 상세 토스트 렌더링
  const renderDetailedToast = () => {
    const reservationData = notification.reservationData;
    const duration = calculateDuration(reservationData?.startTime, reservationData?.endTime);
    
    return (
      <div 
        className={`toast-detailed ${notification.type} ${isVisible ? 'visible' : ''} ${isExiting ? 'exiting' : ''} ${notification.chatRoomId ? 'clickable' : ''}`}
        onClick={handleToastClick}
      >
        <button className="close-button" onClick={(e) => {
          e.stopPropagation();
          handleClose();
        }}>
          <X />
        </button>
        <div className="toast-content">
          <div className="toast-header">
            <div className="toast-icon-detailed">
              {getIcon()}
            </div>
            <div className="toast-text-detailed">
              <div className="toast-title-detailed">{notification.title}</div>
              {reservationData && (
                <div className="reservation-info-toast">
                  <div className="mentor-info-toast">
                    <div className="mentor-name-toast">
                      {reservationData.partnerRole === 'MENTOR' ? '👨‍🏫 ' : '👤 '}
                      {reservationData.partnerName}님
                    </div>
                    <div className="service-name-toast">{reservationData.serviceName}</div>
                  </div>
                  <div className="schedule-info">
                    {reservationData.date && (
                      <div className="date-time">
                        <Calendar />
                        <span>{formatDate(reservationData.date)}</span>
                      </div>
                    )}
                    {reservationData.startTime && reservationData.endTime && (
                      <div className="date-time">
                        <Clock />
                        <span>
                          {formatTime(reservationData.startTime)} - {formatTime(reservationData.endTime)}
                          {duration && ` (${duration})`}
                        </span>
                      </div>
                    )}
                    {!reservationData.date && !reservationData.startTime && (
                      <div className="date-time">
                        <Clock />
                        <span style={{color: '#ef4444'}}>예약 정보를 불러올 수 없습니다</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <button className="toast-action-detailed" onClick={(e) => {
            e.stopPropagation();
            handleToastClick();
          }}>
            <MessageCircle className="action-icon" />
            <span>{notification.actionText || '멘토링 시작하기'}</span>
          </button>
        </div>
        
        <div className="notification-progress">
          <div 
            className="progress-bar-detailed" 
            style={{ 
              animationDuration: `${getAutoCloseTime(notification.type)}ms` 
            }}
          ></div>
        </div>
      </div>
    );
  };

  // 채팅 종료 알림 상세 토스트 렌더링
  const renderTerminationToast = () => {
    const terminationData = notification.terminationData;
    
    return (
      <div 
        className={`notification-toast termination ${notification.type} ${isVisible ? 'visible' : ''} ${isExiting ? 'exiting' : ''}`}
        onClick={() => {}} // 종료 알림은 클릭 불가
      >
        <button className="close-button" onClick={(e) => {
          e.stopPropagation();
          handleClose();
        }}>
          <X />
        </button>
        <div className="notification-content">
          <div className="notification-header">
            <div className="notification-icon-termination">
              <AlertTriangle />
            </div>
            <div className="notification-text-termination">
              <div className="notification-title-termination">{notification.title}</div>
              <div className="termination-info">
                <div className="termination-message">
                  <span className="termination-content">{terminationData?.content || notification.message}</span>
                </div>
                {terminationData?.endTime && (
                  <div className="termination-time">
                    <Clock />
                    <span>{calculateTimeRemaining(terminationData.endTime)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <button className="notification-action-understood" onClick={(e) => {
            e.stopPropagation();
            handleClose();
          }}>
            <CheckCircle className="action-icon" />
            <span>확인했습니다</span>
          </button>
        </div>
        
        <div className="notification-progress">
          <div 
            className="progress-bar-termination" 
            style={{ 
              animationDuration: `${getAutoCloseTime(notification.type)}ms` 
            }}
          ></div>
        </div>
      </div>
    );
  };



  // 간단한 클린 토스트 렌더링
  const renderCleanToast = () => {
    return (
      <div 
        className={`notification-toast clean ${notification.type} ${isVisible ? 'visible' : ''} ${isExiting ? 'exiting' : ''} ${notification.chatRoomId ? 'clickable' : ''}`}
        onClick={handleToastClick}
      >
        <button className="close-button" onClick={(e) => {
          e.stopPropagation();
          handleClose();
        }}>
          <X />
        </button>
        <div className="notification-content">
          <div className="notification-header">
            <div className="notification-icon">
              {getIcon()}
            </div>
            <div className="notification-text">
              <div className="notification-title">{notification.title}</div>
              {notification.message && (
                <div className="notification-message">{notification.message}</div>
              )}
            </div>
          </div>
          
          {notification.chatRoomId && (
            <button className="notification-action" onClick={(e) => {
              e.stopPropagation();
              handleToastClick();
            }}>
              <MessageCircle className="action-icon" />
              <span>{notification.actionText || '채팅방 입장'}</span>
            </button>
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

  // 스타일에 따른 토스트 렌더링
  if (notification.style === 'detailed') {
    return renderDetailedToast();
  }
  
  if (notification.style === 'termination') {
    return renderTerminationToast();
  }

  if (notification.style === 'clean') {
    return renderCleanToast();
  }

  // 기본 토스트 렌더링 (하위 호환성)
  return (
    <div 
      className={`notification-toast default ${notification.type} ${isVisible ? 'visible' : ''} ${isExiting ? 'exiting' : ''} ${notification.chatRoomId ? 'clickable' : ''}`}
      onClick={handleToastClick}
    >
      <div className="notification-content">
        <div className="notification-header">
          {getIcon()}
          <div className="notification-title">{notification.title}</div>
          <button className="close-button" onClick={(e) => {
            e.stopPropagation();
            handleClose();
          }}>
            <X className="close-icon" />
          </button>
        </div>
        
        <div className="notification-body">
          <p className="notification-message">{notification.message}</p>
          {notification.chatRoomId && (
            <p className="notification-hint">클릭하여 채팅방으로 이동</p>
          )}
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
                onClick={(e) => {
                  e.stopPropagation();
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
