import React, { useState } from 'react';
import { Search, Plus, MoreVertical, User, ArrowLeft } from 'lucide-react';
import './ChatList.css';

const ChatList = ({ onChatSelect, currentChatId, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // 채팅방 목록 데이터 (실제로는 API에서 가져올 것)
  const chatRooms = [
    {
      id: 1,
      mentor: {
        name: '김개발',
        profileImage: null,
        status: 'online'
      },
      lastMessage: {
        text: '이해하셨다니 다행이네요! 계속 연습하시면 금방 익숙해지실 거예요.',
        timestamp: new Date(Date.now() - 60000 * 2).toISOString(),
        isRead: true,
        sender: 'mentor'
      },
      unreadCount: 0,
      isOnline: true,
      mentorTitle: '시니어 백엔드 개발자'
    },
    {
      id: 2,
      mentor: {
        name: '박프론트',
        profileImage: null,
        status: 'offline'
      },
      lastMessage: {
        text: 'React 컴포넌트 설계에 대해 더 자세히 알려드릴게요.',
        timestamp: new Date(Date.now() - 60000 * 30).toISOString(),
        isRead: false,
        sender: 'mentor'
      },
      unreadCount: 2,
      isOnline: false,
      mentorTitle: '프론트엔드 전문가'
    },
    {
      id: 3,
      mentor: {
        name: '이데이터',
        profileImage: null,
        status: 'online'
      },
      lastMessage: {
        text: '네, 감사합니다! SQL 쿼리 최적화 관련해서 내일 다시 질문드릴게요.',
        timestamp: new Date(Date.now() - 60000 * 120).toISOString(),
        isRead: true,
        sender: 'mentee'
      },
      unreadCount: 0,
      isOnline: true,
      mentorTitle: '데이터 사이언티스트'
    },
    {
      id: 4,
      mentor: {
        name: '최모바일',
        profileImage: null,
        status: 'offline'
      },
      lastMessage: {
        text: 'React Native와 Flutter 중 어떤 것을 추천하시나요?',
        timestamp: new Date(Date.now() - 60000 * 180).toISOString(),
        isRead: true,
        sender: 'mentee'
      },
      unreadCount: 1,
      isOnline: false,
      mentorTitle: '모바일 앱 개발자'
    },
    {
      id: 5,
      mentor: {
        name: '정클라우드',
        profileImage: null,
        status: 'online'
      },
      lastMessage: {
        text: 'AWS 아키텍처 설계 문서를 공유해드릴게요.',
        timestamp: new Date(Date.now() - 60000 * 300).toISOString(),
        isRead: false,
        sender: 'mentor'
      },
      unreadCount: 3,
      isOnline: true,
      mentorTitle: 'DevOps 엔지니어'
    }
  ];

  // 검색 필터링
  const filteredChatRooms = chatRooms.filter(chat =>
    chat.mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.lastMessage.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (timestamp) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - messageTime) / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) {
      return '방금 전';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}분 전`;
    } else if (diffInHours < 24) {
      return `${diffInHours}시간 전`;
    } else if (diffInDays < 7) {
      return `${diffInDays}일 전`;
    } else {
      return messageTime.toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const truncateMessage = (text, maxLength = 40) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const handleChatClick = (chat) => {
    onChatSelect(chat);
  };

  return (
    <div className="chat-list-container">
      {/* 헤더 */}
      <div className="chat-list-header">
        <div className="header-left">
          <button className="back-to-home-button" onClick={onBack}>
            <ArrowLeft className="icon" />
          </button>
          <h2 className="chat-list-title">메시지</h2>
        </div>
        <div className="header-actions">
          <button className="header-action-button">
            <Plus className="icon" />
          </button>
          <button className="header-action-button">
            <MoreVertical className="icon" />
          </button>
        </div>
      </div>

      {/* 검색바 */}
      <div className="search-container">
        <div className="search-input-wrapper">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="채팅방 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* 채팅방 목록 */}
      <div className="chat-rooms-list">
        {filteredChatRooms.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💬</div>
            <p className="empty-text">
              {searchTerm ? '검색 결과가 없습니다' : '채팅방이 없습니다'}
            </p>
          </div>
        ) : (
          filteredChatRooms.map((chat) => (
            <div
              key={chat.id}
              className={`chat-room-item ${currentChatId === chat.id ? 'active' : ''}`}
              onClick={() => handleChatClick(chat)}
            >
              <div className="chat-avatar-container">
                <div className="chat-avatar">
                  {chat.mentor.profileImage ? (
                    <img src={chat.mentor.profileImage} alt={chat.mentor.name} />
                  ) : (
                    <User className="avatar-icon" />
                  )}
                </div>
                {chat.isOnline && <div className="online-indicator"></div>}
              </div>

              <div className="chat-info">
                <div className="chat-header-info">
                  <div className="chat-name-container">
                    <span className="chat-name">{chat.mentor.name}</span>
                    <span className="mentor-title">{chat.mentorTitle}</span>
                  </div>
                  <div className="chat-meta">
                    <span className="chat-time">{formatTime(chat.lastMessage.timestamp)}</span>
                    {chat.unreadCount > 0 && (
                      <div className="unread-badge">
                        {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                      </div>
                    )}
                  </div>
                </div>

                <div className="last-message-container">
                  <div className="last-message">
                    <span className={`message-sender ${chat.lastMessage.sender}`}>
                      {chat.lastMessage.sender === 'mentee' ? '나: ' : ''}
                    </span>
                    <span className={`message-text ${!chat.lastMessage.isRead && chat.lastMessage.sender === 'mentor' ? 'unread' : ''}`}>
                      {truncateMessage(chat.lastMessage.text)}
                    </span>
                  </div>
                  
                  {!chat.lastMessage.isRead && chat.lastMessage.sender === 'mentor' && (
                    <div className="new-message-indicator"></div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 온라인 상태 표시 */}
      <div className="online-status">
        <div className="online-count">
          온라인: {chatRooms.filter(chat => chat.isOnline).length}명
        </div>
      </div>
    </div>
  );
};

export default ChatList;