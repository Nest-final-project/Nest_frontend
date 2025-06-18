import React, { useState } from 'react';
import { Menu, Bell, X } from 'lucide-react';
import './Header.css';
import logo from '../image/cool.png';

const Header = ({ onLoginClick }) => {
  const [isNavOpen, setIsNavOpen] = useState(false);

  const handleLoginClick = () => {
    setIsNavOpen(false); // 사이드바 닫기
    onLoginClick(); // 로그인 모달 열기
  };

  return (
    <>
      <header className="header">
        <div className="header-content">
          <div className="logo-section">
            {/* 햄버거 메뉴 버튼 - 병아리 아이콘 왼쪽에 위치 */}
            <button 
              onClick={() => setIsNavOpen(!isNavOpen)}
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
            <button 
              className="login-button glass-effect"
              onClick={onLoginClick}
            >
              로그인
            </button>
            <button className="notification-button">
              <Bell className="icon" />
              <div className="notification-dot"></div>
            </button>
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
          <button 
            onClick={() => setIsNavOpen(false)}
            className="sidebar-close-button"
          >
            <X className="icon" />
          </button>
        </div>
        
        <nav className="sidebar-content">
          <a href="#home" className="sidebar-link" onClick={() => setIsNavOpen(false)}>
            <span className="sidebar-link-icon">🏠</span>
            홈
          </a>
          <a href="#about" className="sidebar-link" onClick={() => setIsNavOpen(false)}>
            <span className="sidebar-link-icon">📖</span>
            소개
          </a>
          <a href="#category" className="sidebar-link" onClick={() => setIsNavOpen(false)}>
            <span className="sidebar-link-icon">📂</span>
            카테고리
          </a>
          <a href="#contact" className="sidebar-link" onClick={() => setIsNavOpen(false)}>
            <span className="sidebar-link-icon">📧</span>
            문의
          </a>
        </nav>
        
        <div className="sidebar-footer">
          <button 
            className="sidebar-login-button"
            onClick={handleLoginClick}
          >
            로그인
          </button>
        </div>
      </div>
    </>
  );
};

export default Header;
