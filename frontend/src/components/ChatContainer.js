import React, { useState } from 'react';
import ChatList from './ChatList';
import ChatRoom from './ChatRoom';
import NotificationContainer from './NotificationContainer';
import './ChatContainer.css';

const ChatContainer = ({ onBack }) => {
  const [selectedChat, setSelectedChat] = useState(null);

  const handleChatSelect = (chat) => {
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
          <ChatRoom 
            mentor={selectedChat.mentor}
            chatId={selectedChat.id}
            onBack={handleBackToList}
            onBackToHome={onBack}
          />
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
      
      {/* 채팅 화면에서도 알림 표시 */}
      <NotificationContainer />
    </div>
  );
};

export default ChatContainer;