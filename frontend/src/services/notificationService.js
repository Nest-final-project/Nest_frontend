import { EventSourcePolyfill } from 'event-source-polyfill';
import { accessTokenUtils } from '../utils/tokenUtils';

class NotificationService {
  constructor() {
    this.eventSource = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.listeners = new Map();
  }

  // SSE 연결 시작
  connect() {
    if (this.eventSource) {
      this.disconnect();
    }

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
      const sseUrl = `${baseUrl}/sse/notifications/subscribe`;
      
      // JWT 토큰을 Authorization 헤더에 포함
      const accessToken = accessTokenUtils.getAccessToken();
      const headers = {};
      
      console.log('=== SSE 연결 디버깅 정보 ===');
      console.log('baseUrl:', baseUrl);
      console.log('sseUrl:', sseUrl);
      console.log('원본 accessToken:', accessToken);
      console.log('accessToken 타입:', typeof accessToken);
      console.log('accessToken 길이:', accessToken?.length);
      
      if (accessToken) {
        // Bearer 접두사가 이미 포함되어 있는지 확인
        if (accessToken.startsWith('Bearer ')) {
          headers.Authorization = accessToken;
        } else {
          headers.Authorization = `Bearer ${accessToken}`;
        }
        console.log('최종 Authorization 헤더:', headers.Authorization);
        console.log('토큰 앞부분:', headers.Authorization.substring(0, 50) + '...');
      } else {
        console.warn('⚠️ Access token이 없어 SSE 연결 시도 (인증 없이)');
      }
      
      console.log('전송할 헤더들:', headers);
      console.log('========================');
      
      // EventSourcePolyfill을 사용하여 헤더 포함 가능
      this.eventSource = new EventSourcePolyfill(sseUrl, {
        headers: headers,
        heartbeatTimeout: 180000, // 3분으로 heartbeat 타임아웃 증가
        connectionTimeout: 60000   // 1분 연결 타임아웃
      });

      this.eventSource.onopen = () => {
        console.log('SSE 연결 성공');
        this.reconnectAttempts = 0;
        this.notifyListeners('connection', { status: 'connected' });
      };

      this.eventSource.onmessage = (event) => {
        try {
          const notification = JSON.parse(event.data);
          this.handleNotification(notification);
        } catch (error) {
          console.error('알림 데이터 파싱 오류:', error);
        }
      };

      this.eventSource.onerror = (error) => {
        console.error('SSE 연결 오류:', error);
        console.error('EventSource readyState:', this.eventSource?.readyState);
        console.error('EventSource url:', this.eventSource?.url);
        
        // 연결 상태에 따른 상세 로그
        if (this.eventSource) {
          switch (this.eventSource.readyState) {
            case EventSource.CONNECTING:
              console.log('SSE 상태: 연결 중...');
              break;
            case EventSource.OPEN:
              console.log('SSE 상태: 연결됨');
              break;
            case EventSource.CLOSED:
              console.log('SSE 상태: 연결 종료됨');
              break;
            default:
              console.log('SSE 상태: 알 수 없음');
          }
        }
        
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
      this.notifyListeners('connection', { status: 'disconnected' });
    }
  }

  // 연결 오류 처리 및 재연결
  handleConnectionError() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`SSE 재연결 시도 ${this.reconnectAttempts}/${this.maxReconnectAttempts} (${delay}ms 후)`);
      
      setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      console.error('SSE 재연결 시도 횟수 초과');
      this.notifyListeners('connection', { status: 'failed' });
    }
  }

  // 알림 처리
  handleNotification(notification) {
    // 알림 타입별 처리
    switch (notification.type) {
      case 'session_ending':
        this.handleSessionEndingNotification(notification);
        break;
      case 'new_message':
        this.handleNewMessageNotification(notification);
        break;
      case 'system_update':
        this.handleSystemUpdateNotification(notification);
        break;
      default:
        this.notifyListeners('notification', notification);
        break;
    }
  }

  // 세션 종료 5분 전 알림
  handleSessionEndingNotification(notification) {
    const sessionNotification = {
      id: `session_${Date.now()}`,
      type: 'session',
      title: '세션 종료 알림',
      message: `멘토링 세션이 ${notification.remainingMinutes}분 후 종료됩니다. 마무리 준비를 해주세요.`,
      timestamp: new Date().toISOString(),
      actions: [
        {
          label: '연장 요청',
          type: 'primary',
          onClick: () => this.requestSessionExtension(notification.sessionId)
        },
        {
          label: '확인',
          type: 'secondary',
          onClick: () => {}
        }
      ]
    };

    this.notifyListeners('notification', sessionNotification);
  }

  // 새 메시지 알림
  handleNewMessageNotification(notification) {
    const messageNotification = {
      id: `message_${Date.now()}`,
      type: 'chat',
      title: '새 메시지',
      message: `${notification.senderName}님이 새 메시지를 보냈습니다.`,
      timestamp: new Date().toISOString(),
      actions: [
        {
          label: '채팅 보기',
          type: 'primary',
          onClick: () => this.openChat(notification.chatId)
        }
      ]
    };

    this.notifyListeners('notification', messageNotification);
  }

  // 시스템 업데이트 알림
  handleSystemUpdateNotification(notification) {
    const updateNotification = {
      id: `update_${Date.now()}`,
      type: 'info',
      title: '시스템 업데이트',
      message: notification.message || '새로운 기능이 추가되었습니다.',
      timestamp: new Date().toISOString(),
      actions: [
        {
          label: '새로고침',
          type: 'primary',
          onClick: () => window.location.reload()
        },
        {
          label: '나중에',
          type: 'secondary',
          onClick: () => {}
        }
      ]
    };

    this.notifyListeners('notification', updateNotification);
  }

  // 세션 연장 요청
  async requestSessionExtension(sessionId) {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
      const accessToken = accessTokenUtils.getAccessToken();
      
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (accessToken) {
        if (accessToken.startsWith('Bearer ')) {
          headers.Authorization = accessToken;
        } else {
          headers.Authorization = `Bearer ${accessToken}`;
        }
      }
      
      const response = await fetch(`${baseUrl}/api/sessions/extend`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ sessionId, extensionMinutes: 15 })
      });

      if (response.ok) {
        const result = await response.json();
        this.notifyListeners('notification', {
          id: `extension_${Date.now()}`,
          type: 'success',
          title: '연장 요청 완료',
          message: '멘토에게 연장 요청이 전송되었습니다.',
          timestamp: new Date().toISOString()
        });
      } else {
        throw new Error('연장 요청 실패');
      }
    } catch (error) {
      console.error('세션 연장 요청 오류:', error);
      this.notifyListeners('notification', {
        id: `extension_error_${Date.now()}`,
        type: 'error',
        title: '연장 요청 실패',
        message: '연장 요청 중 오류가 발생했습니다. 다시 시도해주세요.',
        timestamp: new Date().toISOString()
      });
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

  // 테스트용 알림 생성 (개발 환경에서만)
  createTestNotifications() {
    if ('development') return;

    // 5초 후 세션 종료 알림
    setTimeout(() => {
      this.handleNotification({
        type: 'session_ending',
        remainingMinutes: 5,
        sessionId: 'test_session_123'
      });
    }, 3000);

    // 8초 후 새 메시지 알림
    setTimeout(() => {
      this.handleNotification({
        type: 'new_message',
        senderName: '김개발',
        chatId: 'chat_123'
      });
    }, 8000);

    // 12초 후 시스템 업데이트 알림
    setTimeout(() => {
      this.handleNotification({
        type: 'system_update',
        message: '새로운 화상통화 기능이 추가되었습니다!'
      });
    }, 12000);
  }
}

// 싱글톤 인스턴스 생성
const notificationService = new NotificationService();

export default notificationService;
