import React, { useState, useEffect } from 'react';
import { Menu, Bell, X } from 'lucide-react';
import notificationService from '../services/notificationService';
import './Header.css';
import logo from '../image/cool.png';
import { categoryAPI, authAPI } from '../services/api';
import { accessTokenUtils, refreshTokenUtils } from '../utils/tokenUtils';
import {decodeToken} from "../utils/authUtils.js";
import { useNavigate } from 'react-router-dom';

const Header = ({
  onCategorySelect,
  onChatRoom,
  onProfileClick,
  onInquiry,
  isLoggedIn,
  userInfo,
  onLogout,
  onAdminDashboard
}) => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(true); // 알림 상태
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

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
    navigate('/login');
  };

  const handleLogoutClick = async () => {
    try {
      await authAPI.logout();
      accessTokenUtils.removeAccessToken();
      refreshTokenUtils.removeRefreshToken();
      if (onLogout) onLogout();
      setIsNavOpen(false);
      console.log('✅ 로그아웃 완료');
    } catch (error) {
      console.error('❌ 로그아웃 중 오류 발생:', error);
      accessTokenUtils.removeAccessToken();
      refreshTokenUtils.removeRefreshToken();
      if (onLogout) onLogout();
      setIsNavOpen(false);
    }
  };

  const handleProfileClick = () => {
    if (onProfileClick) onProfileClick();
  };

  const handleCategoryClick = (categoryName) => {
    setIsNavOpen(false);
    setIsCategoryOpen(false);
    onCategorySelect(categoryName);
  };

  // 메인페이지로 이동
  const goHome = () => {
    window.location.href = '/';
  };

  return (
      <>
        <header className="header">
          <div className="header-content">
            <div className="logo-section">
              {/* 햄버거 메뉴 버튼 */}
              <button
                  onClick={toggleSidebar}
                  className="nav-menu-button"
              >
                <Menu className="icon" />
              </button>
              {/* 로고 클릭 시 메인으로 이동 */}
              <div className="logo-icon" onClick={goHome} style={{ cursor: 'pointer' }}>
                <img src={logo} alt="Cool Chick"/>
              </div>
              <h1
                  className="logo-text gradient-text"
                  onClick={goHome}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                Nest.dev
              </h1>
            </div>
            <div className="header-actions">
              {isLoggedIn ? (
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
                  <button
                      className="login-button glass-effect"
                      onClick={handleLoginClick}
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
              <h2
                  className="logo-text gradient-text"
                  onClick={goHome}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
              >Nest.dev</h2>
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
                        onClick={() => handleCategoryClick(cat.name)}
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
                      onInquiry && onInquiry('faq');
                    }}
                >
                  자주 묻는 질문
                </button>
                <button
                    className="sidebar-sublink"
                    onClick={() => {
                      setIsNavOpen(false);
                      setIsInquiryOpen(false);
                      onInquiry && onInquiry('inquiries');
                    }}
                >
                  문의 사항
                </button>
                <button
                    className="sidebar-sublink"
                    onClick={() => {
                      setIsNavOpen(false);
                      setIsInquiryOpen(false);
                      onInquiry && onInquiry('myInquiries');
                    }}
                >
                  내 문의 내역
                </button>
                <button
                    className="sidebar-sublink"
                    onClick={() => {
                      setIsNavOpen(false);
                      setIsInquiryOpen(false);
                      onInquiry && onInquiry('create');
                    }}
                >
                  문의하기
                </button>
                <button
                    className="sidebar-sublink"
                    onClick={() => {
                      setIsNavOpen(false);
                      setIsInquiryOpen(false);
                      onInquiry && onInquiry('notice');
                    }}
                >
                  공지사항
                </button>
              </div>
            </div>
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
                  {/* 관리자만 볼 수 있는 관리자 페이지 버튼 */}
                  {userInfo?.userRole === 'ADMIN' && (
                    <button
                        className="sidebar-link admin-button"
                        onClick={() => {
                          setIsNavOpen(false);
                          onAdminDashboard && onAdminDashboard();
                        }}
                    >
                      <span className="sidebar-link-icon">⚙️</span>
                      관리자 대시보드
                    </button>
                  )}
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
