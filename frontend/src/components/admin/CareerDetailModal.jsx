import React, { memo } from 'react';
import { RefreshCw, CheckCircle, XCircle, User } from 'lucide-react';
import './AdminCommon.css';

const CareerDetailModal = memo(({
  isOpen,
  onClose,
  career,
  onStatusChange,
  detailLoading,
  isDarkMode,
}) => {
  if (!isOpen) return null;

  // 상태 뱃지 생성
  const getStatusBadge = (status) => {
    switch (status) {
      case 'AUTHORIZED':
        return { className: 'approved', text: '승인됨', icon: CheckCircle };
      case 'UNAUTHORIZED':
      default:
        return { className: 'rejected', text: '거절됨', icon: XCircle };
    }
  };

  // 날짜 포맷
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return dateStr.slice(0, 10);
  };

  const statusBadge = career ? getStatusBadge(career.status) : null;
  const StatusIcon = statusBadge?.icon;

  // 상태 변경 핸들러
  const handleStatusChange = async (careerId, newStatus) => {
    try {
      await onStatusChange(careerId, newStatus);
      onClose();
    } catch (error) {
      console.error('모달에서 상태 변경 실패:', error);
    }
  };

  return (
    <div className={`form-modal-overlay ${isDarkMode ? 'dark-mode' : ''}`} onClick={onClose}>
      <div className="form-modal-content admin-career-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="form-modal-header">
          <h3>경력 상세 정보</h3>
          <button className="form-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="form-modal-body">
          {detailLoading ? (
            <div className="loading-state">
              <RefreshCw className="spinning" size={24} />
              <p>상세 정보를 불러오는 중...</p>
            </div>
          ) : !career ? (
            <div className="empty-state">
              <p>상세 정보를 불러올 수 없습니다.</p>
            </div>
          ) : (
            <div className="admin-career-info">
              <div className="info-section">
                <h4>기본 정보</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <label>멘토명</label>
                    <div className="info-value">
                      <User size={16} />
                      {career.mentorName}
                    </div>
                  </div>
                  <div className="info-item">
                    <label>이메일</label>
                    <div className="info-value">{career.mentorEmail}</div>
                  </div>
                  <div className="info-item">
                    <label>회사</label>
                    <div className="info-value">{career.company}</div>
                  </div>
                  <div className="info-item">
                    <label>근무 시작</label>
                    <div className="info-value">{formatDate(career.startAt)}</div>
                  </div>
                  <div className="info-item">
                    <label>근무 종료</label>
                    <div className="info-value">{formatDate(career.endAt)}</div>
                  </div>
                  <div className="info-item">
                    <label>상태</label>
                    <div className="info-value">
                      <StatusIcon size={16} />
                      <span className={`status-badge ${statusBadge.className}`}>{statusBadge.text}</span>
                    </div>
                  </div>
                </div>
              </div>
              {career.files && career.files.length > 0 && (
                <div className="info-section">
                  <h4>첨부 파일</h4>
                  <div className="attachments-list">
                    {career.files.map((file, idx) => (
                      <div key={idx} className="attachment-item">
                        {file}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="form-modal-actions">
          {!detailLoading && career && (
            <div className="status-actions">
              {career.status !== 'AUTHORIZED' && (
                <button 
                  className="coffee-btn coffee-btn-success"
                  onClick={() => handleStatusChange(career.careerId, 'AUTHORIZED')}
                >
                  <CheckCircle size={16} /> 승인
                </button>
              )}
              {career.status !== 'UNAUTHORIZED' && (
                <button 
                  className="coffee-btn coffee-btn-danger"
                  onClick={() => handleStatusChange(career.careerId, 'UNAUTHORIZED')}
                >
                  <XCircle size={16} /> 거절
                </button>
              )}
            </div>
          )}
          <button className="coffee-btn coffee-btn-secondary" onClick={onClose}>닫기</button>
        </div>
      </div>
    </div>
  );
});

CareerDetailModal.displayName = 'CareerDetailModal';

export default CareerDetailModal;