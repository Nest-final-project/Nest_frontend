import sseService from './sseService';
import { accessTokenUtils } from '../utils/tokenUtils';

class NotificationService {
  constructor() {
    this.listeners = new Map();
    this.isConnected = false;
  }

  // SSE 연결 시작
  connect() {
    const accessToken = accessTokenUtils.getAccessToken();
    
    console.log('=== 알림 서비스 연결 시작 ===');
    console.log('Access Token 존재:', !!accessToken);
    console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL);
    console.log('SSE Endpoint:', import.meta.env.VITE_SSE_ENDPOINT || '/sse/notifications/subscribe');
    
    if (!accessToken) {
      console.warn('❌ Access token이 없어 알림 서비스 연결 불가');
      this.notifyListeners('connection', { status: 'failed', reason: 'no_token' });
      return;
    }

    // SSE 서비스를 사용하여 연결
    sseService.connect(
      accessToken,
      this.handleMessage.bind(this), // 메시지 수신 콜백
      this.handleError.bind(this),   // 에러 콜백
      this.handleOpen.bind(this)     // 연결 성공 콜백
    );
  }

  // SSE 연결 종료
  disconnect() {
    sseService.disconnect();
    this.isConnected = false;
    this.notifyListeners('connection', { status: 'disconnected' });
  }

  // 연결 성공 처리
  handleOpen(event) {
    console.log('✅ 알림 서비스 연결 성공');
    this.isConnected = true;
    this.notifyListeners('connection', { status: 'connected' });
  }

  // 메시지 수신 처리
  handleMessage(event) {
    console.log('📨 알림 메시지 수신:', event);
    
    try {
      // 특별한 이벤트 타입이 있는 경우 처리
      if (event.eventType === 'chat-termination') {
        console.log('🔥 채팅 종료 알림 처리');
        const notificationData = event.parsedData || JSON.parse(event.data);
        this.handleChatTerminationNotification(notificationData);
        return;
      }

      if (event.eventType === 'chat-open') {
        console.log('🚀 채팅 시작 알림 처리');
        const notificationData = event.parsedData || JSON.parse(event.data);
        this.handleChatStartNotification(notificationData);
        return;
      }

      // 일반 메시지 처리
      const notification = JSON.parse(event.data);
      console.log('📄 일반 알림 처리:', notification);
      this.handleNotification(notification);
    } catch (error) {
      console.error('❌ 알림 데이터 파싱 오류:', error, event);
    }
  }

  // 에러 처리
  handleError(event) {
    console.error('❌ 알림 서비스 연결 오류:', event);
    this.isConnected = false;
    
    // SSE 서비스가 재연결을 처리하므로 여기서는 상태만 업데이트
    if (!sseService.isConnected()) {
      this.notifyListeners('connection', { status: 'error' });
    }
  }

  // 알림 처리
  handleNotification(notification) {
    // 채팅 관련 알림만 처리하도록 제한
    switch (notification.type) {
      case 'chat_termination':
      case 'chat-termination':
        this.handleChatTerminationNotification(notification);
        break;
      case 'chat_start':
      case 'chat-open':
        this.handleChatStartNotification(notification);
        break;
      // 다른 알림 타입들은 주석 처리하여 비활성화
      // case 'session_ending':
      //   this.handleSessionEndingNotification(notification);
      //   break;
      // case 'new_message':
      //   this.handleNewMessageNotification(notification);
      //   break;
      // case 'system_update':
      //   this.handleSystemUpdateNotification(notification);
      //   break;
      default:
        console.log('처리하지 않는 알림 타입:', notification.type);
        // 기본 알림도 비활성화
        // this.notifyListeners('notification', notification);
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

  // 채팅 종료 알림
  handleChatTerminationNotification(notification) {
    const terminationNotification = {
      id: `termination_${Date.now()}`,
      type: 'warning',
      style: 'termination',
      title: '채팅 종료 알림',
      timestamp: notification.createdAt || new Date().toISOString(),
      terminationData: {
        content: notification.content || notification.message || '멘토링 세션이 곧 종료됩니다.',
        endTime: notification.endTime || null // 종료 시간이 있다면 포함
      }
    };

    this.notifyListeners('notification', terminationNotification);
  }

  // 채팅 시작 알림
  async handleChatStartNotification(notification) {
    const chatRoomId = notification.chatRoomId;
    const reservationId = notification.reservationId;
    
    try {
      // 예약 정보가 있으면 상세 토스트 표시
      if (reservationId) {
        await this.showChatRoomCreatedNotification(chatRoomId, reservationId);
      } else {
        // 기본 토스트 표시
        this.showBasicChatStartNotification(chatRoomId, notification);
      }
    } catch (error) {
      console.error('채팅 시작 알림 처리 오류:', error);
      // 오류 시 기본 토스트 표시
      this.showBasicChatStartNotification(chatRoomId, notification);
    }
  }

  // 예약 정보 포함 채팅방 생성 토스트
  async showChatRoomCreatedNotification(chatRoomId, reservationId = null) {
    try {
      let reservationData = null;
      
      // 예약 ID가 있으면 예약 정보 조회
      if (reservationId) {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
        const accessToken = accessTokenUtils.getAccessToken();
        
        const headers = {};
        if (accessToken) {
          headers.Authorization = accessToken.startsWith('Bearer ') ? accessToken : `Bearer ${accessToken}`;
        }
        
        const response = await fetch(`${baseUrl}/api/reservations/${reservationId}`, {
          headers: headers
        });
        
        if (response.ok) {
          reservationData = await response.json();
        }
      }

      // 예약 데이터가 있으면 상세 토스트, 없으면 기본 토스트
      if (reservationData) {
        const detailedNotification = {
          id: `chat_created_${Date.now()}`,
          type: 'success',
          style: 'detailed',
          title: '멘토링 채팅방이 준비되었습니다!',
          chatRoomId: chatRoomId,
          timestamp: new Date().toISOString(),
          reservationData: {
            mentorName: reservationData.mentor?.name || reservationData.mentorName || '멘토',
            serviceName: reservationData.ticket?.name || reservationData.serviceName || '멘토링 서비스',
            date: reservationData.date,
            startTime: reservationData.startTime,
            endTime: reservationData.endTime
          },
          actionText: '멘토링 시작하기'
        };
        
        this.notifyListeners('notification', detailedNotification);
      } else {
        // 기본 토스트
        const basicNotification = {
          id: `chat_created_${Date.now()}`,
          type: 'success',
          style: 'clean',
          title: '채팅방이 생성되었습니다',
          message: '새로운 대화를 시작해보세요',
          chatRoomId: chatRoomId,
          timestamp: new Date().toISOString(),
          actionText: '채팅방 입장'
        };
        
        this.notifyListeners('notification', basicNotification);
      }
    } catch (error) {
      console.error('예약 정보 조회 실패:', error);
      // 실패 시 기본 토스트 표시
      const fallbackNotification = {
        id: `chat_created_${Date.now()}`,
        type: 'success',
        style: 'clean',
        title: '채팅방이 생성되었습니다',
        message: '새로운 대화를 시작해보세요',
        chatRoomId: chatRoomId,
        timestamp: new Date().toISOString(),
        actionText: '채팅방 입장'
      };
      
      this.notifyListeners('notification', fallbackNotification);
    }
  }

  // 기본 채팅 시작 알림
  showBasicChatStartNotification(chatRoomId, notification) {
    const startNotification = {
      id: `chat_start_${Date.now()}`,
      type: 'success',
      title: '상담 시작 알림',
      message: notification.content || notification.message || '상담이 시작되었습니다.',
      timestamp: notification.createdAt || new Date().toISOString(),
      chatRoomId: chatRoomId,
      actions: [
        {
          label: '채팅방으로 이동',
          type: 'primary',
          onClick: () => this.openChatRoom(chatRoomId)
        },
        {
          label: '확인',
          type: 'secondary',
          onClick: () => {}
        }
      ]
    };

    this.notifyListeners('notification', startNotification);
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
  openChatRoom(chatRoomId) {
    // React Router를 사용하여 채팅방으로 이동
    if (chatRoomId) {
      window.location.href = `/chat/${chatRoomId}`;
    } else {
      console.error('채팅방 ID가 없습니다.');
    }
  }

  // 채팅방 열기 (기존 메서드 - 호환성 유지)
  openChat(chatId) {
    this.openChatRoom(chatId);
  }

  // 연결 상태 확인
  isServiceConnected() {
    return sseService.isConnected();
  }

  // 재연결 활성화
  enableReconnect() {
    sseService.enableReconnect();
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

  // 테스트용 알림 생성 (개발 환경에서만) - 비활성화
  createTestNotifications() {
    // 테스트 알림 비활성화 - 채팅 종료 알림만 받도록 함
    console.log('테스트 알림 비활성화됨 - 채팅 종료 알림만 수신');
    return;
    
    if (import.meta.env.MODE !== 'development') return;

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

  // 시간 계산 헬퍼 함수
  calculateDuration(startTime, endTime) {
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
  }
}

// 싱글톤 인스턴스 생성
const notificationService = new NotificationService();

// 글로벌 함수 등록 (다른 곳에서 사용할 수 있도록)
window.showChatRoomCreatedNotification = (chatRoomId, reservationId = null) => {
  return notificationService.showChatRoomCreatedNotification(chatRoomId, reservationId);
};

window.showChatTerminationNotification = (content, endTime = null) => {
  notificationService.handleChatTerminationNotification({
    content: content,
    endTime: endTime,
    createdAt: new Date().toISOString()
  });
};

export default notificationService;