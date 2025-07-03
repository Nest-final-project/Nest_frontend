import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  Eye,
  Edit3,
  Calendar,
  CheckCircle,
  ArrowRight,
  X,
  AlertTriangle,
  Briefcase,
  MessageSquare,
  CreditCard,
  Trash2,
  UserX,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { profileAPI, categoryAPI, keywordAPI } from '../../services/api';
import { authUtils } from '../../utils/tokenUtils';
import ProfileEditModal from './ProfileEditModal.jsx';
import ProfilePreviewModal from './ProfilePreviewModal.jsx';
import MentorProfileModal from './MentorProfileModal';
import './MentorRegistration.css';

const MentorRegistration = ({ userInfo, onLogout }) => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  // 프로필 수정 관련 state
  const [editingProfile, setEditingProfile] = useState(null);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [keywords, setKeywords] = useState([]);

  // 프로필 미리보기 관련 state
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewProfileData, setPreviewProfileData] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);

  // 프로필 삭제 관련 state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const hasProfile = profiles.length > 0;

  useEffect(() => {
    if (userInfo?.userRole === 'MENTOR' && !dataLoaded) {
      fetchMentorProfile();
    }
  }, [userInfo, dataLoaded]);

  const fetchMentorProfile = async () => {
    console.log('🔍 멘토 프로필 로딩 시작...');
    setLoading(true);
    setError(null);

    try {
      const response = await profileAPI.getMyProfile();
      console.log('📥 API 응답:', response);
      const rawProfiles = response.data.data.content;
      console.log('📋 프로필 데이터:', rawProfiles);

      if (rawProfiles && rawProfiles.length > 0) {
        setProfiles(rawProfiles);
        setDataLoaded(true);
      } else {
        setProfiles([]);
        setDataLoaded(true);
      }
      console.log('✅ 프로필 설정 완료:', rawProfiles?.length || 0, '개');
    } catch (err) {
      console.error('❌ 프로필 로딩 실패:', err);
      setError("오류가 발생했습니다. 다시 시도해 주세요.");
      setProfiles([]);
      setDataLoaded(true);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setDataLoaded(false);
    setError(null);
    fetchMentorProfile();
  };

  // 멘토 프로필 미리보기
  const handleViewMentorProfile = async (profileId) => {
    console.log('👀 프로필 미리보기 모달 열기:', profileId);

    setShowPreviewModal(true);
    setPreviewLoading(true);
    setPreviewProfileData(null);

    try {
      const response = await profileAPI.getMentorDetail(userInfo.id, profileId);
      console.log('📥 프로필 상세 응답:', response);

      const profileDetail = response.data.data;
      setPreviewProfileData(profileDetail);

    } catch (error) {
      console.error('❌ 프로필 상세 로딩 실패:', error);
      alert('프로필 정보를 불러오는데 실패했습니다.');
      setShowPreviewModal(false);
    } finally {
      setPreviewLoading(false);
    }
  };

  // 프로필 수정 모달 열기
  const handleEditProfile = async (profile) => {
    console.log('🔧 프로필 수정 모달 열기 시작:', profile);

    setEditingProfile(profile);
    setShowEditProfileModal(true);

    // 카테고리와 키워드 목록 로딩
    await fetchCategories();
    await fetchKeywords();
  };

  // 카테고리 목록 가져오기
  const fetchCategories = async () => {
    try {
      console.log('📂 카테고리 목록 가져오는 중...');
      const response = await categoryAPI.getCategories();
      const fetchedCategories = response.data.data.content;

      if (Array.isArray(fetchedCategories)) {
        setCategories(fetchedCategories);
        console.log('✅ 카테고리 목록 로딩 완료:', fetchedCategories.length, '개');
      } else {
        console.warn('⚠️ 카테고리 데이터가 배열이 아님:', fetchedCategories);
        setCategories([]);
      }
    } catch (error) {
      console.error('❌ 카테고리 로딩 실패:', error);
      setCategories([]);
      alert('카테고리 목록을 불러오는데 실패했습니다.');
    }
  };

  // 키워드 목록 가져오기
  const fetchKeywords = async () => {
    try {
      const response = await keywordAPI.getKeywords();
      const fetchedKeywords = response.data.data.content;

      if (Array.isArray(fetchedKeywords)) {
        setKeywords(fetchedKeywords);
      } else {
        setKeywords([]);
      }
    } catch (err) {
      setKeywords([]);
      alert("키워드 목록을 불러오는데 실패했습니다.");
    }
  };

  // 프로필 업데이트 후 콜백
  const handleProfileUpdated = (updatedProfile) => {
    setProfiles(prevProfiles =>
      prevProfiles.map(profile =>
        profile.id === updatedProfile.id ? updatedProfile : profile
      )
    );
  };

  // 프로필 삭제 모달 열기
  const handleDeleteProfile = (profile) => {
    setProfileToDelete(profile);
    setShowDeleteModal(true);
  };

  // 프로필 삭제 모달 닫기
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setProfileToDelete(null);
  };

  // 프로필 삭제 실행
  const confirmDeleteProfile = async () => {
    if (!profileToDelete) return;

    try {
      setDeleteLoading(true);
      await profileAPI.deleteProfile(profileToDelete.id);
      
      // 프로필 목록에서 삭제된 프로필 제거
      setProfiles(prevProfiles => 
        prevProfiles.filter(profile => profile.id !== profileToDelete.id)
      );
      
      closeDeleteModal();

    } catch (error) {
      console.error('프로필 삭제 실패:', error);
      alert('프로필 삭제에 실패했습니다');
    } finally {
      setDeleteLoading(false);
    }
  };

  // 프로필 생성 핸들러
  const handleCreateProfile = async (formData) => {
    try {
      console.log('📤 프로필 생성 요청:', formData);
      
      // 프로필 생성 (중복 체크는 모달에서 이미 처리됨)
      await profileAPI.createProfile(formData);
      
      console.log('✅ 프로필 생성 성공');
      setModalOpen(false);
      await fetchMentorProfile();

    } catch (error) {
      console.error('❌ 프로필 생성 실패:', error);
      
      if (error.response?.status === 400) {
        const errorData = error.response?.data;
        
        if (errorData?.message && errorData.message.includes('이미')) {
          // 중복 에러는 모달을 닫지 않고 에러만 표시
          console.log('백엔드에서 중복 에러 감지, 모달 유지');
          // 모달은 열린 상태로 유지하고, 에러는 console에만 표시
          return;
        } else {
          alert(`입력 오류: ${errorData?.message || '입력 정보를 확인해주세요'}`);
        }
      } else if (error.response?.status === 401) {
        alert('로그인이 만료되었습니다');
        authUtils.clearAllAuthData();
        onLogout();
      } else {
        alert('프로필 처리 중 오류가 발생했습니다');
      }
    }
  };

  // 멘토가 아닌 경우 렌더링하지 않음
  if (userInfo?.userRole !== 'MENTOR') {
    return null;
  }

  if (loading) {
    return (
      <div className="mentor-register-tab">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>멘토 프로필을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mentor-profile-error">
        <div className="error-icon">
          {/* 예시: 아이콘 */}
          <svg width="48" height="48" fill="none"><rect width="48" height="48" rx="12" fill="#eee"/><path d="M24 14v12" stroke="#888" strokeWidth="2" strokeLinecap="round"/><circle cx="24" cy="32" r="2" fill="#888"/></svg>
        </div>
        <div className="error-title">오류가 발생했습니다</div>
        <div className="error-desc">{error}</div>
        <button onClick={() => window.location.reload()}>다시 시도</button>
      </div>
    );
  }

  return (
    <div className="mentor-registration-container">
      <div className="section-header">
        <div className="header-content">
          <div className="header-text">
            <h3>✨ 내 멘토 프로필</h3>
            <p>전문성을 세상에 공유하고 성장을 이끌어주세요</p>
          </div>
          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-number">{profiles.length}</span>
              <span className="stat-label">활성 프로필</span>
            </div>
          </div>
        </div>
      </div>

      {hasProfile ? (
        <>
          <div className="mentor-profile-list">
            {profiles.map((profile, index) => (
              <div key={profile.id} className="mentor-profile-card" data-delay={index}>
                {/* 프로필 헤더 */}
                <div className="profile-card-header">
                  <div className="profile-avatar">
                    <div className="avatar-initials">
                      {profile.name ? profile.name.charAt(0) : 'M'}
                    </div>
                    <div className="status-dot"></div>
                  </div>
                  <div className="profile-basic-info">
                    <h4 className="profile-name">{profile.name}님</h4>
                    <p className="profile-title">{profile.title}</p>
                    <div className="profile-category">
                      <span className="category-badge">{profile.category || '미지정'}</span>
                    </div>
                  </div>
                </div>

                {/* 프로필 본문 */}
                <div className="profile-card-body">
                  <div className="introduction-section">
                    <h5 className="section-title">🎯 소개</h5>
                    <p className="introduction-text">
                      {profile.introduction ?
                        (profile.introduction.length > 120 ?
                          `${profile.introduction.substring(0, 120)}...` :
                          profile.introduction) :
                        '멘토 소개가 아직 작성되지 않았습니다.'
                      }
                    </p>
                  </div>

                </div>

                {/* 프로필 푸터 */}
                <div className="profile-card-footer">
                  <button
                    className="profile-action-btn primary"
                    onClick={() => handleViewMentorProfile(profile.id)}
                  >
                    <Eye size={16} />
                    프로필 미리보기
                  </button>
                  <button
                    className="profile-action-btn secondary"
                    onClick={() => handleEditProfile(profile)}
                  >
                    <Edit3 size={16} />
                    수정하기
                  </button>
                  <button
                    className="profile-action-btn danger"
                    onClick={() => handleDeleteProfile(profile)}
                    title="프로필 삭제"
                  >
                    <Trash2 size={16} />
                    삭제
                  </button>
                </div>

                {/* 호버 이펙트를 위한 장식 요소 */}
                <div className="card-glow"></div>
              </div>
            ))}
          </div>
          <button className="mentor-add-btn" onClick={() => setModalOpen(true)}>프로필 추가</button>
        </>
      ) : (
        <div className="mentor-profile-empty">
          <div className="empty-icon">
            {/* 예시: 아이콘 (SVG) */}
            <svg width="48" height="48" fill="none"><rect width="48" height="48" rx="12" fill="#eee"/><path d="M16 32V20a8 8 0 0 1 16 0v12" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><rect x="12" y="32" width="24" height="8" rx="2" fill="#ccc"/></svg>
          </div>
          <div className="empty-title">등록된 멘토 프로필이 없습니다</div>
          <div className="empty-desc">멘토 프로필을 등록하고 활동을 시작해보세요!</div>
          <button className="mentor-register-btn" onClick={() => setModalOpen(true)}>
            멘토 등록하기
          </button>
        </div>
      )}

      {modalOpen && (
        <MentorProfileModal
          onClose={() => setModalOpen(false)}
          onSubmit={async (formData) => {
            await handleCreateProfile(formData);
          }}
          existingProfiles={profiles}
          onBackendError={(errorMessage) => {
            // 백엔드 에러를 모달에서 처리할 수 있도록 콜백 추가
            console.log('백엔드 에러:', errorMessage);
          }}
        />
      )}

      {/* 프로필 수정 모달 */}
      {showEditProfileModal && (
        <ProfileEditModal
          profile={editingProfile}
          categories={categories}
          keywords={keywords}
          onClose={() => setShowEditProfileModal(false)}
          onUpdate={handleProfileUpdated}
          onLogout={onLogout}
        />
      )}

      {/* 프로필 미리보기 모달 */}
      {showPreviewModal && (
        <ProfilePreviewModal
          profileData={previewProfileData}
          loading={previewLoading}
          onClose={() => {
            setShowPreviewModal(false);
            setPreviewProfileData(null);
          }}
          onEdit={() => {
            setShowPreviewModal(false);
            if (previewProfileData) {
              handleEditProfile(previewProfileData);
            }
          }}
        />
      )}

      {/* 프로필 삭제 확인 모달 */}
      {showDeleteModal && profileToDelete && (
        <div className="modal-overlay" onClick={closeDeleteModal}>
          <div className="delete-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="delete-modal-header">
              <div className="delete-modal-icon">
                <UserX size={48} />
              </div>
              <h3>프로필 삭제</h3>
              <button className="modal-close-btn" onClick={closeDeleteModal}>
                <X size={24} />
              </button>
            </div>

            <div className="delete-modal-body">
              <div className="profile-delete-info">
                <h4>"{profileToDelete.title}" 프로필을 삭제하시겠습니까?</h4>
                <p className="delete-warning">
                  이 작업은 되돌릴 수 없으며, 다음 데이터들이 영구적으로 삭제됩니다:
                </p>
                <ul className="delete-warning-list">
                  <li>프로필 정보 및 소개</li>
                  <li>관련된 경력 정보</li>
                  <li>상담 가능 시간</li>
                  <li>해당 프로필로 받은 예약</li>
                  <li>리뷰 및 평점 데이터</li>
                </ul>
              </div>
            </div>

            <div className="delete-modal-footer">
              <button
                className="modal-btn cancel-btn"
                onClick={closeDeleteModal}
                disabled={deleteLoading}
              >
                취소
              </button>
              <button
                className="modal-btn delete-btn"
                onClick={confirmDeleteProfile}
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <div className="delete-spinner"></div>
                ) : (
                  <>
                    <Trash2 size={16} />
                    삭제하기
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorRegistration;
