import React, { useState, useEffect } from 'react';
import { User, Settings, BookOpen, Heart, LogOut, ArrowLeft, Edit3, Check, X } from 'lucide-react';
import './MyPage.css';
import { userInfoUtils, authUtils } from '../utils/tokenUtils';
import { userAPI, authAPI } from '../services/api';

const MyPage = ({ onBack, onLogout }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState('');
  const [tempBankInfo, setTempBankInfo] = useState({ bank: '', accountNumber: '' });

  // 한국 주요 은행 목록
  const banks = [
    '국민은행', '신한은행', '우리은행', '하나은행', 'KEB하나은행',
    '농협은행', '기업은행', '신협', '우체국은행', '카카오뱅크',
    '케이뱅크', '토스뱅크', '새마을금고', '산업은행', '수협은행',
    '경남은행', '광주은행', '대구은행', '부산은행', '전북은행',
    '제주은행', 'SC제일은행', '한국씨티은행', 'HSBC은행'
  ];

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // 유저 정보 조회 (백엔드 API 호출)
  const fetchUserProfile = async () => {
    setLoading(true);
    setError(null);
    
    // 토큰 확인
    const accessToken = sessionStorage.getItem('accessToken');
    
    if (!accessToken) {
      setError("로그인이 필요합니다. 다시 로그인해주세요.");
      authUtils.clearAllAuthData();
      onLogout();
      return;
    }
    
    try {
      const response = await userAPI.getUser();
      
      if (response.data && response.data.data) {
        const backendUserData = response.data.data;
        
        // 백엔드 응답을 프론트엔드 형식으로 매핑
        const mappedUserInfo = {
          id: backendUserData.id,
          name: backendUserData.name,
          email: backendUserData.email,
          nickName: backendUserData.nickName,
          phoneNumber: backendUserData.phoneNumber,
          userRole: backendUserData.userRole,
          createdAt: backendUserData.createdAt,
          profileImage: backendUserData.profileImage || '/default-profile.svg',
          // 멘토인 경우 은행 정보 추가
          bank: backendUserData.bank || '',
          accountNumber: backendUserData.accountNumber || ''
        };
        
        setUserInfo(mappedUserInfo);
        
        // 세션에도 업데이트된 정보 저장
        userInfoUtils.setUserInfo(mappedUserInfo);
        
      } else {
        setError("사용자 정보를 불러오는데 실패했습니다.");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        setError("인증이 만료되었습니다. 다시 로그인해주세요.");
        authUtils.clearAllAuthData();
        onLogout();
      } else if (error.response?.status === 404) {
        setError("사용자 정보를 찾을 수 없습니다.");
      } else if (error.code === 'ERR_NETWORK') {
        setError("서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.");
      } else {
        setError("마이페이지를 불러오는 중 오류가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      // 백엔드에 로그아웃 요청
      await authAPI.logout();
    } catch (error) {
      // 백엔드 호출 실패해도 클라이언트 로그아웃은 진행
    } finally {
      // 클라이언트 측 로그아웃 처리
      authUtils.clearAllAuthData();
      onLogout();
    }
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      '정말로 회원 탈퇴를 진행하시겠습니까?\n탈퇴 후에는 모든 데이터가 삭제되며 복구할 수 없습니다.'
    );
    
    if (!confirmDelete) return;
    
    try {
      await userAPI.deleteUser();
      alert('회원 탈퇴가 완료되었습니다.');
    } catch (error) {
      alert('회원 탈퇴 중 오류가 발생했습니다. 다시 시도해주세요.');
      return;
    }
    
    // 클라이언트 측 로그아웃 처리
    authUtils.clearAllAuthData();
    onLogout();
  };

  // 필드 편집 관련 함수들
  const handleEditField = (field) => {
    setEditingField(field);
    if (field === 'bankInfo') {
      setTempBankInfo({
        bank: userInfo.bank || '',
        accountNumber: userInfo.accountNumber || ''
      });
    } else {
      setTempValue(userInfo[field] || '');
    }
  };

  const handleSaveField = async (field) => {
    try {
      let updatedUserInfo;
      
      if (field === 'bankInfo') {
        // 은행 정보 업데이트
        // await userAPI.updateUser({ bank: tempBankInfo.bank, accountNumber: tempBankInfo.accountNumber });
        updatedUserInfo = { 
          ...userInfo, 
          bank: tempBankInfo.bank, 
          accountNumber: tempBankInfo.accountNumber 
        };
      } else {
        // 일반 필드 업데이트
        // await userAPI.updateUser({ [field]: tempValue });
        updatedUserInfo = { ...userInfo, [field]: tempValue };
      }
      
      setUserInfo(updatedUserInfo);
      userInfoUtils.setUserInfo(updatedUserInfo);
      
      setEditingField(null);
      setTempValue('');
      setTempBankInfo({ bank: '', accountNumber: '' });
      
      // 성공 메시지 (나중에 토스트로 변경 가능)
      alert('정보가 성공적으로 업데이트되었습니다.');
    } catch (error) {
      alert('정보 업데이트 중 오류가 발생했습니다.');
    }
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setTempValue('');
    setTempBankInfo({ bank: '', accountNumber: '' });
  };

  if (loading) {
    return (
        <div className="mypage-container">
          <div className="mypage-loading">
            <p>사용자 정보를 불러오는 중입니다...</p>
          </div>
        </div>
    );
  }

  if (error) {
    return (
        <div className="mypage-container">
          <div className="mypage-loading error">
            <p>오류: 서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.</p>
            <div className="error-actions">
              <button className="back-button" onClick={onBack}>뒤로 가기</button>
            </div>
          </div>
        </div>
    );
  }

  // 로딩도 아니고 에러도 아닌데 userInfo가 없으면, 데이터를 가져오는 데 실패한 것
  if (!userInfo) {
    return (
        <div className="mypage-container">
          <div className="mypage-loading">
            <p>사용자 정보를 찾을 수 없습니다.</p>
            <button className="back-button" onClick={onBack}>뒤로 가기</button>
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
              <h2>{userInfo.name}</h2>
              <p>{userInfo.email}</p>
              <span className="user-level">
              {userInfo.userRole}
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
                    
                    {/* 이름 - 읽기 전용 */}
                    <div className="info-item">
                      <label>이름</label>
                      <span>{userInfo.name}</span>
                    </div>

                    {/* 닉네임 - 편집 가능 */}
                    <div className="info-item editable">
                      <label>닉네임</label>
                      {editingField === 'nickName' ? (
                        <div className="edit-field">
                          <input
                            type="text"
                            value={tempValue}
                            onChange={(e) => setTempValue(e.target.value)}
                            className="edit-input"
                            autoFocus
                          />
                          <div className="edit-buttons">
                            <button 
                              className="save-btn"
                              onClick={() => handleSaveField('nickName')}
                            >
                              <Check size={16} />
                            </button>
                            <button 
                              className="cancel-btn"
                              onClick={handleCancelEdit}
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="field-display">
                          <span>{userInfo.nickName}</span>
                          <button 
                            className="edit-btn"
                            onClick={() => handleEditField('nickName')}
                          >
                            <Edit3 size={16} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* 이메일 - 편집 가능 */}
                    <div className="info-item editable">
                      <label>이메일</label>
                      {editingField === 'email' ? (
                        <div className="edit-field">
                          <input
                            type="email"
                            value={tempValue}
                            onChange={(e) => setTempValue(e.target.value)}
                            className="edit-input"
                            autoFocus
                          />
                          <div className="edit-buttons">
                            <button 
                              className="save-btn"
                              onClick={() => handleSaveField('email')}
                            >
                              <Check size={16} />
                            </button>
                            <button 
                              className="cancel-btn"
                              onClick={handleCancelEdit}
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="field-display">
                          <span>{userInfo.email}</span>
                          <button 
                            className="edit-btn"
                            onClick={() => handleEditField('email')}
                          >
                            <Edit3 size={16} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* 전화번호 - 편집 가능 */}
                    <div className="info-item editable">
                      <label>전화번호</label>
                      {editingField === 'phoneNumber' ? (
                        <div className="edit-field">
                          <input
                            type="tel"
                            value={tempValue}
                            onChange={(e) => setTempValue(e.target.value)}
                            className="edit-input"
                            autoFocus
                          />
                          <div className="edit-buttons">
                            <button 
                              className="save-btn"
                              onClick={() => handleSaveField('phoneNumber')}
                            >
                              <Check size={16} />
                            </button>
                            <button 
                              className="cancel-btn"
                              onClick={handleCancelEdit}
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="field-display">
                          <span>{userInfo.phoneNumber}</span>
                          <button 
                            className="edit-btn"
                            onClick={() => handleEditField('phoneNumber')}
                          >
                            <Edit3 size={16} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* 멘토인 경우에만 은행 정보 표시 */}
                    {userInfo.userRole === 'MENTOR' && (
                      <div className="info-item editable">
                        <label>은행 정보</label>
                        {editingField === 'bankInfo' ? (
                          <div className="edit-field bank-edit">
                            <select
                              value={tempBankInfo.bank}
                              onChange={(e) => setTempBankInfo({...tempBankInfo, bank: e.target.value})}
                              className="bank-select"
                            >
                              <option value="">은행을 선택하세요</option>
                              {banks.map((bank) => (
                                <option key={bank} value={bank}>{bank}</option>
                              ))}
                            </select>
                            <input
                              type="text"
                              value={tempBankInfo.accountNumber}
                              onChange={(e) => setTempBankInfo({...tempBankInfo, accountNumber: e.target.value})}
                              className="edit-input"
                              placeholder="계좌번호를 입력하세요"
                            />
                            <div className="edit-buttons">
                              <button 
                                className="save-btn"
                                onClick={() => handleSaveField('bankInfo')}
                              >
                                <Check size={16} />
                              </button>
                              <button 
                                className="cancel-btn"
                                onClick={handleCancelEdit}
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="field-display">
                            <span>
                              {userInfo.bank && userInfo.accountNumber 
                                ? `${userInfo.bank} ${userInfo.accountNumber}`
                                : '은행 정보가 없습니다'
                              }
                            </span>
                            <button 
                              className="edit-btn"
                              onClick={() => handleEditField('bankInfo')}
                            >
                              <Edit3 size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 읽기 전용 필드들 */}
                    <div className="info-item">
                      <label>가입일</label>
                      <span>{userInfo.createdAt}</span>
                    </div>
                    <div className="info-item">
                      <label>사용자 유형</label>
                      <span>{userInfo.userRole === 'MENTOR' ? '멘토' : '멘티'}</span>
                    </div>

                    <div className="account-actions">
                      <button
                          className="delete-account-button"
                          onClick={handleDeleteAccount}
                      >
                        회원 탈퇴
                      </button>
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
