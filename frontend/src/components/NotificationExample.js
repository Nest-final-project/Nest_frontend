import React, { useState } from 'react';
import { chatAPI, notificationAPI } from '../services/api';
import notificationService from '../services/notificationService';
import useAuth from '../hooks/useAuth';

const NotificationExample = () => {
  const [testMessage, setTestMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { isLoggedIn, user } = useAuth();

  // 테스트 알림 수동 생성
  const handleCreateTestNotification = () => {
    if (window.showNotification) {
      window.showNotification({
        type: 'info',
        title: '테스트 알림',
        message: testMessage || '이것은 테스트 알림입니다.',
        actions: [
          {
            label: '확인',
            type: 'primary',
            onClick: () => console.log('테스트 알림 확인됨')
          }
        ]
      });
    }
  };

  // 채팅 종료 알림 테스트
  const handleTestChatTermination = () => {
    if (window.showNotification) {
      window.showNotification({
        type: 'warning',
        title: '채팅 종료 알림',
        message: '채팅이 5분 후 종료됩니다.',
        actions: [
          {
            label: '연장 요청',
            type: 'primary',
            onClick: async () => {
              try {
                await notificationService.requestChatExtension();
              } catch (error) {
                console.error('연장 요청 실패:', error);
              }
            }
          },
          {
            label: '확인',
            type: 'secondary',
            onClick: () => console.log('채팅 종료 알림 확인됨')
          }
        ]
      });
    }
  };

  // 실제 채팅방 연장 요청 테스트
  const handleRequestChatExtension = async () => {
    if (!isLoggedIn) {
      alert('로그인이 필요합니다.');
      return;
    }

    setIsLoading(true);
    try {
      // 예시: 현재 활성 채팅방이 있다고 가정
      const currentChatRoomId = 1; // 실제로는 현재 채팅방 ID를 가져와야 함
      
      await chatAPI.extendChatRoom(currentChatRoomId, {
        extensionMinutes: 15
      });

      if (window.showNotification) {
        window.showNotification({
          type: 'success',
          title: '연장 완료',
          message: '채팅방이 15분 연장되었습니다.',
          autoClose: true,
          duration: 3000
        });
      }
    } catch (error) {
      console.error('채팅방 연장 실패:', error);
      if (window.showNotification) {
        window.showNotification({
          type: 'error',
          title: '연장 실패',
          message: '채팅방 연장에 실패했습니다.',
          actions: [
            {
              label: '다시 시도',
              type: 'primary',
              onClick: () => handleRequestChatExtension()
            }
          ]
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 모든 알림 읽음 처리
  const handleMarkAllNotificationsRead = async () => {
    if (!isLoggedIn) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      await notificationAPI.markAllAsRead();
      if (window.showNotification) {
        window.showNotification({
          type: 'success',
          title: '알림 읽음 처리',
          message: '모든 알림을 읽음 처리했습니다.',
          autoClose: true,
          duration: 2000
        });
      }
    } catch (error) {
      console.error('알림 읽음 처리 실패:', error);
    }
  };

  // SSE 연결 상태 확인
  const handleCheckConnection = () => {
    const isConnected = notificationService.eventSource && 
                       notificationService.eventSource.readyState === EventSource.OPEN;
    
    if (window.showNotification) {
      window.showNotification({
        type: isConnected ? 'success' : 'warning',
        title: '연결 상태',
        message: `SSE 연결 상태: ${isConnected ? '연결됨' : '연결 끊김'}`,
        autoClose: true,
        duration: 2000
      });
    }
  };

  // 다양한 알림 타입 테스트
  const showDifferentNotificationTypes = () => {
    const types = [
      { type: 'success', title: '성공', message: '작업이 성공적으로 완료되었습니다.' },
      { type: 'error', title: '오류', message: '오류가 발생했습니다.' },
      { type: 'warning', title: '경고', message: '주의가 필요합니다.' },
      { type: 'info', title: '정보', message: '새로운 정보가 있습니다.' }
    ];

    types.forEach((notification, index) => {
      setTimeout(() => {
        if (window.showNotification) {
          window.showNotification({
            ...notification,
            autoClose: true,
            duration: 3000
          });
        }
      }, index * 1000);
    });
  };

  if (!isLoggedIn) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h3>로그인이 필요합니다</h3>
        <p>알림 테스트를 위해 로그인해주세요.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h2>백엔드 연동 알림 시스템 테스트</h2>
      
      <div style={{ marginBottom: '1rem' }}>
        <p><strong>현재 사용자:</strong> {user?.name || user?.nickname || '사용자'}</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        {/* 커스텀 메시지 테스트 */}
        <div>
          <label htmlFor="testMessage">테스트 메시지:</label>
          <input
            id="testMessage"
            type="text"
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            placeholder="테스트 알림 메시지를 입력하세요"
            style={{ 
              width: '100%', 
              padding: '0.5rem', 
              margin: '0.5rem 0',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
          <button 
            onClick={handleCreateTestNotification}
            style={{ 
              padding: '0.5rem 1rem', 
              backgroundColor: '#3b82f6', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            테스트 알림 생성
          </button>
        </div>

        {/* 다양한 테스트 버튼들 */}
        <button 
          onClick={handleTestChatTermination}
          style={{ 
            padding: '0.75rem', 
            backgroundColor: '#f59e0b', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          채팅 종료 알림 테스트
        </button>

        <button 
          onClick={handleRequestChatExtension}
          disabled={isLoading}
          style={{ 
            padding: '0.75rem', 
            backgroundColor: isLoading ? '#9ca3af' : '#10b981', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? '연장 요청 중...' : '실제 채팅방 연장 요청'}
        </button>

        <button 
          onClick={showDifferentNotificationTypes}
          style={{ 
            padding: '0.75rem', 
            backgroundColor: '#8b5cf6', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          다양한 알림 타입 테스트
        </button>

        <button 
          onClick={handleCheckConnection}
          style={{ 
            padding: '0.75rem', 
            backgroundColor: '#6b7280', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          SSE 연결 상태 확인
        </button>

        <button 
          onClick={handleMarkAllNotificationsRead}
          style={{ 
            padding: '0.75rem', 
            backgroundColor: '#ef4444', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          모든 알림 읽음 처리
        </button>

        <button 
          onClick={() => {
            if (window.clearAllNotifications) {
              window.clearAllNotifications();
            }
          }}
          style={{ 
            padding: '0.75rem', 
            backgroundColor: '#dc2626', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          모든 알림 지우기
        </button>

      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
        <h4>사용 가능한 전역 함수:</h4>
        <ul>
          <li><code>window.showNotification(notification)</code> - 알림 표시</li>
          <li><code>window.clearAllNotifications()</code> - 모든 알림 지우기</li>
        </ul>
        
        <h4>백엔드 연동 기능:</h4>
        <ul>
          <li>SSE를 통한 실시간 알림 수신</li>
          <li>채팅 종료 5분 전 자동 알림</li>
          <li>인증 토큰 자동 관리</li>
          <li>연결 끊김 시 자동 재연결</li>
          <li>API 요청을 통한 채팅방/세션 연장</li>
        </ul>
      </div>
    </div>
  );
};

export default NotificationExample;