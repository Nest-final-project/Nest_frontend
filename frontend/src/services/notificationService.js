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
    
    console.log('🚀 채팅 시작 알림 처리:', { chatRoomId, reservationId });
    
    try {
      // 항상 상세 토스트 표시 (예약 ID가 없어도 기본값으로)
      await this.showChatRoomCreatedNotification(chatRoomId, reservationId);
    } catch (error) {
      console.error('채팅 시작 알림 처리 오류:', error);
      // 오류 시에도 상세 토스트 표시 (기본값으로)
      await this.showChatRoomCreatedNotification(chatRoomId, null);
    }
  }

  // 예약 정보 포함 채팅방 생성 토스트 (상세 토스트만 사용)
  async showChatRoomCreatedNotification(chatRoomId, reservationId = null) {
    console.log('💬 채팅방 생성 토스트 표시 시작:', { chatRoomId, reservationId });
    
    let reservationData = null;
    
    // 예약 ID가 있으면 예약 정보 조회
    if (reservationId) {
      try {
        console.log('🔍 예약 정보 API 호출 중...', reservationId);
        
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
        const accessToken = accessTokenUtils.getAccessToken();
        
        const headers = {};
        if (accessToken) {
          headers.Authorization = accessToken.startsWith('Bearer ') ? accessToken : `Bearer ${accessToken}`;
        }
        
        const response = await fetch(`${baseUrl}/api/reservations/${reservationId}`, {
          headers: headers
        });
        
        console.log('🌐 API 요청 URL:', `${baseUrl}/api/reservations/${reservationId}`);
        console.log('🌐 API 응답 상태:', response.status, response.statusText);
        
        if (response.ok) {
          const data = await response.json();
          reservationData = data.data || data; // API 응답 구조에 따라 조정
          console.log('✅ 예약 정보 조회 성공:', reservationData);
          console.log('🔍 응답 전체 구조:', data);
        } else {
          const errorText = await response.text();
          console.warn('⚠️ 예약 정보 조회 실패:', response.status, response.statusText);
          console.warn('⚠️ 오류 응답 내용:', errorText);
        }
      } catch (error) {
        console.error('❌ 예약 정보 조회 실패:', error);
      }
    }

    // 항상 상세 토스트 표시 (예약 정보가 실제로 조회되어야 함)
    console.log('🎨 상세 토스트 생성 중...');
    
    const detailedNotification = {
      id: `chat_created_${Date.now()}`,
      type: 'success',
      style: 'detailed',
      title: '멘토링 채팅방이 준비되었습니다!',
      chatRoomId: chatRoomId,
      timestamp: new Date().toISOString(),
      reservationData: {
        // 백엔드 응답 구조에 맞게 수정
        mentorName: reservationData?.mentorName || `멘토 ID: ${reservationData?.mentor}` || '멘토 정보 없음',
        serviceName: reservationData?.serviceName || reservationData?.ticketName || `티켓 ID: ${reservationData?.ticket}` || '서비스 정보 없음',
        date: reservationData?.date || reservationData?.reservationStartAt?.split(' ')[0] || null,
        startTime: reservationData?.startTime || reservationData?.reservationStartAt?.split(' ')[1]?.substring(0, 5) || null,
        endTime: reservationData?.endTime || reservationData?.reservationEndAt?.split(' ')[1]?.substring(0, 5) || null
      },
      actionText: '멘토링 시작하기'
    };
    
    console.log('✅ 상세 토스트 표시:', detailedNotification);
    console.log('🔍 API 응답 원본 데이터:', reservationData);
    this.notifyListeners('notification', detailedNotification);
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

// 🚨 디버깅용 테스트 함수들
window.testChatRoomNotification = () => {
  console.log('🧪 채팅방 생성 알림 테스트 시작');
  // 숫자 타입으로 전달 (백엔드에서 Long 타입 요구)
  notificationService.showChatRoomCreatedNotification('test_chat_123', 119);
};

window.testSSEConnection = () => {
  console.log('🔌 SSE 연결 상태:', notificationService.isServiceConnected());
  console.log('🔌 SSE ReadyState:', sseService.getReadyState());
  console.log('🔌 EventSource States: CONNECTING=0, OPEN=1, CLOSED=2');
};

window.testChatOpenEvent = () => {
  console.log('🧪 chat-open 이벤트 시뮬레이션');
  notificationService.handleChatStartNotification({
    chatRoomId: 'test_123',
    reservationId: 119  // 숫자로 전달
  });
};

export default notificationService;