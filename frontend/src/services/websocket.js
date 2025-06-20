import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { authAPI } from './api';


class WebSocketService {
  constructor() {
    this.stompClient = null;
    this.connected = false;
    this.reconnectInterval = 5000;
    this.maxReconnectAttempts = 5;
    this.reconnectAttempts = 0;
    this.listeners = new Map();
    this.subscriptions = new Map();
  }

  async connect() {
    try {
      // 토큰 API가 있다면 사용, 없으면 기본 연결
      let socketToken = '';
      try {
        const res = await authAPI.refresh(); // 또는 적절한 토큰 획득 API
        socketToken = res.data.token;
      } catch (error) {
        console.warn('Could not get socket token, using direct connection');
      }

      const socketUrl = socketToken ? `/ws-nest?token=${socketToken}` : '/ws-nest';
      const socket = new SockJS(socketUrl);

      this.stompClient = new Client({
        webSocketFactory: () => socket,
        debug: false,
        reconnectDelay: 0,
        onConnect: (frame) => {
          console.log('STOMP connected:', frame);
          this.connected = true;
          this.reconnectAttempts = 0;
        },
        onStompError: (frame) => {
          console.error('STOMP error:', frame.headers['message']);
          if (frame.body) console.error('Detail:', frame.body);
        },
        onWebSocketClose: (event) => {
          this.connected = false;
          console.warn('WebSocket disconnected:', event.code, event.reason);
          if (!event.wasClean) {
            this.handleReconnect();
          }
        },
        onWebSocketError: (event) => {
          console.error('WebSocket error:', event);
        },
      });

      this.stompClient.activate();
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      this.handleReconnect();
    }
  }

  setupEventListeners() {
    if (!this.socket) return;

    this.socket.onopen = (event) => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.emit('connected', event);
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.emit('message', data);
        
        // 메시지 타입별 처리
        if (data.type) {
          this.emit(data.type, data);
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.socket.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason);
      this.emit('disconnected', event);
      
      if (!event.wasClean) {
        this.handleReconnect();
      }
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.emit('error', error);
    };
  }

  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectInterval);
    } else {
      console.error('Max reconnection attempts reached');
      this.emit('maxReconnectAttemptsReached');
    }
  }

  send(destination, payload) {
    if (this.connected && this.stompClient) {
      this.stompClient.publish({
        destination,
        body: JSON.stringify(payload),
      });
    } else {
      console.warn('STOMP client not connected');
    }
  }

  // 채팅 메시지 전송
  sendChatMessage(destination,payload) {
    if (this.connected && this.stompClient) {
      this.stompClient.publish({
        destination,
        body: JSON.stringify(payload),
      });
    } else {
      console.warn('STOMP client not connected');
    }
  }

  subscribe(destination, callback) {
    if (!this.connected || !this.stompClient) return;
    const subscription = this.stompClient.subscribe(destination, (message) => {
      const body = JSON.parse(message.body);
      callback(body);
    });
    this.subscriptions.set(destination, subscription);
  }


  // 채팅방 입장
  joinChatroom(chatroomId) {
    this.send({
      type: 'JOIN_CHATROOM',
      chatroomId,
      timestamp: new Date().toISOString()
    });
  }

  // 채팅방 나가기
  leaveChatroom(chatroomId) {
    this.send({
      type: 'LEAVE_CHATROOM',
      chatroomId,
      timestamp: new Date().toISOString()
    });
  }

  // 타이핑 상태 전송
  sendTypingStatus(chatroomId, isTyping) {
    this.send({
      type: 'TYPING_STATUS',
      chatroomId,
      isTyping,
      timestamp: new Date().toISOString()
    });
  }

  // 이벤트 리스너 등록
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  // 이벤트 리스너 제거
  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // 이벤트 발생
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

  // 연결 종료
  disconnect() {
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.stompClient = null;
      this.connected = false;
    }
  }

  // 연결 상태 확인
  isConnected() {
    return this.socket && this.socket.readyState === WebSocket.OPEN;
  }
}

// 싱글톤 인스턴스 생성
const webSocketService = new WebSocketService();

export default webSocketService;
