// STOMP WebSocket 서비스 - useWebSocket 훅과 호환되는 버전
import { Client } from '@stomp/stompjs';
import { accessTokenUtils } from '../utils/tokenUtils';

class WebSocketService {
  constructor() {
    this.stompClient = null;
    this.isConnectedState = false;
    this.messageHandlers = new Map(); // callbackId -> callback 매핑
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 1000;
    this.heartbeatInterval = null;
    this.connectionPromise = null;
  }

  // 연결 상태 확인
  isConnected() {
    return this.isConnectedState && this.stompClient && this.stompClient.connected;
  }

  // STOMP WebSocket 연결
  connect() {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        const token = accessTokenUtils.getAccessToken();
        if (!token) {
          console.error('❌ JWT 토큰이 없습니다 - WebSocket 연결 중단');
          reject(new Error('토큰이 없습니다'));
          return;
        }

        // JWT 토큰 만료 확인
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const expTime = payload.exp * 1000; // seconds to milliseconds
          const currentTime = Date.now();
          
          if (expTime < currentTime) {
            console.error('❌ JWT 토큰이 만료되었습니다 - WebSocket 연결 중단');
            console.error(`토큰 만료 시간: ${new Date(expTime).toISOString()}`);
            console.error(`현재 시간: ${new Date(currentTime).toISOString()}`);
            reject(new Error('JWT 토큰이 만료되었습니다'));
            return;
          }
          
          console.log('✅ JWT 토큰 유효성 확인 완료');
        } catch (tokenError) {
          console.error('❌ JWT 토큰 파싱 실패 - WebSocket 연결 중단:', tokenError);
          reject(new Error('유효하지 않은 JWT 토큰입니다'));
          return;
        }

        const wsUrl = `${import.meta.env.VITE_WS_URL || 'ws://localhost:8080'}/ws-nest/websocket`;
        console.log('🔌 WebSocket 연결 시도:', wsUrl);
        console.log('🔐 사용할 토큰:', token.substring(0, 20) + '...');
        
        // STOMP 클라이언트 생성
        this.stompClient = new Client({
          brokerURL: wsUrl,
          connectHeaders: {
            'Authorization': `Bearer ${token}`
          },
          debug: (str) => {
            console.log('🔍 STOMP Debug:', str);
          },
          reconnectDelay: 0, // 자동 재연결 비활성화 (수동으로 관리)
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
          // WebSocket 팩토리 설정 (브라우저 호환성)
          webSocketFactory: () => {
            return new WebSocket(wsUrl);
          }
        });

        // 연결 성공 시
        this.stompClient.onConnect = (frame) => {
          console.log('🟢 STOMP WebSocket 연결 성공!');
          console.log('📋 연결 프레임:', frame);
          this.isConnectedState = true;
          this.reconnectAttempts = 0;
          this.connectionPromise = null;
          
          // 개인 메시지 구독
          this.subscribeToPersonalMessages();
          
          resolve();
        };

        // 연결 실패 시
        this.stompClient.onStompError = (frame) => {
          console.error('❌ STOMP 프로토콜 에러:', frame.headers['message']);
          console.error('📝 에러 상세:', frame.body);
          
          // JWT 관련 에러인지 확인
          const errorMessage = frame.headers['message'] || frame.body || '';
          if (errorMessage.includes('JWT') || errorMessage.includes('토큰') || errorMessage.includes('인증')) {
            console.error('🚫 JWT 인증 실패 - 재연결하지 않음');
          }
          
          this.connectionPromise = null;
          reject(new Error(`STOMP Error: ${frame.headers['message']}`));
        };

        // 연결 끊김 시
        this.stompClient.onDisconnect = () => {
          console.log('🔴 STOMP WebSocket 연결 끊김');
          this.isConnectedState = false;
          this.connectionPromise = null;
          // 자동 재연결은 하지 않음 (수동으로 관리)
        };

        // WebSocket 레벨 에러 시
        this.stompClient.onWebSocketError = (error) => {
          console.error('🔴 WebSocket 레벨 에러:', error);
          console.error('🔗 연결 시도했던 URL:', wsUrl);
          this.connectionPromise = null;
          
          reject(new Error(`WebSocket connection failed to ${wsUrl}`));
        };

        // 연결 시작
        console.log('🚀 STOMP 클라이언트 활성화 중...');
        this.stompClient.activate();

      } catch (error) {
        console.error('🔴 STOMP 클라이언트 생성 실패:', error);
        this.connectionPromise = null;
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  // 개인 메시지 구독
  subscribeToPersonalMessages() {
    if (!this.stompClient || !this.stompClient.connected) {
      console.warn('STOMP 클라이언트가 연결되지 않았습니다');
      return;
    }

    try {
      // 개인 메시지 구독
      this.stompClient.subscribe('/user/queue/message', (message) => {
        try {
          const messageData = JSON.parse(message.body);
          console.log('📨 개인 메시지 수신:', messageData);
          this.handleMessage(messageData);
        } catch (error) {
          console.error('메시지 파싱 실패:', error);
        }
      });
      
      // 개인 오류 메시지 구독
      this.stompClient.subscribe('/user/queue/errors', (message) => {
        try {
          const errorData = JSON.parse(message.body);
          console.error('❌ 서버 오류 메시지 수신:', errorData);
          // 오류 메시지도 핸들러로 전달 (오류 처리용)
          this.handleMessage({
            type: 'ERROR',
            ...errorData
          });
        } catch (error) {
          console.error('오류 메시지 파싱 실패:', error);
        }
      });
      
      console.log('📡 개인 메시지 구독 완료: /user/queue/message');
      console.log('📡 개인 오류 메시지 구독 완료: /user/queue/errors');
    } catch (error) {
      console.error('구독 설정 실패:', error);
    }
  }

  // JWT 토큰에서 사용자 ID 추출
  getCurrentUserId() {
    try {
      const token = accessTokenUtils.getAccessToken();
      if (!token) return null;
      
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub || payload.userId || payload.id;
    } catch (error) {
      console.error('토큰 파싱 실패:', error);
      return null;
    }
  }

  // STOMP WebSocket 연결 해제
  disconnect() {
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.stompClient = null;
    }
    this.isConnectedState = false;
    this.connectionPromise = null;
  }

  // 강제 재연결
  async forceReconnect() {
    this.disconnect();
    await this.connect();
  }

  // 메시지 전송
  async sendMessage(chatRoomId, content) {
    if (!this.isConnected()) {
      throw new Error('STOMP WebSocket이 연결되지 않았습니다');
    }

    try {
      const message = {
        content: content,
        timestamp: new Date().toISOString()
      };

      // STOMP를 통해 특정 채팅방으로 메시지 전송
      this.stompClient.publish({
        destination: `/app/chat_room/${chatRoomId}/message`,
        body: JSON.stringify(message)
      });
      
      console.log(`📤 채팅방 ${chatRoomId}로 STOMP 메시지 전송 완료:`, message);
      return true;
    } catch (error) {
      console.error('📤 STOMP 메시지 전송 실패:', error);
      throw error;
    }
  }

  // 메시지 수신 핸들러 등록
  onMessage(callbackId, callback) {
    this.messageHandlers.set(callbackId, callback);
  }

  // 메시지 수신 핸들러 제거
  offMessage(callbackId) {
    this.messageHandlers.delete(callbackId);
  }

  // 모든 메시지 핸들러에게 메시지 전달
  handleMessage(data) {
    this.messageHandlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error('메시지 핸들러 에러:', error);
      }
    });
  }

  // 자동 재연결 처리 (비활성화)
  handleReconnect() {
    console.log('🚫 자동 재연결이 비활성화되었습니다');
    console.log('💡 채팅방 진입 시 수동으로 연결하거나 페이지를 새로고침하세요');
    return;
  }

  // 디버그 정보 반환 (useWebSocket 훅 호환용)
  getDebugInfo() {
    return {
      isConnected: this.isConnected(),
      reconnectAttempts: this.reconnectAttempts,
      handlersCount: this.messageHandlers.size,
      stompState: this.stompClient ? this.stompClient.state : 'NULL',
      hasClient: !!this.stompClient
    };
  }

  // 새로운 메서드들 추가 (useWebSocket 훅 호환용)
  getConnectionStatus() {
    return {
      connected: this.isConnected(),
      authenticationFailed: false, // 기존 서비스에서는 미구현
      lastTokenError: null,
      reconnectAttempts: this.reconnectAttempts,
      isManualDisconnect: false
    };
  }

  // 이벤트 에미터 구현 (간단 버전)
  listeners = new Map();

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // 호환성을 위한 빈 메서드들
  reconnectWithNewToken() {
    console.error('🚫 reconnectWithNewToken 기능이 비활성화되었습니다');
    return Promise.reject(new Error('Feature disabled'));
  }

  resetAuthenticationState() {
    console.log('🔓 인증 상태 리셋 (기존 서비스에서는 미구현)');
  }
}

// 싱글톤 인스턴스
const websocketService = new WebSocketService();
export default websocketService;
