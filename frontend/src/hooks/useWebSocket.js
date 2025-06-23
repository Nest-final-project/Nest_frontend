import { useEffect, useCallback, useRef, useState } from 'react';
import websocketService from '../services/websocketService';

/**
 * WebSocket 연결 및 메시지 처리를 위한 커스텀 훅
 */
export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const callbackIdRef = useRef(null);

  // 연결 상태 업데이트
  const updateConnectionStatus = useCallback(() => {
    setIsConnected(websocketService.isConnected());
  }, []);

  // 웹소켓 연결
  const connect = useCallback(async () => {
    try {
      setConnectionError(null);
      await websocketService.connect();
      setIsConnected(true);
      console.log('✅ WebSocket 연결 완료');
    } catch (error) {
      console.error('❌ WebSocket 연결 실패:', error);
      setConnectionError(error.message);
      setIsConnected(false);
    }
  }, []);

  // 웹소켓 연결 해제
  const disconnect = useCallback(() => {
    websocketService.disconnect();
    setIsConnected(false);
    console.log('🔌 WebSocket 연결 해제');
  }, []);

  // 메시지 전송
  const sendMessage = useCallback(async (chatRoomId, content) => {
    try {
      await websocketService.sendMessage(chatRoomId, content);
      console.log('📤 메시지 전송 완료');
      return true;
    } catch (error) {
      console.error('📤 메시지 전송 실패:', error);
      setConnectionError(error.message);
      return false;
    }
  }, []);

  // 강제 재연결
  const reconnect = useCallback(async () => {
    try {
      setConnectionError(null);
      await websocketService.forceReconnect();
      setIsConnected(true);
      console.log('🔄 WebSocket 재연결 완료');
    } catch (error) {
      console.error('🔄 WebSocket 재연결 실패:', error);
      setConnectionError(error.message);
      setIsConnected(false);
    }
  }, []);

  // 메시지 수신 콜백 등록
  const onMessage = useCallback((callback) => {
    if (callbackIdRef.current) {
      websocketService.offMessage(callbackIdRef.current);
    }
    
    const callbackId = `hook-${Date.now()}-${Math.random()}`;
    callbackIdRef.current = callbackId;
    websocketService.onMessage(callbackId, callback);
    
    return () => {
      websocketService.offMessage(callbackId);
      callbackIdRef.current = null;
    };
  }, []);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (callbackIdRef.current) {
        websocketService.offMessage(callbackIdRef.current);
      }
    };
  }, []);

  // 주기적으로 연결 상태 확인
  useEffect(() => {
    const interval = setInterval(updateConnectionStatus, 1000);
    return () => clearInterval(interval);
  }, [updateConnectionStatus]);

  return {
    isConnected,
    connectionError,
    connect,
    disconnect,
    reconnect,
    sendMessage,
    onMessage,
    debugInfo: websocketService.getDebugInfo()
  };
};

/**
 * 특정 채팅방의 메시지를 관리하는 훅
 */
export const useChatRoom = (chatRoomId) => {
  const [messages, setMessages] = useState([]);
  const { isConnected, connect, sendMessage: wsSendMessage, onMessage } = useWebSocket();

  // 메시지 추가
  const addMessage = useCallback((message) => {
    setMessages(prev => [...prev, {
      ...message,
      id: message.id || `${Date.now()}-${Math.random()}`,
      timestamp: message.sentAt || new Date().toISOString()
    }]);
  }, []);

  // 메시지 전송
  const sendMessage = useCallback(async (content) => {
    if (!chatRoomId || !content?.trim()) {
      console.warn('채팅방 ID와 메시지 내용이 필요합니다.');
      return false;
    }

    return await wsSendMessage(chatRoomId, content.trim());
  }, [chatRoomId, wsSendMessage]);

  // 메시지 수신 처리
  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = onMessage((messageData) => {
      console.log('📨 메시지 수신:', messageData);
      addMessage(messageData);
    });

    return unsubscribe;
  }, [isConnected, onMessage, addMessage]);

  // 자동 연결
  useEffect(() => {
    if (!isConnected) {
      connect();
    }
  }, [isConnected, connect]);

  return {
    messages,
    sendMessage,
    addMessage,
    isConnected,
    connect,
    chatRoomId
  };
};
