import React, { useState, useEffect, memo } from 'react';
import { User, Mail, Phone, Calendar, FileText, MessageSquare, Send, X } from 'lucide-react';
import './AdminCommon.css';

const ComplaintDetailModal = memo(({
  isOpen,
  onClose,
  complaint,
  onAnswerSubmit,
  isSubmitting,
  isDarkMode
}) => {
  const [answer, setAnswer] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (complaint) {
      console.log('🔍 ComplaintDetailModal - 받은 complaint 데이터:', complaint);
      // 다양한 답변 필드명 확인
      const existingAnswer = complaint.answer || 
                            complaint.answerContent || 
                            complaint.contents ||
                            complaint.answerContents ||
                            (complaint.answerDto && complaint.answerDto.contents) ||
                            '';
      console.log('🔍 기존 답변:', existingAnswer);
      
      setAnswer(existingAnswer);
      // 답변이 이미 있으면 편집 모드가 아닌 읽기 모드로 시작
      setIsEditing(!existingAnswer);
    }
  }, [complaint]);

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) {
      alert('답변 내용을 입력해주세요.');
      return;
    }

    try {
      await onAnswerSubmit(complaint.id, answer.trim());
      setIsEditing(false); // 답변 완료 후 편집 모드 해제
    } catch (error) {
      console.error('답변 제출 실패:', error);
    }
  };

  const handleEditAnswer = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    // 편집 취소 시 원래 답변으로 복원
    const existingAnswer = complaint.answer || 
                          complaint.answerContent || 
                          complaint.contents ||
                          complaint.answerContents ||
                          (complaint.answerDto && complaint.answerDto.contents) ||
                          '';
    setAnswer(existingAnswer);
    setIsEditing(false);
  };

  if (!isOpen || !complaint) return null;

  const hasExistingAnswer = complaint.answer || 
                           complaint.answerContent || 
                           complaint.contents ||
                           complaint.answerContents ||
                           (complaint.answerDto && complaint.answerDto.contents);

  return (
    <div className={`form-modal-overlay ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="form-modal-content complaint-modal">
        <div className="form-modal-header">
          <h3>
            <FileText size={20} /> 민원 상세 정보
          </h3>
          <button className="form-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="form-modal-body">
          {/* 민원 기본 정보 */}
          <div className="complaint-info">
            <div className="info-row">
              <label>민원 번호:</label>
              <span>#{complaint.id}</span>
            </div>
            <div className="info-row">
              <label>제목:</label>
              <span>{complaint.title || complaint.subject || '제목 없음'}</span>
            </div>
            <div className="info-row">
              <label>
                <User size={16} />
                작성자:
              </label>
              <span>
                {complaint.userName || 
                 complaint.userEmail || 
                 complaint.email ||
                 complaint.name ||
                 (complaint.user && complaint.user.name) ||
                 '익명'}
              </span>
            </div>
            {(complaint.userEmail || complaint.email) && (
              <div className="info-row">
                <label>
                  <Mail size={16} />
                  이메일:
                </label>
                <span>{complaint.userEmail || complaint.email}</span>
              </div>
            )}
            {(complaint.userPhone || complaint.phone) && (
              <div className="info-row">
                <label>
                  <Phone size={16} />
                  연락처:
                </label>
                <span>{complaint.userPhone || complaint.phone}</span>
              </div>
            )}
            <div className="info-row">
              <label>카테고리:</label>
              <span className="category-badge">
                {getCategoryText(complaint.category || complaint.type)}
              </span>
            </div>
            <div className="info-row">
              <label>상태:</label>
              <span 
                className="status-badge"
                style={{ color: getStatusColor(complaint.status) }}
              >
                {getStatusText(complaint.status)}
              </span>
            </div>
            <div className="info-row">
              <label>
                <Calendar size={16} />
                접수일:
              </label>
              <span>{new Date(complaint.createdAt).toLocaleString('ko-KR')}</span>
            </div>
            {complaint.updatedAt && complaint.updatedAt !== complaint.createdAt && (
              <div className="info-row">
                <label>수정일:</label>
                <span>{new Date(complaint.updatedAt).toLocaleString('ko-KR')}</span>
              </div>
            )}
          </div>

          {/* 문의 내용 */}
          <div className="complaint-content">
            <label>
              <MessageSquare size={16} />
              문의 내용:
            </label>
            <div className="content-box">
              {complaint.content || 
               complaint.contents || 
               complaint.description || 
               complaint.message ||
               complaint.body ||
               '내용이 없습니다.'}
            </div>
          </div>

          {/* 관리자 답변 */}
          <div className="complaint-answer">
            <label>
              <Send size={16} />
              관리자 답변:
            </label>
            
            {hasExistingAnswer && !isEditing ? (
              // 답변이 있고 편집 모드가 아닐 때 - 읽기 모드
              <div>
                <div className="answer-display-box">
                  {answer}
                </div>
                <div className="answer-actions">
                  <button 
                    className="coffee-btn coffee-btn-secondary"
                    onClick={handleEditAnswer}
                    disabled={isSubmitting}
                  >
                    수정하기
                  </button>
                </div>
              </div>
            ) : (
              // 답변이 없거나 편집 모드일 때 - 편집 모드
              <div>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="답변을 입력하세요..."
                  rows="6"
                  className="coffee-form-textarea"
                  disabled={isSubmitting}
                />
                <div className="answer-info">
                  <small>
                    답변을 저장하면 사용자에게 이메일로 알림이 발송됩니다.
                  </small>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="form-modal-footer">
          <button 
            className="coffee-btn coffee-btn-secondary" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            닫기
          </button>
          
          {isEditing && (
            <>
              {hasExistingAnswer && (
                <button 
                  className="coffee-btn coffee-btn-secondary"
                  onClick={handleCancelEdit}
                  disabled={isSubmitting}
                >
                  취소
                </button>
              )}
              <button
                className="coffee-btn coffee-btn-primary"
                onClick={handleSubmitAnswer}
                disabled={isSubmitting || !answer.trim()}
              >
                {isSubmitting ? '저장 중...' : hasExistingAnswer ? '답변 수정' : '답변 저장'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
});

// 유틸리티 함수들
const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'pending': return '#f59e0b';
    case 'answered': return '#3b82f6';
    case 'resolved': return '#10b981';
    case 'closed': return '#6b7280';
    default: return '#6b7280';
  }
};

const getStatusText = (status) => {
  switch (status?.toLowerCase()) {
    case 'pending': return '대기중';
    case 'answered': return '답변완료';
    case 'resolved': return '해결완료';
    case 'closed': return '종료';
    default: return status || '알 수 없음';
  }
};

const getCategoryText = (category) => {
  switch (category?.toLowerCase()) {
    case 'complaint': return '민원';
    case 'inquiry_account': return '계정 문의';
    case 'inquiry_chat': return '채팅 문의';
    case 'inquiry_pay': return '결제 문의';
    case 'inquiry_reservation': return '예약 문의';
    case 'inquiry_ticket': return '이용권 문의';
    case 'inquiry_profile': return '프로필 문의';
    // 기존 호환성을 위한 값들
    case 'payment': return '결제 문의';
    case 'account': return '계정 문의';
    case 'chat': return '채팅 문의';
    case 'reservation': return '예약 문의';
    case 'ticket': return '이용권 문의';
    case 'profile': return '프로필 문의';
    default: return category || '기타';
  }
};

ComplaintDetailModal.displayName = 'ComplaintDetailModal';

export default ComplaintDetailModal;