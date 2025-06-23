// WebSocket 디버깅 도구
import websocketService from '../services/websocketService';
import { accessTokenUtils } from './tokenUtils';

/**
 * WebSocket 연결 상태 디버깅
 */
export const debugWebSocket = () => {
  console.group('🔍 WebSocket 디버깅 정보');
  
  const debugInfo = websocketService.getDebugInfo();
  console.log('연결 상태:', debugInfo.connected ? '✅ 연결됨' : '❌ 연결 안됨');
  console.log('클라이언트 상태:', debugInfo.clientState);
  console.log('구독 수:', debugInfo.subscriptionsCount);
  console.log('콜백 수:', debugInfo.callbacksCount);
  console.log('재연결 시도:', debugInfo.reconnectAttempts);
  
  const token = accessTokenUtils.getAccessToken();
  console.log('JWT 토큰:', token ? '있음' : '없음');
  
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      console.log('토큰 만료 시간:', new Date(payload.exp * 1000));
      console.log('토큰 유효:', currentTime < payload.exp ? '✅' : '❌ 만료됨');
    } catch (error) {
      console.log('토큰 파싱 실패:', error.message);
    }
  }
  
  console.groupEnd();
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
export const sendTestMessage = async (chatRoomId, content = '테스트 메시지') => {
  console.log(`📤 테스트 메시지 전송 시도: 채팅방 ${chatRoomId}`);
  try {
    await websocketService.sendMessage(chatRoomId, content);
    console.log('✅ 테스트 메시지 전송 성공');
  } catch (error) {
    console.error('❌ 테스트 메시지 전송 실패:', error);
  }
};

/**
 * 개발자 도구에 디버깅 함수들 등록
 */
export const registerDebugFunctions = () => {
  if (typeof window !== 'undefined' && import.meta.env.VITE_NODE_ENV === 'development') {
    window.wsDebug = debugWebSocket;
    window.wsReconnect = forceReconnectWebSocket;
    window.wsSendTest = sendTestMessage;
    window.wsService = websocketService;
    
    console.log('🛠️ WebSocket 디버깅 함수가 등록되었습니다:');
    console.log('- window.wsDebug() : WebSocket 상태 확인');
    console.log('- window.wsReconnect() : 강제 재연결');
    console.log('- window.wsSendTest(chatRoomId, content) : 테스트 메시지 전송');
    console.log('- window.wsService : WebSocket 서비스 객체');
  }
};

// 자동 등록 (개발 환경에서만)
if (import.meta.env.VITE_NODE_ENV === 'development') {
  registerDebugFunctions();
}
