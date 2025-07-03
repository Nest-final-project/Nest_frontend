import React, {useState, useEffect} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import ChatList from './ChatList';
import ChatRoom from './ChatRoom';
import NotificationContainer from './NotificationContainer';
import {accessTokenUtils} from '../utils/tokenUtils';
import './ChatContainer.css';

const ChatContainer = ({onBack, isLoggedIn = true}) => {
  const [selectedChat, setSelectedChat] = useState(null);
  const { chatRoomId } = useParams();
  const navigate = useNavigate();

  // URL 파라미터가 변경될 때 선택된 채팅방 업데이트
  useEffect(() => {
    if (chatRoomId) {
      // URL에 채팅방 ID가 있어도 ChatList에서 실제 정보를 가져올 때까지 대기
      // 임시 정보는 설정하지 않음
    } else {
      setSelectedChat(null);
    }
  }, [chatRoomId]);

  // JWT 토큰에서 사용자 ID와 역할 추출
  const getCurrentUserInfo = () => {
    try {
      const token = accessTokenUtils.getAccessToken();
      if (!token) {
        return { userId: null, userRole: null };
      }

      // JWT 토큰의 payload 부분 디코딩
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      return {
        userId: payload.sub || payload.userId || payload.id,
        userRole: payload.role || payload.userRole || payload.authorities?.[0] // 역할 정보 확인
      };
    } catch (error) {
      console.error('토큰 파싱 실패:', error);
      return { userId: null, userRole: null };
    }
  };

  const handleChatSelect = (chat) => {
    // 같은 채팅방을 다시 선택한 경우 무시
    if (selectedChat?.id === chat?.id) {
      return;
    }

    // 채팅방 변경 - URL도 함께 변경
    setSelectedChat(chat);
    navigate(`/chat/${chat.id}`);
  };

  const handleBackToList = () => {
    // 모바일에서는 채팅 목록으로, 데스크톱에서는 선택 해제
    setSelectedChat(null);
    navigate('/chat');
  };

  return (
      <div className="chat-container">
        {/* 채팅 목록 사이드바 */}
        <div className={`chat-sidebar ${selectedChat ? 'hidden-mobile' : ''}`}>
          <ChatList
              onChatSelect={handleChatSelect}
              currentChatId={selectedChat?.id || chatRoomId}
              onBack={onBack}
          />
        </div>

        {/* 채팅방 영역 */}
        <div className={`chat-main ${!selectedChat ? 'hidden-mobile' : ''}`}>
          {selectedChat ? (
              <>
                <ChatRoom
                    key={`chatroom-${selectedChat.id}`} // key prop 추가로 강제 재마운트
                    contact={selectedChat.contact}
                    chatRoomId={selectedChat.id}
                    userId={getCurrentUserInfo().userId}
                    userRole={getCurrentUserInfo().userRole}
                    reservationId={selectedChat.reservationId} // 채팅방 정보에서 예약 ID 전달
                    onBack={handleBackToList}
                    onBackToHome={onBack}
                />
              </>
          ) : chatRoomId ? (
              // URL에는 채팅방 ID가 있지만 아직 로드되지 않은 경우
              <div className="no-chat-selected">
                <div className="no-chat-content">
                  <div className="no-chat-icon">🔄</div>
                  <h3 className="no-chat-title">채팅방을 불러오는 중...</h3>
                  <p className="no-chat-description">
                    잠시만 기다려주세요.
                  </p>
                </div>
              </div>
          ) : (
              // 일반적인 채팅방 선택 안내
              <div className="no-chat-selected">
                <div className="no-chat-content">
                  <div className="no-chat-icon">💬</div>
                  <h3 className="no-chat-title">채팅을 선택해주세요</h3>
                  <p className="no-chat-description">
                    왼쪽에서 채팅방을 선택하면 대화를 시작할 수 있습니다.
                  </p>
                </div>
              </div>
          )}
        </div>

        {/* 채팅 화면에서도 알림 표시 - 로그인 상태에서만 */}
        <NotificationContainer isLoggedIn={isLoggedIn}/>
      </div>
  );
};

export default ChatContainer;