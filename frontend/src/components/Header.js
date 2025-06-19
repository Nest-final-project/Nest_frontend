import React, { useState, useEffect } from 'react';
import { Menu, Bell, X } from 'lucide-react';
import './Header.css';
import logo from '../image/cool.png';
import { categoryAPI } from '../services/api';

const Header = ({ onLoginClick, onCategorySelect, onChatRoom }) => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
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

  const handleLoginClick = () => {
    setIsNavOpen(false);
    onLoginClick();
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
              <button onClick={toggleSidebar} className="nav-menu-button">
                <Menu className="icon" />
              </button>
              <div className="logo-icon">
                <img src={logo} alt="Cool Chick" />
              </div>
              <h1 className="logo-text gradient-text">Nest.dev</h1>
            </div>
            <div className="header-actions">
              <button className="login-button glass-effect" onClick={onLoginClick}>로그인</button>
              <button className="notification-button">
                <Bell className="icon" />
                <div className="notification-dot" />
              </button>
            </div>
          </div>
        </header>

        <div className={`sidebar-overlay ${isNavOpen ? 'open' : ''}`} onClick={toggleSidebar} />
        <div className={`sidebar-nav ${isNavOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <div className="sidebar-logo">
              <img src={logo} alt="Cool Chick" />
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

            <div className="sidebar-category-section">
              <button className={`sidebar-category-toggle ${isCategoryOpen ? 'open' : ''}`} onClick={toggleCategory}>
                <span className="sidebar-link-icon">📂</span>카테고리
                <span className={`category-arrow ${isCategoryOpen ? 'rotated' : ''}`}>▼</span>
              </button>
              <div className={`sidebar-subcategories ${isCategoryOpen ? 'open' : ''}`}>
                {/*<button className="sidebar-sublink" onClick={() => handleCategoryClick(null)}>전체 멘토</button>*/}
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

            <a href="#contact" className="sidebar-link" onClick={toggleSidebar}>
              <span className="sidebar-link-icon">📧</span>문의
            </a>
          </nav>

          <div className="sidebar-footer">
            <button className="sidebar-login-button" onClick={handleLoginClick}>로그인</button>
          </div>
        </div>
      </>
  );
};

export default Header;
