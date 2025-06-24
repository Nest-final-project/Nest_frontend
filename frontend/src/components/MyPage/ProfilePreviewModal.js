import React from 'react';
import { X, Edit3, AlertTriangle } from 'lucide-react';
import './ProfilePreviewModal.css';

const ProfilePreviewModal = ({ profileData, loading, onClose, onEdit }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container profile-preview-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>🎯 프로필 미리보기</h3>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>프로필 정보를 불러오는 중...</p>
            </div>
          ) : profileData ? (
            <div className="profile-preview">
              <div className="preview-header">
                <div className="preview-avatar">
                  {profileData.imageUrl ? (
                    <img
                      src={profileData.imageUrl}
                      alt="프로필 이미지"
                      className="preview-image"
                    />
                  ) : (
                    <div className="preview-default-avatar">
                      {profileData.name ? profileData.name.charAt(0) : 'M'}
                    </div>
                  )}
                </div>
                <div className="preview-info">
                  <h2 className="preview-name">{profileData.name || '멘토'}님</h2>
                  <p className="preview-title">{profileData.title || '프로필 제목이 없습니다'}</p>
                  {profileData.category && (
                    <span className="preview-category">{profileData.category}</span>
                  )}
                </div>
              </div>

              <div className="preview-body">
                <div className="preview-section">
                  <h4 className="preview-section-title">📝 소개</h4>
                  <p className="preview-introduction">
                    {profileData.introduction || '멘토 소개가 아직 작성되지 않았습니다.'}
                  </p>
                </div>

                {profileData.keywords && profileData.keywords.length > 0 && (
                  <div className="preview-section">
                    <h4 className="preview-section-title">🏷️ 전문 키워드</h4>
                    <div className="preview-keywords">
                      {profileData.keywords.map((keyword, index) => (
                        <span key={index} className="preview-keyword">
                          {keyword.name || keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="preview-section">
                  <h4 className="preview-section-title">📊 프로필 정보</h4>
                  <div className="preview-meta">
                    <div className="preview-meta-item">
                      <span className="preview-meta-label">등록일</span>
                      <span className="preview-meta-value">
                        {profileData.createdAt ?
                          new Date(profileData.createdAt).toLocaleDateString('ko-KR') :
                          '정보 없음'
                        }
                      </span>
                    </div>
                    <div className="preview-meta-item">
                      <span className="preview-meta-label">상태</span>
                      <span className="preview-meta-value">활성</span>
                    </div>
                    <div className="preview-meta-item">
                      <span className="preview-meta-label">카테고리</span>
                      <span className="preview-meta-value">
                        {profileData.category || '미지정'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="error-state">
              <AlertTriangle className="error-icon" />
              <h4>프로필을 불러올 수 없습니다</h4>
              <p>프로필 정보를 가져오는 중 문제가 발생했습니다.</p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="modal-btn cancel" onClick={onClose}>
            닫기
          </button>
          {profileData && (
            <button className="modal-btn confirm" onClick={onEdit}>
              <Edit3 size={16} />
              수정하기
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePreviewModal;
