import React, {useState, useEffect, useCallback} from 'react';
import {
  Edit3,
  RefreshCw,
  FileText,
  Clock,
  User,
  AlertTriangle
} from 'lucide-react';
import {adminAPI, userAPI} from '../../services/api';
import {accessTokenUtils} from '../../utils/tokenUtils.js';
import ComplaintDetailModal from './ComplaintDetailModal.jsx';
import './AdminCommon.css';

const ComplaintManagement = ({isDarkMode}) => {
  console.log('🚀 ComplaintManagement 컴포넌트 렌더링 시작');
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0
  });

  // API 요청 함수 - useCallback으로 메모이제이션
  const loadComplaints = useCallback(async (showLoading = true) => {
    // 인증 토큰 확인
    const token = accessTokenUtils.getAccessToken();

    if (!token) {
      console.warn('⚠️ 인증 토큰이 없습니다. 로그인이 필요합니다.');
      setError('관리자 로그인이 필요합니다.');
      setComplaints([]);
      return;
    }

    if (showLoading) {
      setLoading(true);
      setError(null);
    }

    try {
      const params = {
        page: pagination.page,
        size: pagination.size,
        sort: 'createdAt,desc'
      };

      // 필터가 'all'이 아닌 경우 상태 필터 추가
      if (filterType !== 'all') {
        params.status = filterType;
      }

      console.log('🔍 민원 목록 조회 요청:', params);

      // API 호출
      const response = await adminAPI.getAllInquiries(params);
      console.log('📋 민원 목록 응답:', response);
      console.log('📋 응답 데이터 구조:', JSON.stringify(response.data, null, 2));

      // 응답 데이터 처리
      let complaintData = [];
      if (response.data) {
        if (response.data.data && response.data.data.content && Array.isArray(
            response.data.data.content)) {
          // 페이징된 응답 처리 - 중첩된 구조
          complaintData = response.data.data.content;
          console.log('✅ response.data.data.content 경로 사용');
          setPagination(prev => ({
            ...prev,
            totalElements: response.data.data.totalElements || 0,
            totalPages: response.data.data.totalPages || 0
          }));
        } else if (response.data.content && Array.isArray(
            response.data.content)) {
          // 페이징된 응답 처리 - 일반 구조
          complaintData = response.data.content;
          console.log('✅ response.data.content 경로 사용');
          setPagination(prev => ({
            ...prev,
            totalElements: response.data.totalElements || 0,
            totalPages: response.data.totalPages || 0
          }));
        } else if (Array.isArray(response.data)) {
          // 배열 형태 응답 처리
          complaintData = response.data;
          console.log('✅ 직접 배열 형태');
          setPagination(prev => ({
            ...prev,
            totalElements: response.data.length,
            totalPages: Math.ceil(response.data.length / prev.size)
          }));
        } else if (response.data.data && Array.isArray(response.data.data)) {
          // 중첩된 배열 형태
          complaintData = response.data.data;
          console.log('✅ response.data.data 경로 사용');
          setPagination(prev => ({
            ...prev,
            totalElements: response.data.data.length,
            totalPages: Math.ceil(response.data.data.length / prev.size)
          }));
        } else {
          // 단일 객체 또는 기타 형태
          console.warn('⚠️ 알 수 없는 응답 구조, 빈 배열 반환');
          complaintData = [];
        }
      }

      console.log('📊 파싱된 민원 데이터:', complaintData);
      setComplaints(complaintData);

      if (complaintData.length === 0) {
        setPagination(prev => ({
          ...prev,
          totalElements: 0,
          totalPages: 0
        }));
      }

      setError(null);
    } catch (error) {
      console.error('민원 데이터 로딩 실패:', error);

      // 에러 상태 설정
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);

      // 사용자에게 알림 (자동 새로고침이 아닌 경우만)
      if (showLoading) {
        alert(errorMessage);
      }

      // 에러 시 빈 배열로 설정
      setComplaints([]);
      setPagination(prev => ({
        ...prev,
        totalElements: 0,
        totalPages: 0
      }));
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, [pagination.page, pagination.size, filterType]);

  // 에러 메시지 처리 함수
  const getErrorMessage = (error) => {
    if (!error.response) {
      return '네트워크 연결을 확인해주세요.';
    }

    switch (error.response.status) {
      case 400:
        return '잘못된 요청입니다. 요청 파라미터를 확인해주세요.';
      case 401:
        return '인증이 필요합니다. 다시 로그인해주세요.';
      case 403:
        return '관리자 권한이 필요합니다.';
      case 404:
        return '요청한 데이터를 찾을 수 없습니다.';
      case 500:
        return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      default:
        return '민원 데이터를 불러오는데 실패했습니다.';
    }
  };

  // 자동 새로고침 설정
  useEffect(() => {
    const interval = setInterval(() => {
      loadComplaints(false); // 로딩 상태 표시 없이 조용히 새로고침
    }, 30000); // 30초마다

    setRefreshInterval(interval);

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [loadComplaints]);

  // 데이터 로딩 (의존성 변경 시)
  useEffect(() => {
    loadComplaints();
  }, [loadComplaints]);

  // 사용자 정보 조회 및 캐시
  const [userCache, setUserCache] = useState(new Map());

  const getUserInfo = async (userId) => {
    if (!userId) {
      return null;
    }

    // 캐시에서 먼저 확인
    if (userCache.has(userId)) {
      return userCache.get(userId);
    }

    try {
      console.log('🔍 사용자 정보 조회:', userId);
      const response = await userAPI.getUserById(userId);
      const userInfo = response.data;

      // 캐시에 저장
      setUserCache(prev => new Map(prev).set(userId, userInfo));
      console.log('✅ 사용자 정보 조회 성공:', userInfo);

      return userInfo;
    } catch (error) {
      console.error('❌ 사용자 정보 조회 실패:', error);
      return null;
    }
  };

  // 민원 상세 조회
  const handleViewDetail = async (complaint) => {
    try {
      setLoading(true);
      console.log('🔍 민원 상세 조회:', complaint.id);

      // 민원 상세 정보 조회
      const response = await adminAPI.getInquiryDetail(complaint.id);
      let complaintDetail = response.data;

      // 사용자 정보 조회 및 추가
      if (complaintDetail.userId) {
        const userInfo = await getUserInfo(complaintDetail.userId);
        if (userInfo) {
          complaintDetail = {
            ...complaintDetail,
            userName: userInfo.name,
            userEmail: userInfo.email,
            userPhone: userInfo.phone
          };
          console.log('✅ 사용자 정보 추가됨:', userInfo);
        }
      }

      setSelectedComplaint(complaintDetail);
      setShowDetailModal(true);
    } catch (error) {
      console.error('❌ 민원 상세 조회 실패:', error);

      if (error.response?.status === 404) {
        alert('해당 민원을 찾을 수 없습니다. 목록을 새로고침합니다.');
        loadComplaints();
      } else {
        // API 호출 실패 시에도 기본 민원 데이터로 모달 열기
        console.log('🔄 기본 데이터로 모달 열기');

        // 기본 데이터에서도 사용자 정보 조회 시도
        let fallbackComplaint = {...complaint};
        if (complaint.userId) {
          try {
            const userInfo = await getUserInfo(complaint.userId);
            if (userInfo) {
              fallbackComplaint = {
                ...fallbackComplaint,
                userName: userInfo.name,
                userEmail: userInfo.email,
                userPhone: userInfo.phone
              };
            }
          } catch (userError) {
            console.error('❌ 폴백 사용자 정보 조회 실패:', userError);
          }
        }

        setSelectedComplaint(fallbackComplaint);
        setShowDetailModal(true);
      }
    } finally {
      setLoading(false);
    }
  };

  // 답변 등록
  const handleAnswerSubmit = async (complaintId, answerContent) => {
    try {
      console.log('📤 답변 등록 시작:', {complaintId, answerContent});

      const answerData = {
        contents: answerContent,  // contents 필드로 수정
        status: 'ANSWERED'
      };

      console.log('📋 전송할 답변 데이터:', answerData);
      await adminAPI.createInquiryAnswer(complaintId, answerData);
      console.log('✅ 답변 등록 API 호출 성공');

      // 성공 시 목록 새로고침
      await loadComplaints();
      console.log('✅ 목록 새로고침 완료');

      // 모달에서 표시되는 데이터도 업데이트
      if (selectedComplaint && selectedComplaint.id === complaintId) {
        setSelectedComplaint(prev => ({
          ...prev,
          answer: answerContent,
          answerContent: answerContent,
          status: 'ANSWERED'
        }));
        console.log('✅ 모달 데이터 업데이트 완료');
      }

      alert('답변이 성공적으로 등록되었습니다.');
    } catch (error) {
      console.error('❌ 답변 등록 실패:', error);

      const errorMessage = getErrorMessage(error);
      alert(`답변 등록 실패: ${errorMessage}`);
      throw error; // 에러를 다시 던져서 모달에서 로딩 상태를 해제할 수 있도록 함
    }
  };

  // 페이지 변경
  const handlePageChange = (newPage) => {
    setPagination(prev => ({
      ...prev,
      page: newPage
    }));
  };

  // 수동 새로고침
  const handleManualRefresh = () => {
    loadComplaints(true);
  };

  // 필터 초기화
  const handleResetFilters = () => {
    setFilterType('all');
    setPagination(prev => ({...prev, page: 0}));
  };

  // 유틸리티 함수들

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return '#f59e0b';
      case 'resolved':
        return '#10b981';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return '대기중';
      case 'resolved':
        return '답변완료';
      default:
        return status || '알 수 없음';
    }
  };

  const getCategoryText = (category) => {
    switch (category?.toLowerCase()) {
      case 'complaint':
        return '민원';
      case 'inquiry_account':
        return '계정 문의';
      case 'inquiry_chat':
        return '채팅 문의';
      case 'inquiry_pay':
        return '결제 문의';
      case 'inquiry_reservation':
        return '예약 문의';
      case 'inquiry_ticket':
        return '이용권 문의';
      case 'inquiry_profile':
        return '프로필 문의';
        // 기존 호환성을 위한 값들
      case 'payment':
        return '결제 문의';
      case 'account':
        return '계정 문의';
      case 'chat':
        return '채팅 문의';
      case 'reservation':
        return '예약 문의';
      case 'ticket':
        return '이용권 문의';
      case 'profile':
        return '프로필 문의';
      default:
        return category || '기타';
    }
  };

  // 답변 제출 상태 관리
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);

  // 답변 제출 핸들러 (모달에서 사용)
  const handleModalAnswerSubmit = async (complaintId, answerContent) => {
    console.log('📤 모달에서 답변 제출 핸들러 시작');
    setIsSubmittingAnswer(true);
    try {
      await handleAnswerSubmit(complaintId, answerContent);
      console.log('✅ 모달 답변 제출 완료');
    } catch (error) {
      console.error('❌ 모달 답변 제출 실패:', error);
      throw error;
    } finally {
      console.log('🔄 모달 답변 제출 상태 초기화');
      setIsSubmittingAnswer(false);
    }
  };

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [refreshInterval]);

  console.log('🎨 ComplaintManagement 렌더링:', {
    컴포넌트상태: 'rendering',
    민원개수: complaints.length,
    로딩상태: loading,
    에러상태: error
  });

  return (
      <div className={`complaint-management admin-content-wrapper ${isDarkMode ? 'dark-mode' : ''}`}>
        <div className="content-header">
          <div className="header-left">
            <h2 className="complaint-title">
              <FileText size={28}/>
              민원 관리
            </h2>
            <p>사용자 문의 및 신고를 관리합니다</p>
          </div>
          <div className="header-actions">
            <button
                className="btn-secondary"
                onClick={handleManualRefresh}
                disabled={loading}
            >
              <RefreshCw size={18} className={loading ? 'spinning' : ''}/>
              새로고침
            </button>
          </div>
        </div>

        <div className="content-stats">
          <div className="stat-card total" style={{ background: '#FBF9EF' }}>
            <div className="stat-number">{pagination.totalElements}</div>
            <div className="stat-label">총 건수</div>
          </div>
          <div className="stat-card pending" style={{ background: '#FBF9EF' }}>
            <div className="stat-number">{complaints.filter(
                c => c.status?.toLowerCase() === 'pending').length}</div>
            <div className="stat-label">대기중</div>
          </div>
          <div className="stat-card approved" style={{ background: '#FBF9EF' }}>
            <div className="stat-number">{complaints.filter(
                c => c.status?.toLowerCase() === 'resolved').length}</div>
            <div className="stat-label">답변완료</div>
          </div>
        </div>

        {/* 에러 표시 */}
        {error && (
            <div className="error-message">
              <AlertTriangle size={18}/>
              {error}
              <button onClick={handleManualRefresh} className="retry-btn">
                재시도
              </button>
            </div>
        )}


        <div className="content-table complaint-table">
          <div className="table-header">
            <div className="table-cell">카테고리</div>
            <div className="table-cell">제목</div>
            <div className="table-cell">작성자</div>
            <div className="table-cell">접수일</div>
            <div className="table-cell">상태</div>
            <div className="table-cell">작업</div>
          </div>

          {loading ? (
              <div className="loading-state">
                <RefreshCw className="spinning" size={24}/>
                <p>민원 데이터를 불러오는 중...</p>
              </div>
          ) : complaints.length === 0 ? (
              <div className="empty-state">
                <FileText size={48}/>
                <h3>민원이 없습니다</h3>
                <p>
                  {filterType !== 'all'
                      ? '검색 조건에 맞는 민원이 없습니다'
                      : '새로운 민원이 접수되면 여기에 표시됩니다'
                  }
                </p>
                {filterType !== 'all' && (
                    <button
                        className="btn-secondary"
                        onClick={handleResetFilters}
                    >
                      필터 초기화
                    </button>
                )}
              </div>
          ) : (
              complaints.map((complaint, index) => {
                const getStatusBadge = (status) => {
                  switch (status?.toLowerCase()) {
                    case 'pending':
                      return {className: 'pending', text: '대기중', icon: Clock};
                    case 'resolved':
                      return {
                        className: 'approved',
                        text: '답변완료',
                        icon: AlertTriangle
                      };
                  }
                };
                const statusBadge = getStatusBadge(complaint.status);
                const StatusIcon = statusBadge.icon;

                return (
                    <div key={complaint.id ?? `${complaint.title}-${index}`}
                         className="table-row" style={{ background: '#FBF9EF' }}>
                      <div className="table-cell">
                        <span className="category-badge">{getCategoryText(
                            complaint.category || complaint.type)}</span>
                      </div>
                      <div className="table-cell">
                        <div className="cell-content">
                          <FileText size={16} style={{ color: '#ffb300' }}/>
                          <strong style={{ color: '#e65100', fontWeight: '700' }}>{complaint.title || '제목 없음'}</strong>
                        </div>
                      </div>
                      <div className="table-cell">
                        <div className="cell-content">
                          <User size={16} style={{ color: '#ffb300' }}/>
                          <span style={{ color: '#6d4c41', fontWeight: '500' }}>
                            {complaint.userName ||
                                userCache.get(complaint.userId)?.name ||
                                complaint.userEmail ||
                                complaint.email ||
                                `사용자${complaint.userId || '익명'}`}
                          </span>
                        </div>
                      </div>
                      <div className="table-cell" style={{ color: '#6d4c41', fontWeight: '500' }}>
                        {new Date(complaint.createdAt).toLocaleDateString('ko-KR')}
                      </div>
                      <div className="table-cell">
                  <span className={`status-badge ${statusBadge.className}`}>
                    {statusBadge.text}
                  </span>
                      </div>
                      <div className="table-cell">
                        <div className="table-actions">
                          <button
                              className="action-btn view"
                              onClick={() => handleViewDetail(complaint)}
                              title="상세보기 및 답변"
                              disabled={loading}
                          >
                            <Edit3 size={16}/>
                          </button>
                        </div>
                      </div>
                    </div>
                );
              })
          )}
        </div>

        {/* 페이지네이션 */}
        {pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(0)}
                  disabled={pagination.page === 0 || loading}
              >
                처음
              </button>
              <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 0 || loading}
              >
                이전
              </button>

              <span className="pagination-info">
            {pagination.page + 1} / {pagination.totalPages} 페이지
            (총 {pagination.totalElements}개)
          </span>

              <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages - 1
                      || loading}
              >
                다음
              </button>
              <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(pagination.totalPages - 1)}
                  disabled={pagination.page >= pagination.totalPages - 1
                      || loading}
              >
                마지막
              </button>
            </div>
        )}

        <ComplaintDetailModal
            isOpen={showDetailModal}
            onClose={() => {
              setShowDetailModal(false);
              setSelectedComplaint(null);
            }}
            complaint={selectedComplaint}
            onAnswerSubmit={handleModalAnswerSubmit}
            isSubmitting={isSubmittingAnswer}
            isDarkMode={isDarkMode}
        />
      </div>
  );
};

export default ComplaintManagement;