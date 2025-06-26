import React, { useState, useEffect } from 'react';
import { useSSE } from '../hooks/useSSE';
import { getToken, isAuthenticated } from '../utils/authUtils';
import ChatTerminationNotification from './ChatTerminationNotification';
import { Wifi, WifiOff, RefreshCw, Power, PowerOff } from 'lucide-react';

/**
 * SSE 연결 데모 컴포넌트
 */
const SSEExample = () => {
  const [token, setToken] = useState(getToken());
  const [manualToken, setManualToken] = useState('');
  const [autoConnect, setAutoConnect] = useState(true);

  // SSE Hook 사용
  const {
    isConnected,
    connectionState,
    lastEventId,
    notifications,
    error,
    connect,
    disconnect,
    reconnect,
    removeNotification,
    clearNotifications
  } = useSSE(token, {
    autoConnect,
    onMessage: (event) => {
      console.log('메시지 수신:', event);
    },
    onError: (error) => {
      console.error('SSE 에러:', error);
    },
    onOpen: (event) => {
      console.log('SSE 연결 성공:', event);
    }
  });

  // 컴포넌트 마운트 시 토큰 확인
  useEffect(() => {
    const currentToken = getToken();
    if (currentToken !== token) {
      setToken(currentToken);
    }
  }, [token]);

  const handleManualConnect = () => {
    if (manualToken.trim()) {
      setToken(manualToken.trim());
      connect();
    }
  };

  const handleTokenUpdate = () => {
    const newToken = getToken();
    setToken(newToken);
  };

  const getConnectionStatusIcon = () => {
    switch (connectionState) {
      case 'OPEN':
        return <Wifi className="h-5 w-5 text-green-500" />;
      case 'CONNECTING':
        return <RefreshCw className="h-5 w-5 text-yellow-500 animate-spin" />;
      case 'CLOSED':
      case 'ERROR':
      default:
        return <WifiOff className="h-5 w-5 text-red-500" />;
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionState) {
      case 'OPEN':
        return '연결됨';
      case 'CONNECTING':
        return '연결 중...';
      case 'CLOSED':
        return '연결 끊김';
      case 'ERROR':
        return '연결 오류';
      default:
        return '알 수 없음';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* 헤더 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          실시간 채팅방 종료 알림 (SSE)
        </h1>
        <p className="text-gray-600">
          Server-Sent Events를 사용한 JWT 인증 기반 실시간 알림 시스템
        </p>
      </div>

      {/* 연결 상태 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">연결 상태</h2>
        
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex items-center space-x-2">
            {getConnectionStatusIcon()}
            <span className={`font-medium ${
              isConnected ? 'text-green-600' : 'text-red-600'
            }`}>
              {getConnectionStatusText()}
            </span>
          </div>
          
          {lastEventId && (
            <div className="text-sm text-gray-500">
              Last Event ID: {lastEventId}
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
            <p className="text-red-800 text-sm">
              오류: {error.message || error.toString()}
            </p>
          </div>
        )}

        <div className="flex space-x-2">
          <button
            onClick={connect}
            disabled={isConnected}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium ${
              isConnected
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            <Power className="h-4 w-4" />
            <span>연결</span>
          </button>
          
          <button
            onClick={disconnect}
            disabled={!isConnected}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium ${
              !isConnected
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
          >
            <PowerOff className="h-4 w-4" />
            <span>연결 해제</span>
          </button>
          
          <button
            onClick={reconnect}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md font-medium"
          >
            <RefreshCw className="h-4 w-4" />
            <span>재연결</span>
          </button>
        </div>
      </div>

      {/* 토큰 관리 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">토큰 관리</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              현재 토큰 상태
            </label>
            <div className={`p-3 rounded-md ${
              isAuthenticated() 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <p className={`text-sm ${
                isAuthenticated() ? 'text-green-800' : 'text-red-800'
              }`}>
                {isAuthenticated() ? '✓ 유효한 토큰' : '✗ 토큰이 없거나 만료됨'}
              </p>
              {token && (
                <p className="text-xs text-gray-600 mt-1 break-all">
                  {token.substring(0, 50)}...
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              수동 토큰 입력
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                placeholder="JWT 토큰을 입력하세요"
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleManualConnect}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm font-medium"
              >
                적용
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={handleTokenUpdate}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md text-sm font-medium"
            >
              토큰 새로고침
            </button>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={autoConnect}
                onChange={(e) => setAutoConnect(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-700">자동 연결</span>
            </label>
          </div>
        </div>
      </div>

      {/* 알림 현황 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">알림 현황</h2>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">
              받은 알림: {notifications.length}개
            </span>
            {notifications.length > 0 && (
              <button
                onClick={clearNotifications}
                className="text-sm text-red-600 hover:text-red-800"
              >
                모든 알림 제거
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              아직 받은 알림이 없습니다.
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="border border-gray-200 rounded-md p-3 text-sm"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">
                        {notification.type === 'chat-termination' ? '채팅방 종료 알림' : '알림'}
                      </p>
                      {notification.data && (
                        <p className="text-gray-600 mt-1">
                          {notification.data.content || '내용 없음'}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {notification.timestamp.toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => removeNotification(notification.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 알림 팝업 */}
      <ChatTerminationNotification
        notifications={notifications}
        onRemoveNotification={removeNotification}
        onClearAll={clearNotifications}
      />
    </div>
  );
};

export default SSEExample;
