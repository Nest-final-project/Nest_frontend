import { useEffect, useCallback, useRef, useState } from 'react';
import websocketService from '../services/websocketService';

export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const callbackIdRef = useRef(null);

  const updateConnectionStatus = useCallback(() => {
    setIsConnected(websocketService.isConnected());
  }, []);

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

  const disconnect = useCallback(() => {
    websocketService.disconnect();
    setIsConnected(false);
    console.log('🔌 WebSocket 연결 해제');
  }, []);

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

  useEffect(() => {
    return () => {
      if (callbackIdRef.current) {
        websocketService.offMessage(callbackIdRef.current);
      }
    };
  }, []);

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

export const useChatRoom = (chatRoomId) => {
  const [messages, setMessages] = useState([]);
  const { isConnected, connectionError, connect, sendMessage: wsSendMessage, onMessage } = useWebSocket();

  const addMessage = useCallback((message) => {
    setMessages(prev => [...prev, {
      ...message,
      id: message.id || `${Date.now()}-${Math.random()}`,
      timestamp: message.sentAt || new Date().toISOString()
    }]);
  }, []);

  const sendMessage = useCallback(async (content) => {
    if (!chatRoomId || !content?.trim()) {
      console.warn('채팅방 ID와 메시지 내용이 필요합니다.');
      return false;
    }

    // WebSocket이 연결되지 않은 경우 먼저 연결 시도
    if (!isConnected) {
      console.log('🔌 WebSocket이 연결되지 않음 - 연결 시도...');
      try {
        await connect();
        // 연결 후 메시지 전송
        return await wsSendMessage(chatRoomId, content.trim());
      } catch (error) {
        console.error('❌ WebSocket 연결 실패:', error);
        return false;
      }
    }

    return await wsSendMessage(chatRoomId, content.trim());
  }, [chatRoomId, wsSendMessage, isConnected, connect]);

  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = onMessage((messageData) => {
      console.log('📨 메시지 수신:', messageData);
      addMessage(messageData);
    });

    return unsubscribe;
  }, [isConnected, onMessage, addMessage]);

  // 채팅방 진입 시 자동 WebSocket 연결
  useEffect(() => {
    if (chatRoomId && !isConnected) {
      console.log('📱 채팅방 진입 - WebSocket 연결 시도...');
      connect().catch(error => {
        console.error('❌ 채팅방 WebSocket 연결 실패:', error);
      });
    }
  }, [chatRoomId, isConnected, connect]);

  return {
    messages,
    sendMessage,
    addMessage,
    isConnected,
    connectionError,
    connect,
    chatRoomId
  };
};
