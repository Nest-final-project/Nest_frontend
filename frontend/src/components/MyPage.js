import React, { useState, useEffect } from 'react';
import { User, Settings, BookOpen, Heart, LogOut, ArrowLeft } from 'lucide-react';
import './MyPage.css';

const MyPage = ({ onBack, onLogout }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    // 로컬 스토리지에서 사용자 정보 가져오기
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('userData');
    
    if (userData) {
      setUserInfo(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    onLogout();
  };

  if (!userInfo) {
    return (
      <div className="mypage-container">
        <div className="mypage-loading">
          <p>사용자 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mypage-container">
      <div className="mypage-header">
        <button className="back-button" onClick={onBack}>
          <ArrowLeft className="icon" />
        </button>
        <h1>마이페이지</h1>
        <button className="logout-button" onClick={handleLogout}>
          <LogOut className="icon" />
          로그아웃
        </button>
      </div>

      <div className="mypage-content">
        <div className="profile-section">
          <div className="profile-image-container">
            <img 
              src={userInfo.profileImage || '/default-profile.svg'} 
              alt="프로필" 
              className="profile-image"
            />
            <button className="profile-edit-button">
              <Settings className="icon" />
            </button>
          </div>
          <div className="profile-info">
            <h2>{userInfo.name || '사용자'}</h2>
            <p>{userInfo.email}</p>
            <span className="user-level">
              {userInfo.userType === 'mentor' ? '멘토' : '멘티'}
            </span>
          </div>
        </div>

        <div className="mypage-tabs">
          <button 
            className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <User className="icon" />
            프로필
          </button>
          <button 
            className={`tab-button ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            <BookOpen className="icon" />
            예약 내역
          </button>
          <button 
            className={`tab-button ${activeTab === 'favorites' ? 'active' : ''}`}
            onClick={() => setActiveTab('favorites')}
          >
            <Heart className="icon" />
            관심 멘토
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'profile' && (
            <div className="profile-tab">
              <div className="info-card">
                <h3>기본 정보</h3>
                <div className="info-item">
                  <label>이름</label>
                  <span>{userInfo.name}</span>
                </div>
                <div className="info-item">
                  <label>이메일</label>
                  <span>{userInfo.email}</span>
                </div>
                <div className="info-item">
                  <label>가입일</label>
                  <span>{userInfo.joinDate || '2024.01.01'}</span>
                </div>
                <div className="info-item">
                  <label>사용자 유형</label>
                  <span>{userInfo.userType === 'mentor' ? '멘토' : '멘티'}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="bookings-tab">
              <div className="booking-list">
                <h3>최근 예약 내역</h3>
                <div className="empty-state">
                  <BookOpen className="empty-icon" />
                  <p>아직 예약 내역이 없습니다.</p>
                  <span>첫 번째 멘토링을 예약해보세요!</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'favorites' && (
            <div className="favorites-tab">
              <div className="favorites-list">
                <h3>관심 멘토</h3>
                <div className="empty-state">
                  <Heart className="empty-icon" />
                  <p>관심 멘토가 없습니다.</p>
                  <span>마음에 드는 멘토를 찾아보세요!</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyPage;
