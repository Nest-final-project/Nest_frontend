import React, { useState, useEffect } from 'react';
import ChatList from './ChatList';
import ChatRoom from './ChatRoom';
import NotificationContainer from './NotificationContainer';
import useAuth from '../hooks/useAuth';
import './ChatContainer.css';

const ChatContainer = ({ onBack }) => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [isTabletSize, setIsTabletSize] = useState(false);
  
  // 인증 상태 사용
  const { isLoggedIn, user, loading } = useAuth();

  // 화면 크기 감지
  useEffect(() => {
    const checkScreenSize = () => {
      const windowWidth = window.innerWidth;
      setIsTabletSize(windowWidth > 768 && windowWidth <= 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    setShowMobileSidebar(false); // 채팅 선택 시 사이드바 숨김
  };

  const handleBackToList = () => {
    // 모바일에서는 채팅 목록으로, 데스크톱에서는 선택 해제
    if (window.innerWidth <= 768) {
      setSelectedChat(null);
    } else {
      setSelectedChat(null);
    }
  };

  const toggleMobileSidebar = () => {
    setShowMobileSidebar(!showMobileSidebar);
  };

  // 로딩 중일 때
  if (loading) {
    return (
      <div className="chat-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  // 로그인되지 않은 상태
  if (!isLoggedIn) {
    return (
      <div className="chat-container">
        <div className="login-required">
          <div className="login-required-content">
            <div className="login-required-icon">🔒</div>
            <h3>로그인이 필요합니다</h3>
            <p>채팅 기능을 사용하려면 로그인해주세요.</p>
            <button 
              className="login-button"
              onClick={() => {
                // 로그인 페이지로 이동하거나 로그인 모달 표시
                if (onBack) onBack();
              }}
            >
              로그인하기
            </button>
          </div>
        </div>
        {/* 로그인하지 않은 상태에서는 알림 비활성화 */}
        <NotificationContainer isLoggedIn={false} />
      </div>
    );
  }

  return (
    <div className="chat-container">
      {/* 태블릿 크기에서 햄버거 메뉴 버튼 */}
      {isTabletSize && (
        <button 
          className="tablet-menu-button"
          onClick={toggleMobileSidebar}
          aria-label="채팅 목록 보기"
        >
          ☰
        </button>
      )}

      {/* 채팅 목록 사이드바 */}
      <div className={`chat-sidebar ${selectedChat ? 'hidden-mobile' : ''} ${showMobileSidebar ? 'show-tablet' : ''}`}>
        <ChatList 
          onChatSelect={handleChatSelect}
          currentChatId={selectedChat?.id}
          onBack={onBack}
          user={user}
        />
      </div>

      {/* 사이드바 오버레이 (태블릿에서 사이드바가 열렸을 때) */}
      {showMobileSidebar && isTabletSize && (
        <div 
          className="sidebar-overlay"
          onClick={() => setShowMobileSidebar(false)}
        />
      )}

      {/* 채팅방 영역 */}
      <div className={`chat-main ${!selectedChat ? 'hidden-mobile' : ''}`}>
        {selectedChat ? (
          <ChatRoom 
            contact={selectedChat.contact}
            chatId={selectedChat.id}
            onBack={handleBackToList}
            onBackToHome={onBack}
            user={user}
          />
        ) : (
          <div className="no-chat-selected">
            <div className="no-chat-content">
              <div className="no-chat-icon">💬</div>
              <h3 className="no-chat-title">채팅을 선택해주세요</h3>
              <p className="no-chat-description">
                {isTabletSize ? 
                  "상단의 메뉴 버튼을 눌러 채팅방 목록을 확인하고 대화를 시작해보세요." :
                  "왼쪽에서 채팅방을 선택하면 대화를 시작할 수 있습니다."
                }
              </p>
              {user && (
                <div className="user-welcome">
                  안녕하세요, {user.name || user.nickname || '사용자'}님!
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* 로그인된 상태에서만 알림 표시 */}
      <NotificationContainer isLoggedIn={isLoggedIn} />
    </div>
  );
};

export default ChatContainer;