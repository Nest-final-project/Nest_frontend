import React, { useState, useEffect } from 'react';
import { Menu, Bell, X } from 'lucide-react';
import notificationService from '../services/notificationService';
import './Header.css';
import logo from '../image/cool.png';
import { categoryAPI, authAPI } from '../services/api';
import { accessTokenUtils, refreshTokenUtils } from '../utils/tokenUtils';

const Header = ({ onLoginClick, onCategorySelect, onChatRoom, onProfileClick, onInquiry, isLoggedIn, userInfo, onLogout,onSSEDemo }) => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(true); // 알림 상태
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (isNavOpen && isCategoryOpen) {
      categoryAPI.getCategories()
      .then((res) => {
        const categoryList = res?.data?.data?.content || [];
        setCategories(categoryList);
      })
      .catch((err) => {
        console.error('카테고리 불러오기 실패:', err);
      });
    }
  }, [isNavOpen, isCategoryOpen]);

  const toggleSidebar = () => setIsNavOpen(!isNavOpen);
  const toggleCategory = () => setIsCategoryOpen(!isCategoryOpen);
  const toggleInquiry = () => setIsInquiryOpen(!isInquiryOpen);

  const handleLoginClick = () => {
    setIsNavOpen(false);
    onLoginClick();
  };

  const handleLogoutClick = async () => {
    try {
      // 백엔드 로그아웃 API 호출
      await authAPI.logout();

      // 로컬 토큰 제거
      accessTokenUtils.removeAccessToken();
      refreshTokenUtils.removeRefreshToken();

      // 부모 컴포넌트에 로그아웃 알림
      if (onLogout) {
        onLogout();
      }

      setIsNavOpen(false);

      console.log('✅ 로그아웃 완료');
    } catch (error) {
      console.error('❌ 로그아웃 중 오류 발생:', error);

      // 로그아웃 API가 실패해도 로컬 토큰은 제거
      accessTokenUtils.removeAccessToken();
      refreshTokenUtils.removeRefreshToken();

      if (onLogout) {
        onLogout();
      }

      setIsNavOpen(false);
    }
  };

  const handleProfileClick = () => {
    if (onProfileClick) {
      onProfileClick();
    }
  };

  const handleCategoryClick = (categoryName) => {
    setIsNavOpen(false);
    setIsCategoryOpen(false);
    onCategorySelect(categoryName);  // ✅ 여기서 category.name 넘김
  };

  return (
    <>
      <header className="header">
        <div className="header-content">
          <div className="logo-section">
            {/* 햄버거 메뉴 버튼 - 병아리 아이콘 왼쪽에 위치 */}
            <button
                onClick={toggleSidebar}
              className="nav-menu-button"
            >
              <Menu className="icon" />
            </button>
            
            <div className="logo-icon">
              <img src={logo} alt="Cool Chick"/>
            </div>
            <h1 className="logo-text gradient-text">Nest.dev</h1>
          </div>
          
          <div className="header-actions">
            {/* 로그인 상태에 따른 조건부 렌더링 */}
            {isLoggedIn ? (
                // 로그인된 상태: 알림 + 프로필 사진
                <>
                  <button className="notification-button">
                    <Bell className="icon" />
                    {hasNotifications && <div className="notification-dot"></div>}
                  </button>
                  <button className="profile-button" onClick={handleProfileClick}>
                    <img
                        src={userInfo?.profileImage || '/default-profile.svg'}
                        alt="프로필"
                        className="profile-image"
                        onError={(e) => {
                          e.target.src = '/default-profile.svg';
                        }}
                    />
                  </button>
                </>
            ) : (
                // 로그인되지 않은 상태: 로그인 버튼만
                <button
                    className="login-button glass-effect"
                    onClick={onLoginClick}
                >
                  로그인
                </button>
            )}
          </div>
        </div>
      </header>

      {/* 사이드바 네비게이션 */}
      <div className={`sidebar-overlay ${isNavOpen ? 'open' : ''}`} onClick={() => setIsNavOpen(false)} />
      <div className={`sidebar-nav ${isNavOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <img src={logo} alt="Cool Chick"/>
            <h2>Nest.dev</h2>
          </div>
          <button onClick={toggleSidebar} className="sidebar-close-button">
            <X className="icon" />
          </button>
        </div>

        <nav className="sidebar-content">
          <a href="#home" className="sidebar-link" onClick={toggleSidebar}>
            <span className="sidebar-link-icon">🏠</span>홈
          </a>
          <a href="#about" className="sidebar-link" onClick={toggleSidebar}>
            <span className="sidebar-link-icon">📖</span>소개
          </a>
          
          {/* 카테고리 드롭다운 섹션 */}
          <div className="sidebar-category-section">
            <button 
              className={`sidebar-category-toggle ${isCategoryOpen ? 'open' : ''}`}
              onClick={toggleCategory}
            >
              <span className="sidebar-link-icon">📂</span>
              카테고리
              <span className={`category-arrow ${isCategoryOpen ? 'rotated' : ''}`}>
                ▼
              </span>
            </button>
            <div className={`sidebar-subcategories ${isCategoryOpen ? 'open' : ''}`}>
              {categories.map(cat => (
                  <button
                      key={cat.id}
                      className="sidebar-sublink"
                      onClick={() => handleCategoryClick(cat.name)}  // ✅ 여기
                  >
                    {cat.name}
                  </button>
              ))}
            </div>
          </div>
          
          {/* 고객센터 드롭다운 섹션 */}
          <div className="sidebar-category-section">
            <button
              className={`sidebar-category-toggle ${isInquiryOpen ? 'open' : ''}`}
              onClick={toggleInquiry}
            >
              <span className="sidebar-link-icon">🏠</span>
              고객센터
              <span className={`category-arrow ${isInquiryOpen ? 'rotated' : ''}`}>
                ▼
              </span>
            </button>
            <div className={`sidebar-subcategories ${isInquiryOpen ? 'open' : ''}`}>
              <button
                className="sidebar-sublink"
                onClick={() => {
                  setIsNavOpen(false);
                  setIsInquiryOpen(false);
                  // 자주 묻는 질문 페이지로 이동 (추후 구현)
                }}
              >
                자주 묻는 질문
              </button>
              <button
                className="sidebar-sublink"
                onClick={() => {
                  setIsNavOpen(false);
                  setIsInquiryOpen(false);
                  onInquiry && onInquiry('inquiries'); // 문의 사항 탭으로
                }}
              >
                문의 사항
              </button>
              <button
                className="sidebar-sublink"
                onClick={() => {
                  setIsNavOpen(false);
                  setIsInquiryOpen(false);
                  onInquiry && onInquiry('create'); // 문의하기 탭으로
                }}
              >
                문의하기
              </button>
              <button
                className="sidebar-sublink"
                onClick={() => {
                  setIsNavOpen(false);
                  setIsInquiryOpen(false);
                  // 공지사항 페이지로 이동 (추후 구현)
                }}
              >
                공지사항
              </button>
            </div>
          </div>
          
          {/* 채팅 메뉴 - 로그인 상태에서만 표시 */}
          {isLoggedIn && (
            <>
              <button
                className="sidebar-link chat-button"
                onClick={() => {
                  setIsNavOpen(false);
                  onChatRoom && onChatRoom({ name: '김개발' });
                }}
              >
                <span className="sidebar-link-icon">💬</span>
                채팅
              </button>

              {/* SSE 데모 메뉴 */}
              <button
                className="sidebar-link sse-demo-button"
                onClick={() => {
                  setIsNavOpen(false);
                  onSSEDemo && onSSEDemo();
                }}
              >
                <span className="sidebar-link-icon">🔔</span>
                SSE 알림 데모
              </button>
            </>
          )}
        </nav>
        
        <div className="sidebar-footer">
          {isLoggedIn ? (
            <button
              className="sidebar-logout-button"
              onClick={handleLogoutClick}
            >
              로그아웃
            </button>
          ) : (
            <button
              className="sidebar-login-button"
              onClick={handleLoginClick}
            >
              로그인
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default Header;
