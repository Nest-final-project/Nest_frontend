import React, {useState, useEffect, useRef, useCallback} from 'react';
import {Search, Plus, MoreVertical, User, ArrowLeft} from 'lucide-react';
import './ChatList.css';
import axios from "axios";
import { accessTokenUtils } from '../utils/tokenUtils';

const ChatList = ({onChatSelect, currentChatId, onBack}) => {
  const [chatRooms, setChatRooms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastMessageId, setLastMessageId] = useState(null);
  const [cursorTime, setCursorTime] = useState(null);
  const [hasNext, setHasNext] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const chatListRef = useRef(null);

  // 채팅방 목록 조회 함수
  const fetchChatRooms = useCallback(async (reset = false) => {
    if ((!hasNext && !reset) || loading) {
      return;
    }

    // 토큰 확인
    const token = accessTokenUtils.getAccessToken();
    console.log('=== 채팅방 목록 API 호출 ===');
    console.log('토큰 존재:', token ? '있음' : '없음');
    console.log('토큰 길이:', token?.length);
    
    if (!token) {
      console.error('토큰이 없습니다. 로그인이 필요합니다.');
      alert('로그인이 필요합니다.');
      return;
    }

    // 토큰 만료 확인
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      console.log('토큰 만료 시간:', new Date(payload.exp * 1000));
      console.log('현재 시간:', new Date(currentTime * 1000));
      console.log('토큰 만료됨:', currentTime > payload.exp);
      
      if (currentTime > payload.exp) {
        console.error('토큰이 만료되었습니다.');
        accessTokenUtils.removeAccessToken();
        alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
        return;
      }
    } catch (error) {
      console.error('토큰 검증 실패:', error);
      alert('유효하지 않은 토큰입니다. 다시 로그인해주세요.');
      accessTokenUtils.removeAccessToken();
      return;
    }

    setLoading(true);
    try {
      const params = {
        size: 10
      };

      // reset이 아닌 경우에만 커서 정보 추가
      if (!reset) {
        if (lastMessageId) {
          params.lastMessageId = lastMessageId;
        }
        if (cursorTime) {
          params.cursorTime = cursorTime;
        }
      }

      console.log('API 요청 URL:', '/api/chat_rooms');
      console.log('API 요청 파라미터:', params);
      console.log('API 요청 헤더:', {
        'Authorization': `Bearer ${token.substring(0, 20)}...`
      });

      const response = await axios.get('/api/chat_rooms', {
        params,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('API 응답 성공:', response.data);

      const fetchedRooms = response.data.content.map(room => {
        console.log('🔍 ChatList - 백엔드에서 받은 room 데이터:', room);
        
        const currentUserId = parseInt(getCurrentUserId()); // 문자열을 숫자로 변환

        // 현재 사용자가 멘토인지 멘티인지 판단 (JWT 토큰의 사용자 ID 기준)
        const isCurrentUserMentor = currentUserId === room.mentorId;
        
        // 상대방 정보 설정
        const contactInfo = isCurrentUserMentor ? {
          id: room.menteeId,
          name: room.menteeName,
          profileImage: null // 추후 백엔드에서 프로필 이미지도 제공할 수 있음
        } : {
          id: room.mentorId,
          name: room.mentorName,
          profileImage: null
        };

        const chatData = {
          id: room.roomId,
          contact: contactInfo,
          contactTitle: isCurrentUserMentor ? '멘토' : '멘티',
          lastMessage: {
            id: null,
            text: '대화를 시작해보세요!', // 백엔드에서 마지막 메시지 정보를 제공하지 않음
            sender: 'system',
            timestamp: new Date().toISOString(),
            isRead: true
          },
          updatedAt: new Date().toISOString(),
          // 실제 백엔드 데이터
          mentorId: room.mentorId,
          menteeId: room.menteeId,
          isCurrentUserMentor,
          // 디버깅용 추가 정보
          currentUserId,
          mentorName: room.mentorName,
          menteeName: room.menteeName
        };

        console.log('🔍 ChatList - 생성된 chat 데이터:', chatData);
        console.log('🔍 현재 사용자 정보:', {
          currentUserId,
          isCurrentUserMentor,
          contactName: contactInfo.name,
          contactId: contactInfo.id
        });
        
        return chatData;
      });

      if (reset) {
        setChatRooms(fetchedRooms);
      } else {
        setChatRooms(prev => [...prev, ...fetchedRooms]);
      }

      // 다음 페이지를 위한 커서 설정
      if (fetchedRooms.length > 0) {
        const lastRoom = fetchedRooms[fetchedRooms.length - 1];
        setLastMessageId(lastRoom.lastMessage.id);
        setCursorTime(lastRoom.updatedAt);
      }

      setHasNext(response.data.hasNext);
    } catch (err) {
      console.error('=== API 요청 실패 ===');
      console.error('에러:', err);
      console.error('응답 상태:', err.response?.status);
      console.error('응답 상태 텍스트:', err.response?.statusText);
      console.error('응답 데이터:', err.response?.data);
      console.error('응답 헤더:', err.response?.headers);
      console.error('요청 설정:', err.config);
      
      // 에러 처리 - 토큰이 만료된 경우 등
      if (err.response?.status === 401) {
        console.warn('401 Unauthorized - 인증 실패');
        alert('인증에 실패했습니다. 다시 로그인해주세요.');
        accessTokenUtils.removeAccessToken();
        // 로그인 페이지로 리다이렉트 등의 처리 필요
      } else if (err.response?.status === 403) {
        console.warn('403 Forbidden - 권한 없음');
        alert('접근 권한이 없습니다.');
      } else {
        console.error('기타 에러:', err.message);
        alert('채팅방 목록을 불러오는데 실패했습니다.');
      }
    } finally {
      setLoading(false);
      if (initialLoading) {
        setInitialLoading(false);
      }
    }
  }, [lastMessageId, cursorTime, hasNext, loading, initialLoading]);

  // JWT 토큰에서 사용자 정보 추출
  const getCurrentUserInfo = () => {
    try {
      const token = accessTokenUtils.getAccessToken();
      if (!token) {
        return null;
      }

      // JWT 토큰의 payload 부분 디코딩
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.sub || payload.userId || payload.id,
        username: payload.nickName,
        role: payload.role,
        exp: payload.exp
      };
    } catch (error) {
      console.error('토큰 파싱 실패:', error);
      return null;
    }
  };

  const getCurrentUserId = () => {
    const userInfo = getCurrentUserInfo();
    return userInfo?.id || null;
  };

  // 무한 스크롤 처리
  const handleScroll = useCallback(() => {
    const container = chatListRef.current;
    if (!container || loading || !hasNext) {
      return;
    }

    const {scrollTop, scrollHeight, clientHeight} = container;
    if (scrollTop + clientHeight >= scrollHeight - 100) {
      fetchChatRooms(false);
    }
  }, [fetchChatRooms, loading, hasNext]);

  // 채팅방 목록 새로고침
  const refreshChatRooms = useCallback(() => {
    setLastMessageId(null);
    setCursorTime(null);
    setHasNext(true);
    setChatRooms([]);
    fetchChatRooms(true);
  }, [fetchChatRooms]);

  // 초기 로딩
  useEffect(() => {
    fetchChatRooms(true);
  }, []);

  // 스크롤 이벤트 등록
  useEffect(() => {
    const container = chatListRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // 검색 필터링
  const filteredChatRooms = chatRooms.filter(chat =>
      chat.contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength) + '...';
  };

  const handleChatClick = (chat) => {
    console.log('🔍 ChatList - 채팅방 클릭:', {
      chat,
      chatId: chat?.id,
      chatroomId: chat?.id
    });
    onChatSelect(chat);
  };

  if (initialLoading) {
    return (
        <div className="chat-list-container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>채팅방 목록을 불러오는 중...</p>
          </div>
        </div>
    );
  }

  return (
      <div className="chat-list-container">
        {/* 헤더 */}
        <div className="chat-list-header">
          <div className="header-left">
            <button className="back-to-home-button" onClick={onBack}>
              <ArrowLeft className="icon"/>
            </button>
            <h2 className="chat-list-title">메시지</h2>
          </div>
          <div className="header-actions">
            <button
                className="header-action-button"
                onClick={refreshChatRooms}
                title="새로고침"
            >
              <Plus className="icon"/>
            </button>
            <button className="header-action-button">
              <MoreVertical className="icon"/>
            </button>
          </div>
        </div>

        {/* 검색바 */}
        <div className="search-container">
          <div className="search-input-wrapper">
            <Search className="search-icon"/>
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
        <div className="chat-rooms-list" ref={chatListRef}>
          {filteredChatRooms.length === 0 && !loading ? (
              <div className="empty-state">
                <div className="empty-icon">💬</div>
                <p className="empty-text">
                  {searchTerm ? '검색 결과가 없습니다' : '채팅방이 없습니다'}
                </p>
                {!searchTerm && (
                    <button
                        className="refresh-button"
                        onClick={refreshChatRooms}
                    >
                      새로고침
                    </button>
                )}
              </div>
          ) : (
              <>
                {filteredChatRooms.map((chat) => (
                    <div
                        key={chat.id}
                        className={`chat-room-item ${currentChatId === chat.id
                            ? 'active' : ''}`}
                        onClick={() => handleChatClick(chat)}
                    >
                      <div className="chat-avatar-container">
                        <div className="chat-avatar">
                          {chat.contact.profileImage ? (
                              <img
                                  src={chat.contact.profileImage}
                                  alt={chat.contact.name}
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                              />
                          ) : null}
                          <User className="avatar-icon" style={{
                            display: chat.contact.profileImage ? 'none' : 'flex'
                          }}/>
                        </div>
                        {chat.isOnline && <div
                            className="online-indicator"></div>}
                      </div>

                      <div className="chat-info">
                        <div className="chat-header-info">
                          <div className="chat-name-container">
                            <span
                                className="chat-name">{chat.contact.name}</span>
                            <span
                                className="contact-title">{chat.contactTitle}</span>
                          </div>
                          <div className="chat-meta">
                            <span className="chat-time">
                              {formatTime(chat.lastMessage.timestamp)}
                            </span>
                            {chat.unreadCount > 0 && (
                                <div className="unread-badge">
                                  {chat.unreadCount > 99 ? '99+'
                                      : chat.unreadCount}
                                </div>
                            )}
                          </div>
                        </div>

                        <div className="last-message-container">
                          <div className="last-message">
                            <span
                                className={`message-sender ${chat.lastMessage.sender}`}>
                              {chat.lastMessage.sender === 'user' ? '나: ' : ''}
                            </span>
                            <span className={`message-text ${
                                !chat.lastMessage.isRead
                                && chat.lastMessage.sender === 'other'
                                    ? 'unread' : ''
                            }`}>
                              {truncateMessage(chat.lastMessage.text)}
                            </span>
                          </div>

                          {!chat.lastMessage.isRead && chat.lastMessage.sender
                              === 'other' && (
                                  <div className="new-message-indicator"></div>
                              )}
                        </div>
                      </div>
                    </div>
                ))}

                {/* 로딩 인디케이터 */}
                {loading && (
                    <div className="loading-more">
                      <div className="loading-spinner small"></div>
                      <span>더 많은 채팅방을 불러오는 중...</span>
                    </div>
                )}

                {/* 더 이상 로드할 데이터가 없을 때 */}
                {!hasNext && chatRooms.length > 0 && (
                    <div className="end-of-list">
                      <span>모든 채팅방을 확인했습니다</span>
                    </div>
                )}
              </>
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