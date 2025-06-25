import React, {useState, useRef, useEffect} from 'react';
import {
  ArrowLeft,
  Send,
  Paperclip,
  Smile,
  Phone,
  Video,
  MoreVertical,
  User,
  Home,
  X
} from 'lucide-react';
import './ChatRoom.css';
import axios from 'axios';
import {accessTokenUtils} from '../utils/tokenUtils';
import {useWebSocket} from '../hooks/useWebSocket';

const ChatRoom = ({
  contact,
  chatRoomId,
  onBack,
  onBackToHome,
  userId,
  reservationId
}) => {
  // 상태 변수들을 가장 먼저 선언
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isChatRoomClosed, setIsChatRoomClosed] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  // Refs
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // WebSocket 훅
  const {
    isConnected,
    connectionError,
    connect,
    sendMessage: wsSendMessage,
    onMessage
  } = useWebSocket();

  // Props 검증
  useEffect(() => {
    if (!chatRoomId) {
      setError('채팅방 ID가 없습니다.');
      return;
    }
    if (!contact) {
      setError('연락처 정보가 없습니다.');
      return;
    }
    setError(null);
  }, [contact, chatRoomId]);

  // 채팅방 상태 확인
  const checkChatRoomStatus = async (chatRoomId) => {
    if (!chatRoomId) {
      console.warn('❌ checkChatRoomStatus: 채팅방 ID가 없습니다');
      return;
    }

    try {
      setStatusLoading(true);
      console.log(`🔍 채팅방 ${chatRoomId}의 상태 확인 중...`);

      const response = await axios.get(
          `/api/chat_rooms/${chatRoomId}/status`,
          {
            headers: {
              'Authorization': `Bearer ${accessTokenUtils.getAccessToken()}`
            }
          }
      );

      console.log('📋 채팅방 상태 API 응답:', response.data);

      // 백엔드에서 "closed" 필드로 응답하므로 이를 사용
      const isClosed = response.data.closed;
      setIsChatRoomClosed(isClosed);
      
      console.log(`✅ 채팅방 ${chatRoomId} 상태: ${isClosed ? '종료됨' : '활성'}`);
      console.log(`🔧 isChatRoomClosed 상태 설정됨:`, isClosed);

      return isClosed;

    } catch (err) {
      console.error(`❌ 채팅방 ${chatRoomId} 상태 확인 실패:`, err);
      console.error('에러 상세:', err.response?.data || err.message);
      
      // 상태 확인 실패 시 기본적으로 열린 상태로 가정
      setIsChatRoomClosed(false);
      console.log('🔧 에러로 인해 isChatRoomClosed를 false로 설정');
      return false;
    } finally {
      setStatusLoading(false);
    }
  };

  // 메시지 불러오기
  const fetchMessages = async (chatRoomId) => {
    if (!chatRoomId) {
      console.warn('❌ fetchMessages: 채팅방 ID가 없습니다');
      return;
    }

    try {
      setLoading(true);
      console.log(`📥 채팅방 ${chatRoomId}의 메시지 가져오는 중...`);

      // 대화내역 가져오기
      const response = await axios.get(
          `/api/chat_rooms/${chatRoomId}/messages`,
          {
            params: {size: 20},
            headers: {
              'Authorization': `Bearer ${accessTokenUtils.getAccessToken()}`
            }
          }
      );

      const newMessages = response.data.content
      .slice()
      .reverse()
      .map(msg => ({
        id: msg.messageId,
        text: msg.content,
        sender: msg.mine ? 'user' : 'other',
        timestamp: msg.sentAt,
        status: msg.mine ? 'sent' : 'received'
      }));

      console.log(`✅ 채팅방 ${chatRoomId}: ${newMessages.length}개 메시지 로드`);

      // 메시지를 완전히 새로 설정 (기존 메시지와 합치지 않음)
      setMessages(newMessages);

    } catch (err) {
      console.error(`❌ 채팅방 ${chatRoomId} 메시지 불러오기 실패:`, err);
      if (err.response?.status === 404) {
        console.log('채팅방이 존재하지 않거나 접근 권한이 없습니다.');
        setMessages([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // WebSocket 연결 및 메시지 수신
  useEffect(() => {
    // 채팅방이 종료된 경우 WebSocket 연결하지 않음
    if (isChatRoomClosed) {
      console.log(`🚫 채팅방 ${chatRoomId}이 종료되어 WebSocket 연결을 시도하지 않습니다.`);
      return;
    }

    if (!isConnected) {
      connect();
    }

    const unsubscribe = onMessage((messageData) => {
      console.log('📨 WebSocket 메시지 수신:', messageData);

      // 현재 채팅방의 메시지인지 엄격하게 확인
      const receivedChatRoomId = messageData.chatRoomId
          ? messageData.chatRoomId.toString() : null;
      const currentChatRoomId = chatRoomId ? chatRoomId.toString() : null;

      console.log('🔍 채팅방 ID 비교:', {
        received: receivedChatRoomId,
        current: currentChatRoomId,
        match: receivedChatRoomId === currentChatRoomId
      });

      if (receivedChatRoomId === currentChatRoomId && currentChatRoomId
          !== null) {
        const senderId = messageData.senderId ? messageData.senderId.toString()
            : null;
        const currentUserId = userId ? userId.toString() : null;

        const newMessage = {
          id: messageData.messageId || `ws-${Date.now()}`,
          text: messageData.content,
          sender: messageData.mine ? 'user' : 'other',
          timestamp: messageData.sentAt || new Date().toISOString(),
          status: messageData.mine ? 'sent' : 'received'
        };

        console.log(`✅ 채팅방 ${chatRoomId}에 메시지 추가:`, newMessage);

        setMessages(prev => {
          // 현재 채팅방 ID와 다시 한번 확인
          const currentRoomId = chatRoomId ? chatRoomId.toString() : null;
          if (messageData.chatRoomId?.toString() !== currentRoomId) {
            console.log('🚫 setState 내부에서 채팅방 ID 불일치로 메시지 무시');
            return prev;
          }

          // 메시지가 비어있다면 (새 채팅방이거나 초기화 직후) 바로 추가
          if (prev.length === 0) {
            console.log('➕ 빈 채팅방에 첫 메시지 추가:', newMessage);
            return [newMessage];
          }

          // 같은 내용의 임시 메시지가 있는지 확인 (낙관적 업데이트 메시지)
          const tempMessageIndex = prev.findIndex(msg =>
              msg.id.startsWith('temp-') &&
              msg.text === newMessage.text &&
              msg.sender === newMessage.sender &&
              Math.abs(new Date(msg.timestamp).getTime() - new Date(
                  newMessage.timestamp).getTime()) < 5000 // 5초 이내
          );

          if (tempMessageIndex !== -1) {
            // 임시 메시지를 실제 메시지로 교체
            console.log('🔄 임시 메시지를 실제 메시지로 교체:', newMessage);
            const updated = prev.map((msg, index) =>
                index === tempMessageIndex ? newMessage : msg
            );
            return updated.sort(
                (a, b) => new Date(a.timestamp) - new Date(b.timestamp));
          }

          // 이미 같은 ID의 메시지가 있는지 확인
          const exists = prev.some(msg => msg.id === newMessage.id);
          if (exists) {
            console.log('🚫 중복 메시지이므로 무시:', newMessage);
            return prev; // 그대로 반환
          }

          console.log('➕ 새 메시지 추가:', newMessage);
          const updated = [...prev, newMessage];
          return updated.sort(
              (a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        });
      } else {
        console.log(
            `🚫 다른 채팅방(${receivedChatRoomId})의 메시지이므로 무시 (현재: ${currentChatRoomId})`);
      }
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [isConnected, connect, onMessage, chatRoomId, userId, isChatRoomClosed]);

  // 컴포넌트 unmount 시 정리
  useEffect(() => {
    console.log(`🚀 ChatRoom 마운트 - 채팅방: ${chatRoomId}`);
    return () => {
      console.log(`🧹 ChatRoom 언마운트 - 채팅방: ${chatRoomId}`);
      setMessages([]);
      setError(null);
      setLoading(false);
      setIsChatRoomClosed(false);
      setStatusLoading(false);
    };
  }, []);

  // 채팅방 변경 시 메시지 초기화 및 새 메시지 로드
  useEffect(() => {
    if (chatRoomId) {
      console.log(`🔄 채팅방 ${chatRoomId} 변경 - 메시지 초기화`);

      // 즉시 메시지 완전 초기화 
      setMessages([]);
      setError(null);
      setLoading(true);
      setIsChatRoomClosed(false);

      // 채팅방 상태 확인 후 메시지 가져오기
      const loadChatRoom = async () => {
        try {
          // 1. 먼저 채팅방 상태 확인
          const isClosed = await checkChatRoomStatus(chatRoomId);
          
          // 2. 메시지 가져오기 (종료된 채팅방이어도 기존 메시지는 볼 수 있음)
          await fetchMessages(chatRoomId);
          
          if (isClosed) {
            console.log(`🔒 채팅방 ${chatRoomId}이 종료되었습니다. 읽기 전용 모드입니다.`);
          }
        } catch (error) {
          console.error('채팅방 로딩 실패:', error);
        }
      };

      loadChatRoom();
    }
  }, [chatRoomId]);

  // 메시지 스크롤
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({behavior: 'smooth'});
    }
  }, [messages]);

  // 메시지 전송
  const handleSendMessage = async () => {
    console.log('🚀 메시지 전송 시도:', {
      message: message.trim(),
      chatRoomId,
      isChatRoomClosed
    });

    if (!message.trim() || !chatRoomId) {
      console.log('❌ 메시지가 비어있거나 채팅방 ID가 없음');
      return;
    }

    // 채팅방이 종료된 경우 메시지 전송 차단
    if (isChatRoomClosed) {
      console.log('🚫 채팅방이 종료되어 메시지 전송 차단');
      alert('종료된 채팅방에서는 메시지를 보낼 수 없습니다.');
      return;
    }

    const messageContent = message.trim();
    setMessage('');

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // 즉시 화면에 낙관적 업데이트 (Optimistic Update)
    const optimisticMessage = {
      id: `temp-${Date.now()}`,
      text: messageContent,
      sender: 'user',
      timestamp: new Date().toISOString(),
      status: 'sending'
    };
    setMessages(prev => [...prev, optimisticMessage]);

    try {
      if (isConnected) {
        console.log('📤 STOMP로 메시지 전송 시도...');
        const wsSuccess = await wsSendMessage(chatRoomId, messageContent);

        if (wsSuccess) {
          console.log('✅ STOMP 메시지 전송 성공 - 서버에서 자동 저장됨');

          // 전송 성공 표시 - 낙관적 업데이트 메시지를 그대로 유지
          setMessages(prev =>
              prev.map(msg =>
                  msg.id === optimisticMessage.id
                      ? {...msg, status: 'sent'}
                      : msg
              )
          );

          // 서버에서 실제 메시지가 저장되기를 기다린 후 WebSocket으로 받을 것임
          // fetchMessages는 호출하지 않음 - WebSocket으로 실시간 업데이트 받음

          return;
        }
      }

      // WebSocket 연결이 안되어 있거나 전송 실패
      console.error('❌ WebSocket이 연결되지 않아 메시지를 전송할 수 없습니다');
      setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
      alert('실시간 연결이 끊어져 메시지를 전송할 수 없습니다. 페이지를 새로고침해주세요.');
      setMessage(messageContent);

    } catch (error) {
      console.error('❌ 메시지 전송 실패:', error);

      // 전송 실패 시 낙관적 업데이트 메시지 제거
      setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));

      // 사용자에게 알림
      alert('메시지 전송에 실패했습니다. 다시 시도해주세요.');

      // 입력창에 메시지 복원
      setMessage(messageContent);
    }
  };

  // 키보드 이벤트
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 시간 포맷팅
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // 에러 상태
  if (error) {
    return (
        <div className="chat-room-container">
          <div className="chat-header">
            <div className="chat-header-left">
              <button className="back-button" onClick={onBack}>
                <ArrowLeft className="icon"/>
              </button>
              <div className="contact-info">
                <h3 className="contact-name">에러 발생</h3>
              </div>
            </div>
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '400px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{fontSize: '48px', marginBottom: '16px'}}>⚠️</div>
            <h3 style={{color: '#ef4444', marginBottom: '8px'}}>오류가 발생했습니다</h3>
            <p style={{color: '#6b7280', marginBottom: '16px'}}>{error}</p>
            <button
                onClick={() => window.location.reload()}
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer'
                }}
            >
              페이지 새로고침
            </button>
          </div>
        </div>
    );
  }

  // 메인 렌더링
  return (
      <div className="chat-room-container">
        {/* 헤더 */}
        <div className="chat-header">
          <div className="chat-header-left">
            <button className="back-button" onClick={onBack}>
              <ArrowLeft className="icon"/>
            </button>
            <div className="contact-info">
              <div className="contact-avatar">
                {contact?.profileImage ? (
                    <img src={contact.profileImage} alt={contact.name}/>
                ) : (
                    <User className="avatar-icon"/>
                )}
                <div className={`online-indicator ${isConnected ? 'connected'
                    : 'disconnected'}`}></div>
              </div>
              <div className="contact-details">
                <h3 className="contact-name">{contact?.name || '김밤'}</h3>
                <span className="contact-status">
                  {isChatRoomClosed ? '채팅 종료됨' : '대화 중'}
                </span>
                {/* 활성 채팅방에만 연결 상태 표시 */}
                {!isChatRoomClosed && (
                  <div className="connection-status">
                    <span className={`ws-status ${isConnected ? 'connected'
                        : 'disconnected'}`}>
                      {isConnected ? '🟢 실시간 연결됨' : '🔴 연결 끊김'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="chat-header-actions">
            <button className="action-button" onClick={onBackToHome}>
              <Home className="icon"/>
            </button>
          </div>
        </div>

        {/* 메시지 영역 */}
        <div className="messages-container">
          {loading && (
              <div className="loading-indicator">
                <span>메시지를 불러오는 중...</span>
              </div>
          )}

          <div className="messages-list">
            {messages.map((msg) => (
                <div
                    key={msg.id}
                    className={`message ${msg.sender === 'user' ? 'sent'
                        : 'received'}`}
                >
                  {msg.sender === 'other' && (
                      <div className="message-avatar">
                        {contact?.profileImage ? (
                            <img src={contact.profileImage} alt={contact.name}/>
                        ) : (
                            <User className="avatar-icon"/>
                        )}
                      </div>
                  )}

                  <div className="message-content">
                    <div className="message-bubble">
                      <span style={{whiteSpace: 'pre-wrap'}}>{msg.text}</span>
                    </div>
                    <div className="message-info">
                      <span className="message-time">{formatTime(
                          msg.timestamp)}</span>
                      {msg.sender === 'user' && (
                          <span className={`message-status ${msg.status}`}>
                      {msg.status === 'sending' && '⏳'}
                            {msg.status === 'sent' && '✓'}
                    </span>
                      )}
                    </div>
                  </div>
                </div>
            ))}

            <div ref={messagesEndRef}/>
          </div>
        </div>

        {/* 입력 영역 */}
        {isChatRoomClosed ? (
          <div className="message-input-container disabled">
            <div className="chat-closed-notice">
              <span>📫 이 채팅방은 종료되었습니다. 메시지를 읽을 수만 있습니다.</span>
            </div>
          </div>
        ) : (
          <div className="message-input-container">
            <div className="message-input-wrapper">
              <button className="attachment-button">
                <Paperclip className="icon"/>
              </button>

              <div className="text-input-container">
              <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="메시지를 입력하세요..."
                  className="message-textarea"
                  rows="1"
              />
                <button className="emoji-button">
                  <Smile className="icon"/>
                </button>
              </div>

              <button
                  className={`send-button ${message.trim() ? 'active' : ''}`}
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
              >
                <Send className="icon"/>
              </button>
            </div>
          </div>
        )}
      </div>
  );
};

export default ChatRoom;