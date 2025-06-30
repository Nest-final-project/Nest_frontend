import React, { useState, useEffect } from 'react';
import { Clock, User } from 'lucide-react';
import { adminAPI,userAPI } from '../../services/api';
import './AdminCommon.css';

const ComplaintDetailModal = ({ 
  isOpen, 
  onClose, 
  complaint, 
  onAnswerSubmit,
  isSubmitting = false 
}) => {
  const [answer, setAnswer] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [loadingUser, setLoadingUser] = useState(false);
  const [complaintDetail, setComplaintDetail] = useState(null);
  const [loadingComplaint, setLoadingComplaint] = useState(false);

  useEffect(() => {
    if (complaint?.id) {
      console.log('📋 모달에서 받은 민원 데이터:', complaint);
      fetchComplaintDetail(complaint.id);
    }
  }, [complaint]);

  const fetchComplaintDetail = async (complaintId) => {
    setLoadingComplaint(true);
    try {
      console.log('🔍 민원 상세 정보 조회 시작:', complaintId);
      const response = await adminAPI.getInquiryDetail(complaintId);
      const detail = response.data;
      
      console.log('✅ 민원 상세 정보 조회 성공:', detail);
      setComplaintDetail(detail);
      setAnswer(detail.answer || '');
      
      // userId가 있으면 사용자 정보 조회
      if (detail.userId) {
        fetchUserInfo(detail.userId);
      } else {
        setUserInfo(null);
      }
    } catch (error) {
      console.error('❌ 민원 상세 정보 조회 실패:', error);
      setComplaintDetail(null);
    } finally {
      setLoadingComplaint(false);
    }
  };

  const fetchUserInfo = async (userId) => {
    if (!userId) return;
    
    setLoadingUser(true);
    try {
      console.log('🔍 사용자 정보 조회 시작:', userId);
      const response = await userAPI.getUserById(userId);
      const userData = response.data;
      
      console.log('✅ 사용자 정보 조회 성공:', userData);
      setUserInfo(userData);
    } catch (error) {
      console.error('❌ 사용자 정보 조회 실패:', error);
      setUserInfo(null);
    } finally {
      setLoadingUser(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) {
      alert('답변 내용을 입력해주세요.');
      return;
    }

    const complaintId = displayData.id || complaint.id;
    console.log('📤 답변 제출 시작:', { complaintId: complaintId, answer: answer.trim() });
    
    try {
      await onAnswerSubmit(complaintId, answer.trim());
      console.log('✅ 답변 제출 완료');
    } catch (error) {
      console.error('❌ 답변 제출 실패:', error);
    }
  };

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


  if (!isOpen || !complaint) return null;

  const displayData = complaintDetail || (complaint?.data ? complaint.data : complaint);

  console.log('🎨 ComplaintDetailModal 렌더링:', { 
    isOpen, 
    complaint: complaint ? complaint : 'null',
    complaintDetail: complaintDetail ? complaintDetail : 'null',
    displayData: displayData,
    'displayData.reservationId': displayData?.reservationId,
    isSubmitting,
    answer: answer.length 
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content complaint-modal" onClick={(e) => e.stopPropagation()} style={{ color: '#1f2937' }}>
        <div className="modal-header">
          <h3>민원 상세 정보</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {loadingComplaint ? (
            <div className="loading-state" style={{ textAlign: 'center', padding: '40px' }}>
              <p>민원 상세 정보를 불러오는 중...</p>
            </div>
          ) : (
            <>
              <div className="complaint-info">
                <div className="info-row">
                  <label>민원 번호:</label>
                  <span>#{displayData.id || 'N/A'}</span>
                </div>
                <div className="info-row">
                  <label>작성자:</label>
                  <span>
                    {loadingUser ? (
                      '사용자 정보 로딩 중...'
                    ) : (
                      userInfo?.nickName || 
                      userInfo?.name || 
                      displayData.userName || 
                      `사용자${displayData.userId}` || 
                      '익명'
                    )}
                  </span>
                </div>
                <div className="info-row">
                  <label>예약번호:</label>
                  <span>{displayData.reservationId ? `#${displayData.reservationId}` : '-'}</span>
                </div>
                <div className="info-row">
                  <label>제목:</label>
                  <span>{displayData.title || '제목 없음'}</span>
                </div>
                <div className="info-row">
                  <label>카테고리:</label>
                  <span className="category-badge">{getCategoryText(displayData.type || displayData.complaintType || displayData.category)}</span>
                </div>
                <div className="info-row">
                  <label>답변 상태:</label>
                  <span
                    className="status-badge"
                    style={{ color: getStatusColor(displayData.status || displayData.complaintStatus) }}
                  >
                    {getStatusText(displayData.status || displayData.complaintStatus)}
                  </span>
                </div>
              </div>

              <div className="complaint-content">
                <label>문의 내용:</label>
                <div className="complaint-content-box">
                  {displayData.contents || '내용이 없습니다.'}
                </div>
              </div>
            </>
          )}

          <div className="complaint-answer">
            <label>관리자 답변:</label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="답변을 입력하세요..."
              rows="6"
              className="answer-textarea"
              disabled={isSubmitting}
            />
            <div className="answer-info">
              <small>
                답변을 저장하면 사용자에게 이메일로 알림이 발송됩니다.
              </small>
            </div>
          </div>
        </div>
        
        <div className="modal-actions">
          <button 
            className="btn-secondary" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            닫기
          </button>
          <button
            className={`btn-primary ${!answer.trim() ? 'btn-disabled' : ''}`}
            onClick={handleSubmitAnswer}
            disabled={isSubmitting}
          >
            {isSubmitting ? '저장 중...' : (!answer.trim() ? '답변을 입력하세요' : '답변 저장')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetailModal;