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
import { accessTokenUtils } from '../utils/tokenUtils';
import { useWebSocket } from '../hooks/useWebSocket';

const ChatRoom = ({contact, chatRoomId, onBack, onBackToHome, userId, reservationId}) => {
  // Props 디버깅
  useEffect(() => {
    console.log('🔍 ChatRoom Props 확인:', {
      contact,
      chatRoomId,
      userId,
      reservationId,
      chatRoomIdType: typeof chatRoomId,
      chatRoomIdValue: chatRoomId
    });
  }, [contact, chatRoomId, userId, reservationId]);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [lastMessageId, setLastMessageId] = useState(null);
  const [hasNext, setHasNext] = useState(true);
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [sessionEndTime, setSessionEndTime] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [showEndNotice, setShowEndNotice] = useState(true);
  
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const timerRef = useRef(null);

  // WebSocket 훅 사용
  const { 
    isConnected, 
    connectionError, 
    connect, 
    sendMessage: wsSendMessage, 
    onMessage 
  } = useWebSocket();

  // 메시지 불러오기 함수
  const fetchMessages = async (cursor = null, append = false) => {
    if (loading) return;
    
    try {
      setLoading(true);
      const response = await axios.get(
          `/api/chat_rooms/${chatRoomId}/messages`,
          {
            params: {
              lastMessageId: cursor,
              size: 20
            },
            headers: {
              'Authorization': `Bearer ${accessTokenUtils.getAccessToken()}`
            }
          }
      );

      const newMessages = response.data.content.map(msg => ({
        id: msg.messageId,
        text: msg.content,
        sender: msg.isMine ? 'user' : 'other',
        timestamp: msg.sentAt,
        status: msg.isMine ? 'read' : 'received'
      }));

      if (append) {
        setMessages(prev => [...newMessages, ...prev]);
      } else {
        setMessages(newMessages);
      }

      const lastMessage = response.data.content.at(-1);
      if (lastMessage) {
        setLastMessageId(lastMessage.messageId);
      }

      setHasNext(response.data.hasNext);
    } catch (err) {
      console.error('메시지 불러오기 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  // 예약 정보 및 세션 종료 시간 가져오기
  const fetchReservationInfo = async () => {
    try {
      const response = await axios.get(`/api/reservations/${reservationId}`, {
        headers: {
          'Authorization': `Bearer ${accessTokenUtils.getAccessToken()}`
        }
      });
      
      const endTime = new Date(response.data.reservationEndAt);
      setSessionEndTime(endTime);
      
      // 현재 시간이 종료 시간을 지났는지 확인
      const now = new Date();
      if (now >= endTime) {
        setSessionEnded(true);
        setTimeRemaining('세션 종료됨');
      }
    } catch (error) {
      console.error('예약 정보 가져오기 실패:', error);
    }
  };

  // 타이머 설정
  const startTimer = () => {
    if (!sessionEndTime || sessionEnded) return;

    timerRef.current = setInterval(() => {
      const now = new Date();
      const timeDiff = sessionEndTime - now;

      if (timeDiff <= 0) {
        setSessionEnded(true);
        setTimeRemaining('세션 종료됨');
        clearInterval(timerRef.current);

        // 세션 종료 메시지 추가
        const endMessage = {
          id: `system-${Date.now()}`,
          text: '예약된 대화 시간이 종료되었습니다. 채팅 기록은 계속 확인하실 수 있습니다.',
          sender: 'system',
          timestamp: new Date().toISOString(),
          status: 'system'
        };
        setMessages(prev => [...prev, endMessage]);
      } else {
        const minutes = Math.floor(timeDiff / 60000);
        const seconds = Math.floor((timeDiff % 60000) / 1000);
        setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      }
    }, 1000);
  };

  // 무한 스크롤 처리
  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container || loading || !hasNext) return;

    if (container.scrollTop === 0) {
      fetchMessages(lastMessageId, true);
    }
  };

  // WebSocket 연결 및 메시지 수신 처리
  useEffect(() => {
    // WebSocket 연결
    if (!isConnected) {
      console.log('WebSocket 연결 시도 중...');
      connect();
    }

    // 메시지 수신 리스너 등록
    const unsubscribe = onMessage((messageData) => {
      console.log('📨 WebSocket 메시지 수신:', messageData);
      console.log('🔍 현재 채팅방 정보:', {
        currentChatRoomId: chatRoomId,
        currentUserId: userId,
        contactId: contact?.id,
        contactName: contact?.name
      });
      
      // 수신된 메시지가 현재 채팅방의 메시지인지 확인
      if (messageData.chatRoomId && messageData.chatRoomId.toString() === chatRoomId.toString()) {
        // 메시지 발신자 확인 (내가 보낸 메시지인지 상대방이 보낸 메시지인지)
        const senderId = messageData.senderId ? messageData.senderId.toString() : null;
        const currentUserId = userId ? userId.toString() : null;
        const contactId = contact?.id ? contact.id.toString() : null;
        
        console.log('🔍 메시지 발신자 확인:', {
          senderId,
          currentUserId,
          contactId,
          isMyMessage: senderId === currentUserId,
          isContactMessage: senderId === contactId
        });
        
        const newMessage = {
          id: messageData.messageId || `ws-${Date.now()}`,
          text: messageData.content,
          sender: senderId === currentUserId ? 'user' : 'other',
          timestamp: messageData.sentAt || new Date().toISOString(),
          status: 'received'
        };
        
        console.log('✅ 새 메시지 생성:', newMessage);
        
        setMessages(prev => {
          // 중복 메시지 방지
          const exists = prev.some(msg => msg.id === newMessage.id);
          if (!exists) {
            console.log('📝 메시지 목록에 추가');
            return [...prev, newMessage];
          } else {
            console.log('⚠️ 중복 메시지로 인해 추가하지 않음');
            return prev;
          }
        });
      } else {
        console.log('⚠️ 다른 채팅방의 메시지이므로 무시:', {
          receivedChatRoomId: messageData.chatRoomId,
          currentChatRoomId: chatRoomId
        });
      }
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [isConnected, connect, onMessage, chatRoomId, userId]);

  // 초기 데이터 로드
  useEffect(() => {
    if (chatRoomId) {
      fetchMessages();
    }
  }, [chatRoomId]);

  useEffect(() => {
    if (reservationId) {
      fetchReservationInfo();
    }
  }, [reservationId]);

  // 타이머 시작
  useEffect(() => {
    if (sessionEndTime && !sessionEnded) {
      startTimer();
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [sessionEndTime, sessionEnded]);

  // 메시지가 추가될 때마다 스크롤을 맨 아래로
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
  };

  const handleSendMessage = async () => {
    console.log('🚀 메시지 전송 시작 - 디버깅:', {
      sessionEnded,
      message: message.trim(),
      chatRoomId,
      chatRoomIdType: typeof chatRoomId,
      isConnected
    });

    // 세션이 종료되었으면 메시지 전송 불가
    if (sessionEnded) {
      alert('세션이 종료되어 더 이상 메시지를 보낼 수 없습니다.');
      return;
    }

    // chatRoomId 검증
    if (!chatRoomId) {
      console.error('❌ chatRoomId가 없습니다:', {
        chatRoomId,
        type: typeof chatRoomId,
        props: {contact, chatRoomId, userId, reservationId}
      });
      alert('채팅방 정보가 없습니다. 페이지를 새로고침해주세요.');
      return;
    }

    if (message.trim()) {
      const messageContent = message.trim();
      setMessage('');

      // 텍스트 영역 높이 초기화
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }

      console.log('📤 메시지 전송 데이터:', {
        chatRoomId,
        content: messageContent,
        wsConnected: isConnected
      });

      // 낙관적 업데이트: UI에 즉시 메시지 추가
      const optimisticMessage = {
        id: `temp-${Date.now()}`,
        text: messageContent,
        sender: 'user',
        timestamp: new Date().toISOString(),
        status: 'sending'
      };
      setMessages(prev => [...prev, optimisticMessage]);

      try {
        // WebSocket을 통한 메시지 전송 시도
        if (isConnected) {
          console.log('📡 WebSocket으로 메시지 전송 시도...');
          const wsSuccess = await wsSendMessage(chatRoomId, messageContent);
          
          if (wsSuccess) {
            console.log('✅ WebSocket으로 메시지 전송 성공');
            // WebSocket 전송 성공 시 상태 업데이트
            setMessages(prev => 
              prev.map(msg => 
                msg.id === optimisticMessage.id 
                  ? { ...msg, status: 'sent' }
                  : msg
              )
            );
            return; // 성공했으므로 HTTP API 호출하지 않음
          } else {
            console.log('⚠️ WebSocket 전송 실패, HTTP API 사용');
          }
        } else {
          console.log('⚠️ WebSocket 연결 안됨, HTTP API 사용');
        }

        // WebSocket 전송 실패 시 HTTP API 사용
        await sendMessageViaHttp(messageContent, optimisticMessage.id);

      } catch (error) {
        console.error('💥 메시지 전송 실패:', error);
        
        // 전송 실패 시 HTTP API로 재시도
        try {
          await sendMessageViaHttp(messageContent, optimisticMessage.id);
        } catch (httpError) {
          console.error('HTTP API 전송도 실패:', httpError);
          
          // 완전 실패 시 메시지 제거 및 알림
          setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
          alert('메시지 전송에 실패했습니다. 다시 시도해주세요.');
          setMessage(messageContent); // 메시지를 다시 입력창에 복원
        }
      }
    }
  };

  // HTTP API를 통한 메시지 전송 (백업 방법)
  const sendMessageViaHttp = async (messageContent, tempId) => {
    try {
      const response = await axios.post(
          `/api/chat_rooms/${chatRoomId}/messages`,
          {
            content: messageContent
          },
          {
            headers: {
              'Authorization': `Bearer ${accessTokenUtils.getAccessToken()}`,
              'Content-Type': 'application/json'
            }
          }
      );

      // HTTP 응답으로 받은 실제 메시지로 임시 메시지 교체
      const actualMessage = {
        id: response.data.messageId,
        text: messageContent,
        sender: 'user',
        timestamp: response.data.sentAt || new Date().toISOString(),
        status: 'sent'
      };

      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempId ? actualMessage : msg
        )
      );

      console.log('✅ HTTP API로 메시지 전송 성공');
    } catch (error) {
      console.error('HTTP API 메시지 전송 실패:', error);
      throw error; // 상위로 에러 전파
    }
  };

  const handleKeyPress = (e) => {
    if (sessionEnded) {
      return;
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTextareaChange = (e) => {
    if (sessionEnded) {
      return;
    }

    setMessage(e.target.value);

    // 텍스트 영역 높이 자동 조절
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatMessageText = (text, messageType = 'normal') => {
    // 시스템 메시지는 특별 처리
    if (messageType === 'system') {
      return [{type: 'system', content: text}];
    }

    // 코드 블록 처리
    const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      // 코드 블록 앞의 텍스트
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.slice(lastIndex, match.index)
        });
      }

      // 코드 블록
      parts.push({
        type: 'code',
        language: match[1] || 'text',
        content: match[2]
      });

      lastIndex = match.index + match[0].length;
    }

    // 남은 텍스트
    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex)
      });
    }

    return parts.length > 0 ? parts : [{type: 'text', content: text}];
  };

  const handleExtendSession = async () => {
    try {
      await axios.post(`/api/reservations/${reservationId}/extend`, {}, {
        headers: {
          'Authorization': `Bearer ${accessTokenUtils.getAccessToken()}`
        }
      });
      
      if (window.showNotification) {
        window.showNotification({
          type: 'info',
          title: '연장 요청 전송',
          message: '멘토에게 세션 연장 요청을 보냈습니다.',
          timestamp: new Date().toISOString()
        });
      } else {
        alert('멘토에게 세션 연장 요청을 보냈습니다.');
      }
    } catch (error) {
      console.error('세션 연장 요청 실패:', error);
      alert('세션 연장 요청에 실패했습니다.');
    }
  };

  return (
      <div className="chat-room-container">
        {/* 채팅 헤더 */}
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
                <div className={`online-indicator ${isConnected ? 'connected' : 'disconnected'}`}></div>
              </div>
              <div className="contact-details">
                <h3 className="contact-name">{contact?.name || '김밤'}</h3>
                <span
                    className={`contact-status ${sessionEnded ? 'session-ended'
                        : 'session-active'}`}>
                  {sessionEnded ? '세션 종료됨' : `대화 중 (${timeRemaining} 남음)`}
                </span>
                {/* WebSocket 연결 상태 표시 */}
                <div className="connection-status">
                  <span className={`ws-status ${isConnected ? 'connected' : 'disconnected'}`}>
                    {isConnected ? '🟢 실시간 연결됨' : '🔴 연결 끊김'}
                  </span>
                  {connectionError && (
                    <span className="connection-error" title={connectionError}>
                      ⚠️ 연결 오류
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="chat-header-actions">
            <button className="action-button">
              <Phone className="icon"/>
            </button>
            <button className="action-button">
              <Video className="icon"/>
            </button>
            <button className="action-button" onClick={onBackToHome}>
              <Home className="icon"/>
            </button>
            <button className="action-button">
              <MoreVertical className="icon"/>
            </button>
          </div>
        </div>

        {/* 메시지 영역 */}
        <div 
            className="messages-container"
            ref={messagesContainerRef}
            onScroll={handleScroll}
        >
          {loading && (
              <div className="loading-indicator">
                <span>메시지를 불러오는 중...</span>
              </div>
          )}
          
          <div className="messages-list">
            {messages.map((msg) => (
                <div
                    key={msg.id}
                    className={`message ${
                        msg.sender === 'system' ? 'system' :
                            msg.sender === 'user' ? 'sent' : 'received'
                    }`}
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
                      {formatMessageText(msg.text, msg.sender).map(
                          (part, index) => (
                              <div key={index}>
                                {part.type === 'system' ? (
                                    <span
                                        className="system-message-text">{part.content}</span>
                                ) : part.type === 'text' ? (
                                    <span
                                        style={{whiteSpace: 'pre-wrap'}}>{part.content}</span>
                                ) : (
                                    <div className="code-block">
                                      <div className="code-header">
                                          <span
                                              className="code-language">{part.language}</span>
                                      </div>
                                      <pre><code>{part.content}</code></pre>
                                    </div>
                                )}
                              </div>
                          ))}
                    </div>

                    {msg.sender !== 'system' && (
                        <div className="message-info">
                            <span className="message-time">{formatTime(
                                msg.timestamp)}</span>
                          {msg.sender === 'user' && (
                              <span className={`message-status ${msg.status}`}>
                          {msg.status === 'sending' && '⏳'}
                                {msg.status === 'sent' && '✓'}
                                {msg.status === 'delivered' && '✓✓'}
                                {msg.status === 'read' && '✓✓'}
                        </span>
                          )}
                        </div>
                    )}
                  </div>
                </div>
            ))}

            {/* 타이핑 인디케이터 */}
            {typing && (
                <div className="message received">
                  <div className="message-avatar">
                    {contact?.profileImage ? (
                        <img src={contact.profileImage} alt={contact.name}/>
                    ) : (
                        <User className="avatar-icon"/>
                    )}
                  </div>
                  <div className="message-content">
                    <div className="message-bubble typing-indicator">
                      <div className="typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                </div>
            )}

            <div ref={messagesEndRef}/>
          </div>
        </div>

        {/* 메시지 입력 영역 */}
        <div
            className={`message-input-container ${sessionEnded ? 'session-ended'
                : ''}`}>
          {sessionEnded && showEndNotice ? (
              <div className="session-ended-notice">
                <button
                    className="close-notice-button"
                    onClick={() => setShowEndNotice(false)}
                    title="알림 닫기"
                >
                  <X className="close-icon"/>
                </button>
                <div className="session-ended-content">
                  <h3>세션이 종료되었습니다</h3>
                  <p>예약된 멘토링 시간이 종료되어 더 이상 메시지를 보낼 수 없습니다.<br/>
                    채팅 기록은 계속 확인하실 수 있습니다.</p>
                  <div className="session-ended-actions">
                    <button
                        className="extend-session-button"
                        onClick={handleExtendSession}
                    >
                      세션 연장 요청
                    </button>
                    <button
                        className="new-session-button"
                        onClick={onBackToHome}
                    >
                      새 대화 시작
                    </button>
                  </div>
                </div>
              </div>
          ) : sessionEnded ? (
              <div className="session-ended-minimal">
                  <span
                      className="session-ended-text">세션이 종료되어 메시지를 보낼 수 없습니다.</span>
                <button
                    className="show-notice-button"
                    onClick={() => setShowEndNotice(true)}
                >
                  옵션 보기
                </button>
              </div>
          ) : (
              <div className="message-input-wrapper">
                <button className="attachment-button" disabled={sessionEnded}>
                  <Paperclip className="icon"/>
                </button>

                <div className="text-input-container">
                <textarea
                    ref={textareaRef}
                    value={message}
                    onChange={handleTextareaChange}
                    onKeyPress={handleKeyPress}
                    placeholder={sessionEnded ? "세션이 종료되었습니다" : "메시지를 입력하세요..."}
                    className="message-textarea"
                    rows="1"
                    disabled={sessionEnded}
                />
                  <button className="emoji-button" disabled={sessionEnded}>
                    <Smile className="icon"/>
                  </button>
                </div>

                <button
                    className={`send-button ${message.trim() && !sessionEnded
                        ? 'active' : ''}`}
                    onClick={handleSendMessage}
                    disabled={!message.trim() || sessionEnded}
                >
                  <Send className="icon"/>
                </button>
              </div>
          )}
        </div>
      </div>
  );
};

export default ChatRoom;