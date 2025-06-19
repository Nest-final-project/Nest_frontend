import {EventSourcePolyfill} from 'event-source-polyfill';

class NotificationService {
  constructor() {
    this.eventSource = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.listeners = new Map();
    this.isAuthenticated = false;
    this.authToken = null;
    this.lastEventId = '';
  }

  // 인증 정보 설정
  setAuthToken(token) {
    this.authToken = token;
    this.isAuthenticated = !!token;
  }

  // 인증 정보 제거
  clearAuth() {
    this.authToken = null;
    this.isAuthenticated = false;
    this.disconnect();
  }

  // SSE 연결 시작 (Nest_dev 백엔드와 연동)
  connect() {
    if (!this.isAuthenticated || !this.authToken) {
      console.warn('인증되지 않은 사용자입니다. 알림 서비스를 시작할 수 없습니다.');
      return;
    }

    if (this.eventSource) {
      this.disconnect();
    }

    try {
      // 토큰 유효성 먼저 확인
      if (!this.authToken || this.authToken.length < 10) {
        console.error('유효하지 않은 토큰:', this.authToken);
        return;
      }

      // 프록시를 통한 상대 경로 사용 (CORS 문제 회피)
      const url = `/sse/notifications/subscribe`;

      console.log('SSE 연결 시도:', url);
      console.log('사용할 토큰 (전체):', this.authToken);
      console.log('Authorization 헤더:', `Bearer ${this.authToken}`);

      // EventSourcePolyfill을 사용하여 헤더에 Authorization 토큰 전달
      this.eventSource = new EventSourcePolyfill(url, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Last-Event-Id': this.lastEventId || '',
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache'
        },
        withCredentials: true,
        // 연결 시간 초과 설정
        heartbeatTimeout: 120000,
        retryDelay: 3000
      });

      this.eventSource.onopen = (event) => {
        console.log('SSE 알림 연결 성공', event);
        this.reconnectAttempts = 0;
        this.notifyListeners('connection', {status: 'connected'});
      };

      this.eventSource.onmessage = (event) => {
        try {
          console.log('SSE 메시지 수신:', event);
          const notification = JSON.parse(event.data);
          this.lastEventId = event.lastEventId || '';
          this.handleNotification(notification);
        } catch (error) {
          console.error('알림 데이터 파싱 오류:', error);
        }
      };

      // 채팅 종료 알림 전용 이벤트 리스너 (백엔드에서 'chat-termination' 이벤트 발송)
      this.eventSource.addEventListener('chat-termination', (event) => {
        try {
          console.log('채팅 종료 알림 수신:', event);
          const notification = JSON.parse(event.data);
          this.lastEventId = event.lastEventId || '';
          this.handleChatTerminationNotification(notification);
        } catch (error) {
          console.error('채팅 종료 알림 파싱 오류:', error);
        }
      });

      this.eventSource.onerror = (error) => {
        console.error('SSE 연결 오류:', error);
        console.error('오류 세부사항:', {
          readyState: this.eventSource?.readyState,
          url: url,
          token: this.authToken ? this.authToken.substring(0, 50) + '...' : 'none',
          headers: {
            'Authorization': this.authToken ? 'Bearer ***' : 'none',
            'Last-Event-Id': this.lastEventId || 'none'
          }
        });
        this.handleConnectionError();
      };

    } catch (error) {
      console.error('SSE 연결 실패:', error);
      this.handleConnectionError();
    }
  }

  // SSE 연결 종료
  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      this.notifyListeners('connection', {status: 'disconnected'});
    }
  }

  // 연결 오류 처리 및 재연결
  handleConnectionError() {
    if (!this.isAuthenticated) {
      console.log('인증되지 않은 상태로 재연결하지 않습니다.');
      return;
    }

    // 인증 실패인 경우 (401, 403 등) 즉시 알림
    if (this.eventSource && this.eventSource.readyState === 2) { // EventSource.CLOSED = 2
      console.error('인증 실패로 SSE 연결이 거부되었습니다.');
      this.notifyListeners('notification', {
        id: `auth_error_${Date.now()}`,
        type: 'error',
        title: '인증 실패',
        message: '알림 서비스 인증에 실패했습니다. 다시 로그인해주세요.',
        timestamp: new Date().toISOString(),
        actions: [
          {
            label: '다시 로그인',
            type: 'primary',
            onClick: () => {
              // 로그인 페이지로 이동하거나 로그인 모달 열기
              window.location.reload();
            }
          },
          {
            label: '닫기',
            type: 'secondary',
            onClick: () => {}
          }
        ]
      });
      return;
    }

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

      console.log(
          `SSE 재연결 시도 ${this.reconnectAttempts}/${this.maxReconnectAttempts} (${delay}ms 후)`);

      this.notifyListeners('connection', {status: 'reconnecting'});

      setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      console.error('SSE 재연결 시도 횟수 초과');
      this.notifyListeners('connection', {status: 'failed'});
      
      // 재연결 실패 알림
      this.notifyListeners('notification', {
        id: `connection_failed_${Date.now()}`,
        type: 'error',
        title: '연결 실패',
        message: '실시간 알림 서비스에 연결할 수 없습니다.',
        timestamp: new Date().toISOString(),
        actions: [
          {
            label: '다시 시도',
            type: 'primary',
            onClick: () => {
              this.reconnectAttempts = 0;
              this.connect();
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
  }

  // 백엔드에서 받은 일반 알림 처리
  handleNotification(notification) {
    const processedNotification = {
      id: `notification_${Date.now()}`,
      type: 'info',
      title: '알림',
      message: notification.content,
      timestamp: notification.createdAt,
      actions: [
        {
          label: '확인',
          type: 'secondary',
          onClick: () => {
          }
        }
      ]
    };

    this.notifyListeners('notification', processedNotification);
  }

  // 채팅 종료 알림 처리 (백엔드에서 5분 전 알림)
  handleChatTerminationNotification(notification) {
    const chatTerminationNotification = {
      id: `chat_termination_${Date.now()}`,
      type: 'warning',
      title: '채팅 종료 알림',
      message: notification.content || '채팅 종료까지 5분 남았습니다.',
      timestamp: notification.createdAt,
      actions: [
        {
          label: '연장 요청',
          type: 'primary',
          onClick: () => this.requestChatExtension()
        },
        {
          label: '확인',
          type: 'secondary',
          onClick: () => {
          }
        }
      ]
    };

    this.notifyListeners('notification', chatTerminationNotification);
  }

  // 채팅 연장 요청
  async requestChatExtension() {
    try {
      const response = await fetch(`/api/chatrooms/extend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`
        },
        body: JSON.stringify({
          extensionMinutes: 15
        })
      });

      if (response.ok) {
        const result = await response.json();
        this.notifyListeners('notification', {
          id: `extension_${Date.now()}`,
          type: 'success',
          title: '연장 요청 완료',
          message: '채팅방 연장 요청이 전송되었습니다.',
          timestamp: new Date().toISOString()
        });
        return result;
      } else {
        throw new Error('연장 요청 실패');
      }
    } catch (error) {
      console.error('채팅 연장 요청 오류:', error);
      this.notifyListeners('notification', {
        id: `extension_error_${Date.now()}`,
        type: 'error',
        title: '연장 요청 실패',
        message: '연장 요청 중 오류가 발생했습니다. 다시 시도해주세요.',
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  // 세션 연장 요청 (예약 시스템용)
  async requestSessionExtension(sessionId) {
    try {
      const response = await fetch(`/api/reservations/extend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`
        },
        body: JSON.stringify({
          reservationId: sessionId,
          extensionMinutes: 15
        })
      });

      if (response.ok) {
        const result = await response.json();
        this.notifyListeners('notification', {
          id: `session_extension_${Date.now()}`,
          type: 'success',
          title: '세션 연장 완료',
          message: '멘토링 세션이 15분 연장되었습니다.',
          timestamp: new Date().toISOString()
        });
        return result;
      } else {
        throw new Error('세션 연장 실패');
      }
    } catch (error) {
      console.error('세션 연장 요청 오류:', error);
      this.notifyListeners('notification', {
        id: `session_extension_error_${Date.now()}`,
        type: 'error',
        title: '세션 연장 실패',
        message: '세션 연장 중 오류가 발생했습니다. 다시 시도해주세요.',
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  // 채팅방 열기
  openChat(chatId) {
    // 실제로는 라우터나 상태 관리를 통해 채팅방으로 이동
    window.location.hash = `#chat/${chatId}`;
  }

  // 이벤트 리스너 등록
  addEventListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  // 이벤트 리스너 제거
  removeEventListener(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // 리스너들에게 알림
  notifyListeners(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('리스너 실행 오류:', error);
        }
      });
    }
  }

  // 개발 환경에서 테스트용 알림 생성
  createTestNotifications() {
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    // 5초 후 일반 알림 테스트
    setTimeout(() => {
      this.handleNotification({
        content: '테스트 알림입니다.',
        createdAt: new Date().toISOString()
      });
    }, 3000);

    // 8초 후 채팅 종료 알림 테스트
    setTimeout(() => {
      this.handleChatTerminationNotification({
        content: '채팅 종료까지 5분 남았습니다.',
        createdAt: new Date().toISOString()
      });
    }, 8000);
  }
}

// 싱글톤 인스턴스 생성
const notificationService = new NotificationService();

export default notificationService;
