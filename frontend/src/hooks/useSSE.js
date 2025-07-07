import { useEffect, useRef, useCallback, useState } from 'react';
import sseService from '../services/sseService';

/**
 * SSE 연결을 관리하는 React Hook
 * @param {string} token - JWT 토큰
 * @param {Object} options - 옵션 객체
 * @param {Function} options.onMessage - 메시지 수신 콜백
 * @param {Function} options.onError - 에러 콜백
 * @param {Function} options.onOpen - 연결 성공 콜백
 * @param {string} options.lastEventId - 마지막으로 수신한 이벤트 ID
 * @param {boolean} options.autoConnect - 자동 연결 여부 (기본값: true)
 * @returns {Object} SSE 연결 관련 상태와 함수들
 */
export const useSSE = (token, options = {}) => {
  const {
    onMessage,
    onError,
    onOpen,
    lastEventId = '',
    autoConnect = true
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState('CLOSED');
  const [lastEventIdState, setLastEventIdState] = useState(lastEventId);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState(null);

  const isInitialized = useRef(false);

  // 메시지 핸들러
  const handleMessage = useCallback((event) => {
    console.log('SSE 메시지 수신:', event);
    
    // Last-Event-Id 업데이트
    if (event.lastEventId) {
      setLastEventIdState(event.lastEventId);
    }

    // 알림 목록에 추가
    if (event.eventType === 'chat-termination' && event.parsedData) {
      setNotifications(prev => [...prev, {
        id: event.lastEventId || Date.now(),
        type: 'chat-termination',
        data: event.parsedData,
        timestamp: new Date()
      }]);
    }

    // 사용자 정의 메시지 핸들러 호출
    if (onMessage) {
      onMessage(event);
    }
  }, [onMessage]);

  // 에러 핸들러
  const handleError = useCallback((error) => {
    console.error('SSE 에러:', error);
    setError(error);
    setIsConnected(false);
    setConnectionState('ERROR');

    // 사용자 정의 에러 핸들러 호출
    if (onError) {
      onError(error);
    }
  }, [onError]);

  // 연결 성공 핸들러
  const handleOpen = useCallback((event) => {
    console.log('SSE 연결 성공:', event);
    setIsConnected(true);
    setConnectionState('OPEN');
    setError(null);

    // 사용자 정의 연결 핸들러 호출
    if (onOpen) {
      onOpen(event);
    }
  }, [onOpen]);

  // SSE 연결 함수
  const connect = useCallback(() => {
    if (!token) {
      console.warn('토큰이 없어 SSE 연결을 시작할 수 없습니다.');
      return;
    }

    setConnectionState('CONNECTING');
    sseService.connect(
      token,
      handleMessage,
      handleError,
      handleOpen,
      lastEventIdState
    );
  }, [token, lastEventIdState, handleMessage, handleError, handleOpen]);

  // SSE 연결 해제 함수
  const disconnect = useCallback(() => {
    sseService.disconnect();
    setIsConnected(false);
    setConnectionState('CLOSED');
  }, []);

  // 재연결 함수
  const reconnect = useCallback(() => {
    disconnect();
    setTimeout(() => {
      sseService.enableReconnect();
      connect();
    }, 1000);
  }, [connect, disconnect]);

  // 알림 제거 함수
  const removeNotification = useCallback((notificationId) => {
    setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
  }, []);

  // 모든 알림 제거 함수
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // 컴포넌트 마운트 시 자동 연결
  useEffect(() => {
    if (autoConnect && token && !isInitialized.current) {
      isInitialized.current = true;
      connect();
    }

    return () => {
      if (isInitialized.current) {
        disconnect();
      }
    };
  }, [autoConnect, token, connect, disconnect]);

  // 토큰 변경 시 재연결
  useEffect(() => {
    if (isInitialized.current && token) {
      reconnect();
    }
  }, [token, reconnect]);

  // 연결 상태 업데이트
  useEffect(() => {
    const checkConnection = () => {
      const readyState = sseService.getReadyState();
      const connected = sseService.isConnected();
      
      setIsConnected(connected);
      
      switch (readyState) {
        case 0: // CONNECTING
          setConnectionState('CONNECTING');
          break;
        case 1: // OPEN
          setConnectionState('OPEN');
          break;
        case 2: // CLOSED
          setConnectionState('CLOSED');
          break;
        default:
          setConnectionState('UNKNOWN');
      }
    };

    const interval = setInterval(checkConnection, 1000);
    return () => clearInterval(interval);
  }, []);

  return {
    // 상태
    isConnected,
    connectionState,
    lastEventId: lastEventIdState,
    notifications,
    error,
    
    // 함수
    connect,
    disconnect,
    reconnect,
    removeNotification,
    clearNotifications
  };
};

export default useSSE;
