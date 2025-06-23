import { EventSourcePolyfill } from 'event-source-polyfill';

/**
 * SSE(Server-Sent Events) 서비스
 * JWT 토큰을 사용한 인증 기반 실시간 알림 연결
 */
class SSEService {
  constructor() {
    this.eventSource = null;
    this.reconnectInterval = parseInt(import.meta.env.VITE_SSE_RECONNECT_INTERVAL) || 5000; // 5초
    this.maxReconnectAttempts = parseInt(import.meta.env.VITE_SSE_MAX_RECONNECT_ATTEMPTS) || 10;
    this.reconnectAttempts = 0;
    this.isManualClose = false;
  }

  /**
   * SSE 연결 시작
   * @param {string} token - JWT 토큰
   * @param {Function} onMessage - 메시지 수신 콜백
   * @param {Function} onError - 에러 콜백
   * @param {Function} onOpen - 연결 성공 콜백
   * @param {string} lastEventId - 마지막으로 수신한 이벤트 ID (선택사항)
   */
  connect(token, onMessage, onError, onOpen, lastEventId = '') {
    if (this.eventSource) {
      this.disconnect();
    }

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'text/event-stream',
      'Cache-Control': 'no-cache'
    };

    // Last-Event-Id가 있으면 헤더에 추가
    if (lastEventId) {
      headers['Last-Event-Id'] = lastEventId;
    }

    const sseUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}${import.meta.env.VITE_SSE_ENDPOINT || '/sse/notifications/subscribe'}`;

    try {
      this.eventSource = new EventSourcePolyfill(sseUrl, {
        headers: headers,
        heartbeatTimeout: 30000 // 30초 heartbeat
      });

      // 연결 성공
      this.eventSource.onopen = (event) => {
        console.log('SSE 연결 성공:', event);
        this.reconnectAttempts = 0; // 재연결 시도 횟수 초기화
        if (onOpen) onOpen(event);
      };

      // 메시지 수신 (기본 message 이벤트)
      this.eventSource.onmessage = (event) => {
        console.log('SSE 메시지 수신:', event);
        if (onMessage) onMessage(event);
      };

      // 채팅 종료 알림 전용 이벤트 리스너
      this.eventSource.addEventListener('chat-termination', (event) => {
        console.log('채팅 종료 알림 수신:', event);
        try {
          const data = JSON.parse(event.data);
          if (onMessage) onMessage({ ...event, parsedData: data, eventType: 'chat-termination' });
        } catch (error) {
          console.error('채팅 종료 알림 파싱 오류:', error);
          if (onMessage) onMessage({ ...event, eventType: 'chat-termination' });
        }
      });

      // 에러 처리
      this.eventSource.onerror = (event) => {
        console.error('SSE 연결 오류:', event);
        
        if (!this.isManualClose && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(`SSE 재연결 시도 ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
          
          setTimeout(() => {
            if (!this.isManualClose) {
              this.connect(token, onMessage, onError, onOpen, lastEventId);
            }
          }, this.reconnectInterval);
        }
        
        if (onError) onError(event);
      };

    } catch (error) {
      console.error('SSE 연결 생성 실패:', error);
      if (onError) onError(error);
    }
  }

  /**
   * SSE 연결 종료
   */
  disconnect() {
    this.isManualClose = true;
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      console.log('SSE 연결 종료');
    }
    this.reconnectAttempts = 0;
  }

  /**
   * 연결 상태 확인
   * @returns {boolean} 연결 여부
   */
  isConnected() {
    return this.eventSource && this.eventSource.readyState === EventSource.OPEN;
  }

  /**
   * 연결 상태 반환
   * @returns {number} EventSource 상태
   */
  getReadyState() {
    return this.eventSource ? this.eventSource.readyState : EventSource.CLOSED;
  }

  /**
   * 재연결 허용 설정
   */
  enableReconnect() {
    this.isManualClose = false;
  }
}

// 싱글톤 인스턴스 생성
const sseService = new SSEService();

export default sseService;
