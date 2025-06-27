// WebSocket 디버깅 도구
import websocketService from '../services/websocketService';
import { accessTokenUtils } from './tokenUtils';

/**
 * WebSocket 연결 상태 디버깅
 */
export const debugWebSocket = () => {
  console.group('🔍 WebSocket 디버깅 정보');
  
  const debugInfo = websocketService.getDebugInfo();
  console.log('📊 연결 상태:', debugInfo.isConnected ? '✅ 연결됨' : '❌ 연결 안됨');
  console.log('📊 STOMP 상태:', debugInfo.stompState);
  console.log('📊 STOMP 연결됨:', debugInfo.stompConnected ? '✅' : '❌');
  console.log('📊 메시지 핸들러 수:', debugInfo.handlersCount);
  console.log('📊 활성 구독 수:', debugInfo.subscriptionsCount);
  console.log('📊 재연결 시도:', debugInfo.reconnectAttempts);
  console.log('📊 클라이언트 존재:', debugInfo.hasClient ? '✅' : '❌');
  
  const token = accessTokenUtils.getAccessToken();
  console.log('🔐 JWT 토큰:', token ? '✅ 있음' : '❌ 없음');
  
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      console.log('🔐 토큰 만료 시간:', new Date(payload.exp * 1000));
      console.log('🔐 토큰 유효:', currentTime < payload.exp ? '✅' : '❌ 만료됨');
      console.log('🔐 사용자 ID:', payload.sub || payload.userId || payload.id);
    } catch (error) {
      console.log('🔐 토큰 파싱 실패:', error.message);
    }
  }
  
  // WebSocket 토큰 정보
  console.log('🔐 WebSocket 토큰:', debugInfo.websocketToken ? '✅ 있음' : '❌ 없음');
  
  // STOMP 상태 설명
  const stompStates = {
    0: 'CONNECTING',
    1: 'OPEN', 
    2: 'CLOSING',
    3: 'CLOSED'
  };
  console.log('📊 STOMP 상태 설명:', stompStates[debugInfo.stompState] || '알 수 없음');
  
  console.groupEnd();
  
  return debugInfo;
};

/**
 * 실시간 WebSocket 메시지 모니터링
 */
export const monitorWebSocketMessages = (enable = true) => {
  if (enable) {
    const callbackId = 'debug-monitor';
    websocketService.onMessage(callbackId, (messageData) => {
      console.group('📨 실시간 메시지 수신');
      console.log('메시지 ID:', messageData.id || messageData.messageId);
      console.log('내용:', messageData.content);
      console.log('채팅방 ID:', messageData.chatRoomId);
      console.log('발신자 ID:', messageData.senderId);
      console.log('내 메시지:', messageData.mine ? '✅' : '❌');
      console.log('전체 데이터:', messageData);
      console.groupEnd();
    });
    console.log('✅ WebSocket 메시지 모니터링 시작');
    return () => websocketService.offMessage(callbackId);
  } else {
    websocketService.offMessage('debug-monitor');
    console.log('❌ WebSocket 메시지 모니터링 중지');
  }
};

/**
 * WebSocket 강제 재연결
 */
export const forceReconnectWebSocket = async () => {
  console.log('🔄 WebSocket 강제 재연결 시작...');
  try {
    await websocketService.forceReconnect();
    console.log('✅ WebSocket 재연결 성공');
    debugWebSocket();
  } catch (error) {
    console.error('❌ WebSocket 재연결 실패:', error);
  }
};

/**
 * 테스트 메시지 전송
 */
export const sendTestMessage = async (chatRoomId, content = '🧪 테스트 메시지') => {
  console.log(`📤 테스트 메시지 전송: 채팅방 ${chatRoomId}`);
  try {
    await websocketService.sendMessage(chatRoomId, content);
    console.log('✅ 테스트 메시지 전송 성공');
  } catch (error) {
    console.error('❌ 테스트 메시지 전송 실패:', error);
  }
};

/**
 * WebSocket 연결 강제 종료
 */
export const disconnectWebSocket = () => {
  console.log('🔌 WebSocket 연결 강제 종료...');
  websocketService.disconnect();
  console.log('✅ WebSocket 연결 종료 완료');
};

/**
 * WebSocket 구독 상태 확인
 */
export const checkWebSocketSubscriptions = () => {
  console.group('📡 WebSocket 구독 상태 확인');
  
  if (!websocketService.stompClient) {
    console.log('❌ STOMP 클라이언트가 존재하지 않음');
    console.groupEnd();
    return;
  }
  
  if (!websocketService.stompClient.connected) {
    console.log('❌ STOMP 클라이언트가 연결되지 않음');
    console.log('📊 현재 상태:', websocketService.stompClient.state);
    console.groupEnd();
    return;
  }
  
  const subscriptions = websocketService.stompClient.subscriptions;
  
  if (!subscriptions) {
    console.log('❌ 구독 객체가 존재하지 않음');
    console.groupEnd();
    return;
  }
  
  const subscriptionKeys = Object.keys(subscriptions);
  console.log('📊 활성 구독 수:', subscriptionKeys.length);
  
  if (subscriptionKeys.length === 0) {
    console.log('⚠️ 활성 구독이 없습니다!');
    console.log('💡 window.wsResubscribe()를 실행해보세요.');
  } else {
    console.log('✅ 활성 구독들:');
    subscriptionKeys.forEach((id, index) => {
      const subscription = subscriptions[id];
      console.log(`${index + 1}. 구독 ID: ${id}`, {
        destination: subscription.destination,
        ack: subscription.ack,
        headers: subscription.headers || {}
      });
    });
  }
  
  // STOMP 클라이언트의 추가 정보
  console.log('📊 STOMP 클라이언트 상태:', {
    state: websocketService.stompClient.state,
    connected: websocketService.stompClient.connected,
    url: websocketService.stompClient.brokerURL,
    hasWebSocket: !!websocketService.stompClient.webSocket
  });
  
  console.groupEnd();
};

/**
 * 수동으로 메시지 구독 재설정
 */
export const resubscribeWebSocket = () => {
  console.log('🔄 WebSocket 구독 재설정...');
  
  if (websocketService.stompClient && websocketService.stompClient.connected) {
    websocketService.subscribeToPersonalMessages();
    console.log('✅ 구독 재설정 완료');
  } else {
    console.log('❌ WebSocket이 연결되지 않음');
  }
};

/**
 * 개발자 도구에 디버깅 함수들 등록
 */
export const registerDebugFunctions = () => {
  if (typeof window !== 'undefined') {
    // 개발 환경 확인을 더 유연하게
    const isDev = import.meta.env.VITE_NODE_ENV === 'development' || 
                  import.meta.env.DEV || 
                  window.location.hostname === 'localhost';
    
    if (isDev) {
      window.wsDebug = debugWebSocket;
      window.wsMonitor = monitorWebSocketMessages;
      window.wsReconnect = forceReconnectWebSocket;
      window.wsDisconnect = disconnectWebSocket;
      window.wsSendTest = sendTestMessage;
      window.wsCheckSubs = checkWebSocketSubscriptions;
      window.wsResubscribe = resubscribeWebSocket;
      window.wsService = websocketService;
      
      console.log('🛠️ WebSocket 디버깅 함수가 등록되었습니다:');
      console.log('- window.wsDebug() : WebSocket 상태 확인');
      console.log('- window.wsMonitor(true/false) : 메시지 모니터링 시작/중지');
      console.log('- window.wsReconnect() : 강제 재연결');
      console.log('- window.wsDisconnect() : 강제 연결 해제');
      console.log('- window.wsSendTest(chatRoomId, content) : 테스트 메시지 전송');
      console.log('- window.wsCheckSubs() : 구독 상태 확인');
      console.log('- window.wsResubscribe() : 구독 재설정');
      console.log('- window.wsService : WebSocket 서비스 객체');
    }
  }
};

// 자동 등록
registerDebugFunctions();
