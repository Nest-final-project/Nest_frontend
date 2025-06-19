import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Paperclip, Smile, Phone, Video, MoreVertical, User, Home, X } from 'lucide-react';
import './ChatRoom.css';

const ChatRoom = ({ contact, chatId, onBack, onBackToHome }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: '안녕하세요! 채팅을 시작해주셔서 감사합니다. 궁금한 점이 있으시면 언제든지 말씀해주세요.',
      sender: 'other',
      timestamp: new Date(Date.now() - 60000 * 30).toISOString(),
      status: 'read'
    },
    {
      id: 2,
      text: '네, 안녕하세요! 리액트 관련해서 몇 가지 질문이 있어서 연락드렸습니다.',
      sender: 'user',
      timestamp: new Date(Date.now() - 60000 * 25).toISOString(),
      status: 'read'
    },
    {
      id: 3,
      text: '좋습니다! 어떤 부분이 궁금하신가요? 자세히 설명해주시면 도움드리겠습니다.',
      sender: 'other',
      timestamp: new Date(Date.now() - 60000 * 20).toISOString(),
      status: 'read'
    },
    {
      id: 4,
      text: 'useState와 useEffect를 함께 사용할 때 주의사항이 있을까요? 특히 API 호출과 관련해서요.',
      sender: 'user',
      timestamp: new Date(Date.now() - 60000 * 15).toISOString(),
      status: 'read'
    },
    {
      id: 5,
      text: '아주 좋은 질문입니다! useEffect에서 API 호출할 때는 cleanup 함수와 dependency array를 잘 관리해야 합니다.\n\n예를 들어:\n```javascript\nuseEffect(() => {\n  let cancelled = false;\n  \n  fetchData().then(data => {\n    if (!cancelled) {\n      setData(data);\n    }\n  });\n  \n  return () => {\n    cancelled = true;\n  };\n}, [dependency]);\n```\n\n이런 식으로 하면 컴포넌트가 언마운트되었을 때 불필요한 상태 업데이트를 방지할 수 있어요.',
      sender: 'other',
      timestamp: new Date(Date.now() - 60000 * 10).toISOString(),
      status: 'read'
    },
    {
      id: 6,
      text: '와, 정말 도움이 됩니다! cleanup 함수의 중요성을 잘 몰랐는데 이제 이해가 되네요.',
      sender: 'user',
      timestamp: new Date(Date.now() - 60000 * 5).toISOString(),
      status: 'read'
    }
  ]);
  const [typing, setTyping] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [sessionEndTime, setSessionEndTime] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [showEndNotice, setShowEndNotice] = useState(true);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // 메시지가 추가될 때마다 스크롤을 맨 아래로
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 세션 종료 시간 설정 및 타이머 시작
  useEffect(() => {
    // 실제로는 예약 정보에서 종료 시간을 가져올 것
    // 테스트용으로 현재 시간에서 30초 후로 설정
    const endTime = new Date(Date.now() + 30000); // 30초 후
    setSessionEndTime(endTime);

    const timer = setInterval(() => {
      const now = new Date();
      const timeDiff = endTime - now;

      if (timeDiff <= 0) {
        setSessionEnded(true);
        setTimeRemaining('세션 종료됨');
        clearInterval(timer);
        
        // 세션 종료 메시지 추가
        const endMessage = {
          id: Date.now(),
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

    return () => clearInterval(timer);
  }, []);

  // 메시지가 추가될 때마다 스크롤을 맨 아래로
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    // 세션이 종료되었으면 메시지 전송 불가
    if (sessionEnded) {
      alert('세션이 종료되어 더 이상 메시지를 보낼 수 없습니다.');
      return;
    }

    if (message.trim()) {
      const newMessage = {
        id: messages.length + 1,
        text: message,
        sender: 'user', // 현재 사용자
        timestamp: new Date().toISOString(),
        status: 'sent'
      };
      
      setMessages([...messages, newMessage]);
      setMessage('');
      
      // 텍스트 영역 높이 초기화
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }

      // 상대방의 자동 응답 시뮬레이션 (3초 후)
      setTimeout(() => {
        setTyping(true);
        setTimeout(() => {
          const responses = [
            '네, 맞습니다! 더 궁금한 점이 있으시면 언제든 말씀하세요.',
            '좋은 접근법이네요! 실제 프로젝트에서도 이렇게 적용해보시길 권합니다.',
            '혹시 다른 질문도 있으시나요? 도움이 될 만한 자료도 공유해드릴 수 있어요.',
            '이해하셨다니 다행이네요! 계속 연습하시면 금방 익숙해지실 거예요.'
          ];
          
          const randomResponse = responses[Math.floor(Math.random() * responses.length)];
          
          setMessages(prev => [...prev, {
            id: prev.length + 1,
            text: randomResponse,
            sender: 'other',
            timestamp: new Date().toISOString(),
            status: 'read'
          }]);
          setTyping(false);
        }, 2000);
      }, 3000);
    }
  };

  const handleKeyPress = (e) => {
    if (sessionEnded) return; // 세션 종료 시 키 입력 무시
    
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTextareaChange = (e) => {
    if (sessionEnded) return; // 세션 종료 시 텍스트 입력 불가
    
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
      return [{ type: 'system', content: text }];
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

    return parts.length > 0 ? parts : [{ type: 'text', content: text }];
  };

  return (
    <div className="chat-room-container">
      {/* 채팅 헤더 */}
      <div className="chat-header">
        <div className="chat-header-left">
          <button className="back-button" onClick={onBack}>
            <ArrowLeft className="icon" />
          </button>
          <div className="contact-info">
            <div className="contact-avatar">
              {contact?.profileImage ? (
                <img src={contact.profileImage} alt={contact.name} />
              ) : (
                <User className="avatar-icon" />
              )}
              <div className="online-indicator"></div>
            </div>
            <div className="contact-details">
              <h3 className="contact-name">{contact?.name || '김개발'}</h3>
              <span className={`contact-status ${sessionEnded ? 'session-ended' : 'session-active'}`}>
                {sessionEnded ? '세션 종료됨' : `대화 중 (${timeRemaining} 남음)`}
              </span>
            </div>
          </div>
        </div>
        
        <div className="chat-header-actions">
          <button className="action-button">
            <Phone className="icon" />
          </button>
          <button className="action-button">
            <Video className="icon" />
          </button>
          <button className="action-button" onClick={onBackToHome}>
            <Home className="icon" />
          </button>
          <button className="action-button">
            <MoreVertical className="icon" />
          </button>
        </div>
      </div>

      {/* 메시지 영역 */}
      <div className="messages-container">
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
                    <img src={contact.profileImage} alt={contact.name} />
                  ) : (
                    <User className="avatar-icon" />
                  )}
                </div>
              )}
              
              <div className="message-content">
                <div className="message-bubble">
                  {formatMessageText(msg.text, msg.sender).map((part, index) => (
                    <div key={index}>
                      {part.type === 'system' ? (
                        <span className="system-message-text">{part.content}</span>
                      ) : part.type === 'text' ? (
                        <span style={{ whiteSpace: 'pre-wrap' }}>{part.content}</span>
                      ) : (
                        <div className="code-block">
                          <div className="code-header">
                            <span className="code-language">{part.language}</span>
                          </div>
                          <pre><code>{part.content}</code></pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {msg.sender !== 'system' && (
                  <div className="message-info">
                    <span className="message-time">{formatTime(msg.timestamp)}</span>
                    {msg.sender === 'user' && (
                      <span className={`message-status ${msg.status}`}>
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
                  <img src={contact.profileImage} alt={contact.name} />
                ) : (
                  <User className="avatar-icon" />
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
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 메시지 입력 영역 */}
      <div className={`message-input-container ${sessionEnded ? 'session-ended' : ''}`}>
        {sessionEnded && showEndNotice ? (
          <div className="session-ended-notice">
            <button 
              className="close-notice-button"
              onClick={() => setShowEndNotice(false)}
              title="알림 닫기"
            >
              <X className="close-icon" />
            </button>
            <div className="session-ended-content">
              <h3>세션이 종료되었습니다</h3>
              <p>예약된 멘토링 시간이 종료되어 더 이상 메시지를 보낼 수 없습니다.<br />
                 채팅 기록은 계속 확인하실 수 있습니다.</p>
              <div className="session-ended-actions">
                <button 
                  className="extend-session-button"
                  onClick={() => {
                    // 세션 연장 요청 로직
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
                  }}
                >
                  세션 연장 요청
                </button>
                <button 
                  className="new-session-button"
                  onClick={() => {
                    // 새 세션 예약 페이지로 이동
                    onBackToHome();
                  }}
                >
                  새 대화 시작
                </button>
              </div>
            </div>
          </div>
        ) : sessionEnded ? (
          <div className="session-ended-minimal">
            <span className="session-ended-text">세션이 종료되어 메시지를 보낼 수 없습니다.</span>
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
              <Paperclip className="icon" />
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
                <Smile className="icon" />
              </button>
            </div>
            
            <button
              className={`send-button ${message.trim() && !sessionEnded ? 'active' : ''}`}
              onClick={handleSendMessage}
              disabled={!message.trim() || sessionEnded}
            >
              <Send className="icon" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatRoom;