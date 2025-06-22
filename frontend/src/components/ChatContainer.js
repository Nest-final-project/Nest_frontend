import React, {useState} from 'react';
import ChatList from './ChatList';
import ChatRoom from './ChatRoom';
import NotificationContainer from './NotificationContainer';
import { accessTokenUtils } from '../utils/tokenUtils';
import './ChatContainer.css';

const ChatContainer = ({onBack, isLoggedIn = true}) => {
  const [selectedChat, setSelectedChat] = useState(null);

  // JWT 토큰에서 사용자 ID 추출
  const getCurrentUserId = () => {
    try {
      const token = accessTokenUtils.getAccessToken();
      if (!token) {
        return null;
      }

      // JWT 토큰의 payload 부분 디코딩
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub || payload.userId || payload.id;
    } catch (error) {
      console.error('토큰 파싱 실패:', error);
      return null;
    }
  };

  const handleChatSelect = (chat) => {
    console.log('🔍 ChatContainer - 채팅 선택:', {
      chat,
      chatId: chat?.id,
      chatIdType: typeof chat?.id
    });
    setSelectedChat(chat);
  };

  const handleBackToList = () => {
    // 모바일에서는 채팅 목록으로, 데스크톱에서는 선택 해제
    if (window.innerWidth <= 768) {
      setSelectedChat(null);
    } else {
      setSelectedChat(null);
    }
  };

  return (
      <div className="chat-container">
        {/* 채팅 목록 사이드바 */}
        <div className={`chat-sidebar ${selectedChat ? 'hidden-mobile' : ''}`}>
          <ChatList
              onChatSelect={handleChatSelect}
              currentChatId={selectedChat?.id}
              onBack={onBack}
          />
        </div>

        {/* 채팅방 영역 */}
        <div className={`chat-main ${!selectedChat ? 'hidden-mobile' : ''}`}>
          {selectedChat ? (
              <>
                {/* 디버깅용 로그 */}
                {console.log('🔍 ChatContainer - ChatRoom 렌더링:', {
                  selectedChat,
                  chatRoomId: selectedChat.id,
                  contact: selectedChat.contact,
                  userId: getCurrentUserId()
                })}
                <ChatRoom
                    contact={selectedChat.contact}
                    chatRoomId={selectedChat.id}
                    userId={getCurrentUserId()}
                    reservationId={null} // 임시로 null, 나중에 백엔드에서 제공받아야 함
                    onBack={handleBackToList}
                    onBackToHome={onBack}
                />
              </>
          ) : (
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