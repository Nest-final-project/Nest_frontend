import React from 'react';
import { Menu, Bell } from 'lucide-react';
import './Header.css';
import logo from '../image/cool.png';

const Header = ({ isMenuOpen, setIsMenuOpen }) => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo-section">
          <div className="logo-icon">
            <img src={logo}/>
          </div>
          <h1 className="logo-text gradient-text">Nest.dev</h1>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="desktop-nav hide-mobile">
          <a href="#home" className="nav-link">홈</a>
          <a href="#mentors" className="nav-link">멘토</a>
          <a href="#programs" className="nav-link">프로그램</a>
          <a href="#about" className="nav-link">소개</a>
          <a href="#contact" className="nav-link">문의</a>
        </nav>
        
        <div className="header-actions">
          <button className="login-button glass-effect">
            로그인
          </button>
          <button className="notification-button">
            <Bell className="icon" />
            <div className="notification-dot"></div>
          </button>
          
          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="menu-button hide-desktop"
          >
            <Menu className="icon" />
          </button>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <div className={`mobile-nav ${isMenuOpen ? 'open' : ''}`}>
        <nav className="mobile-nav-content">
          <a href="#home" className="mobile-nav-link">홈</a>
          <a href="#mentors" className="mobile-nav-link">멘토</a>
          <a href="#programs" className="mobile-nav-link">프로그램</a>
          <a href="#about" className="mobile-nav-link">소개</a>
          <a href="#contact" className="mobile-nav-link">문의</a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
