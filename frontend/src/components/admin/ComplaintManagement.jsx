import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Edit3, Trash2, Filter, Download, RefreshCw, FileText, Clock, User, AlertTriangle } from 'lucide-react';
import { adminAPI } from '../../services/api';
import './AdminCommon.css';

const ComplaintManagement = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
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

      // 검색어가 있는 경우 추가
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      // 필터가 'all'이 아닌 경우 상태 필터 추가
      if (filterType !== 'all') {
        params.status = filterType;
      }

      console.log('민원 목록 조회 요청:', params);

      // API 호출
      const response = await adminAPI.getAllInquiries(params);
      console.log('민원 목록 응답:', response.data);

      // 응답 데이터 처리
      if (response.data) {
        if (response.data.content && Array.isArray(response.data.content)) {
          // 페이징된 응답 처리
          setComplaints(response.data.content);
          setPagination(prev => ({
            ...prev,
            totalElements: response.data.totalElements || 0,
            totalPages: response.data.totalPages || 0
          }));
        } else if (Array.isArray(response.data)) {
          // 배열 형태 응답 처리
          setComplaints(response.data);
          setPagination(prev => ({
            ...prev,
            totalElements: response.data.length,
            totalPages: Math.ceil(response.data.length / prev.size)
          }));
        } else {
          // 단일 객체 또는 기타 형태
          const dataArray = Array.isArray(response.data) ? response.data : [response.data];
          setComplaints(dataArray);
          setPagination(prev => ({
            ...prev,
            totalElements: dataArray.length,
            totalPages: Math.ceil(dataArray.length / prev.size)
          }));
        }
      } else {
        // 빈 응답 처리
        setComplaints([]);
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
  }, [pagination.page, pagination.size, filterType, searchTerm]);

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

  // 민원 상세 조회
  const handleViewDetail = async (complaint) => {
    try {
      setLoading(true);
      console.log('민원 상세 조회:', complaint.id);

      const response = await adminAPI.getInquiryDetail(complaint.id);
      setSelectedComplaint(response.data);
      setShowDetailModal(true);
    } catch (error) {
      console.error('민원 상세 조회 실패:', error);

      if (error.response?.status === 404) {
        alert('해당 민원을 찾을 수 없습니다. 목록을 새로고침합니다.');
        loadComplaints();
      } else {
        // API 호출 실패 시에도 기본 민원 데이터로 모달 열기
        console.log('기본 데이터로 모달 열기');
        setSelectedComplaint(complaint);
        setShowDetailModal(true);
      }
    } finally {
      setLoading(false);
    }
  };

  // 답변 등록
  const handleAnswerSubmit = async (complaintId, answerContent) => {
    try {
      console.log('답변 등록:', { complaintId, answerContent });

      const answerData = {
        content: answerContent,
        status: 'ANSWERED'
      };

      await adminAPI.createInquiryAnswer(complaintId, answerData);

      // 성공 시 목록 새로고침
      await loadComplaints();

      // 모달에서 표시되는 데이터도 업데이트
      if (selectedComplaint && selectedComplaint.id === complaintId) {
        setSelectedComplaint(prev => ({
          ...prev,
          answer: answerContent,
          answerContent: answerContent,
          status: 'ANSWERED'
        }));
      }

      alert('답변이 성공적으로 등록되었습니다.');
    } catch (error) {
      console.error('답변 등록 실패:', error);

      const errorMessage = getErrorMessage(error);
      alert(`답변 등록 실패: ${errorMessage}`);
    }
  };

  // 민원 삭제
  const handleDeleteComplaint = async (complaintId) => {
    if (!confirm('정말로 이 민원을 삭제하시겠습니까?\n삭제된 민원은 복구할 수 없습니다.')) {
      return;
    }

    try {
      setLoading(true);
      await adminAPI.deleteInquiry(complaintId);

      alert('민원이 성공적으로 삭제되었습니다.');
      await loadComplaints();

      // 상세 모달이 열려있고 삭제된 민원이면 모달 닫기
      if (selectedComplaint && selectedComplaint.id === complaintId) {
        setShowDetailModal(false);
        setSelectedComplaint(null);
      }
    } catch (error) {
      console.error('민원 삭제 실패:', error);

      const errorMessage = getErrorMessage(error);
      alert(`민원 삭제 실패: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // 페이지 변경
  const handlePageChange = (newPage) => {
    setPagination(prev => ({
      ...prev,
      page: newPage
    }));
  };

  // 검색어 제출
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 0 }));
  };

  // 검색어 변경 (디바운싱)
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);

    // 실시간 검색 디바운싱
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      setPagination(prev => ({ ...prev, page: 0 }));
    }, 500);
  };

  // 수동 새로고침
  const handleManualRefresh = () => {
    loadComplaints(true);
  };

  // 데이터 내보내기
  const handleExportData = async () => {
    try {
      setLoading(true);

      // 전체 데이터 조회
      const exportParams = {
        page: 0,
        size: 10000, // 충분히 큰 수
        sort: 'createdAt,desc'
      };

      if (searchTerm.trim()) {
        exportParams.search = searchTerm.trim();
      }
      if (filterType !== 'all') {
        exportParams.status = filterType;
      }

      const response = await adminAPI.getAllInquiries(exportParams);
      const exportData = response.data.content || response.data || [];

      // CSV 형태로 변환
      const csvContent = convertToCSV(exportData);
      downloadCSV(csvContent, 'complaints.csv');

      alert('데이터 내보내기가 완료되었습니다.');
    } catch (error) {
      console.error('데이터 내보내기 실패:', error);
      alert('데이터 내보내기에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // CSV 변환 함수
  const convertToCSV = (data) => {
    const headers = ['ID', '제목', '작성자', '이메일', '카테고리', '우선순위', '상태', '접수일', '내용'];
    const rows = data.map(item => [
      item.id || '',
      item.title || '',
      item.userName || item.userEmail || '',
      item.userEmail || '',
      getCategoryText(item.category),
      getPriorityText(item.priority),
      getStatusText(item.status),
      new Date(item.createdAt).toLocaleDateString('ko-KR'),
      (item.content || item.description || '').replace(/[\r\n]/g, ' ')
    ]);

    return [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
  };

  // CSV 다운로드 함수
  const downloadCSV = (content, filename) => {
    const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 필터 초기화
  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setPagination(prev => ({ ...prev, page: 0 }));
  };

  // 유틸리티 함수들
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'urgent': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'normal': return '#3b82f6';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

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
      case 'payment': return '결제';
      case 'report': return '신고';
      case 'feature': return '기능개선';
      case 'bug': return '버그';
      case 'account': return '계정';
      case 'service': return '서비스';
      case 'other': return '기타';
      default: return category || '기타';
    }
  };

  const getPriorityText = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'urgent': return '긴급';
      case 'high': return '높음';
      case 'normal': return '보통';
      case 'low': return '낮음';
      default: return '보통';
    }
  };

  // 민원 상세 모달 컴포넌트
  const ComplaintDetailModal = ({ isOpen, onClose, complaint }) => {
    const [answer, setAnswer] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
      if (complaint) {
        setAnswer(complaint.answer || complaint.answerContent || '');
      }
    }, [complaint]);

    const handleSubmitAnswer = async () => {
      if (!answer.trim()) {
        alert('답변 내용을 입력해주세요.');
        return;
      }

      setIsSubmitting(true);
      try {
        await handleAnswerSubmit(complaint.id, answer.trim());
      } finally {
        setIsSubmitting(false);
      }
    };

    if (!isOpen || !complaint) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content complaint-modal">
          <div className="modal-header">
            <h3>민원 상세 정보</h3>
            <button className="modal-close" onClick={onClose}>×</button>
          </div>
          <div className="modal-body">
            <div className="complaint-info">
              <div className="info-row">
                <label>민원 번호:</label>
                <span>#{complaint.id}</span>
              </div>
              <div className="info-row">
                <label>제목:</label>
                <span>{complaint.title}</span>
              </div>
              <div className="info-row">
                <label>작성자:</label>
                <span>{complaint.userName || complaint.userEmail || '익명'}</span>
              </div>
              <div className="info-row">
                <label>이메일:</label>
                <span>{complaint.userEmail || '-'}</span>
              </div>
              <div className="info-row">
                <label>연락처:</label>
                <span>{complaint.phone || '-'}</span>
              </div>
              <div className="info-row">
                <label>카테고리:</label>
                <span className="category-badge">{getCategoryText(complaint.category)}</span>
              </div>
              <div className="info-row">
                <label>우선순위:</label>
                <span
                  className="priority-badge"
                  style={{ color: getPriorityColor(complaint.priority) }}
                >
                  {getPriorityText(complaint.priority)}
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
                <label>접수일:</label>
                <span>{new Date(complaint.createdAt).toLocaleString('ko-KR')}</span>
              </div>
              {complaint.updatedAt && complaint.updatedAt !== complaint.createdAt && (
                <div className="info-row">
                  <label>수정일:</label>
                  <span>{new Date(complaint.updatedAt).toLocaleString('ko-KR')}</span>
                </div>
              )}
            </div>

            <div className="complaint-content">
              <label>문의 내용:</label>
              <div className="content-box">
                {complaint.content || complaint.description || '내용이 없습니다.'}
              </div>
            </div>

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
            <button className="btn-secondary" onClick={onClose}>
              닫기
            </button>
            <button
              className="btn-primary"
              onClick={handleSubmitAnswer}
              disabled={isSubmitting || !answer.trim()}
            >
              {isSubmitting ? '저장 중...' : '답변 저장'}
            </button>
            <button
              className="btn-danger"
              onClick={() => {
                if (confirm('정말로 이 민원을 삭제하시겠습니까?\n삭제된 데이터는 복구할 수 없습니다.')) {
                  handleDeleteComplaint(complaint.id);
                  onClose();
                }
              }}
            >
              삭제
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
      if (window.searchTimeout) {
        clearTimeout(window.searchTimeout);
      }
    };
  }, [refreshInterval]);

  return (
    <div className="admin-content-wrapper">
      <div className="content-header">
        <div className="header-left">
          <h2>
            <FileText size={28} />
            민원 관리
          </h2>
          <p>사용자 문의 및 신고를 관리합니다</p>
          <div className="stats-summary">
            <span className="stat-item">
              <strong>총 {pagination.totalElements}건</strong>
            </span>
            <span className="stat-item">
              대기: {complaints.filter(c => c.status?.toLowerCase() === 'pending').length}건
            </span>
            <span className="stat-item">
              완료: {complaints.filter(c => c.status?.toLowerCase() === 'answered').length}건
            </span>
          </div>
        </div>
        <div className="header-actions">
          <button
            className="btn-secondary"
            onClick={handleManualRefresh}
            disabled={loading}
          >
            <RefreshCw size={18} className={loading ? 'spinning' : ''} />
            새로고침
          </button>
          <button
            className="btn-secondary"
            onClick={handleExportData}
            disabled={loading || complaints.length === 0}
          >
            <Download size={18} />
            내보내기
          </button>
        </div>
      </div>

      <div className="content-filters">
        <form onSubmit={handleSearchSubmit} className="search-bar">
          <Search size={18} />
          <input
            type="text"
            placeholder="제목, 작성자, 내용으로 검색..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <button type="submit" style={{ display: 'none' }}>검색</button>
        </form>
        <select
          value={filterType}
          onChange={(e) => {
            setFilterType(e.target.value);
            setPagination(prev => ({ ...prev, page: 0 }));
          }}
          className="filter-select"
        >
          <option value="all">전체 상태</option>
          <option value="pending">대기중</option>
          <option value="answered">답변완료</option>
          <option value="resolved">해결완료</option>
          <option value="closed">종료</option>
        </select>
      </div>

      {/* 에러 표시 */}
      {error && (
        <div className="error-message">
          <AlertTriangle size={18} />
          {error}
          <button onClick={handleManualRefresh} className="retry-btn">
            재시도
          </button>
        </div>
      )}

      <div className="content-table">
        <div className="table-header">
          <div className="table-cell">제목</div>
          <div className="table-cell">작성자</div>
          <div className="table-cell">카테고리</div>
          <div className="table-cell">우선순위</div>
          <div className="table-cell">상태</div>
          <div className="table-cell">접수일</div>
          <div className="table-cell">작업</div>
        </div>

        {loading ? (
          <div className="loading-state">
            <RefreshCw className="spinning" size={24} />
            <p>민원 데이터를 불러오는 중...</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="empty-state">
            <FileText size={48} />
            <h3>민원이 없습니다</h3>
            <p>
              {searchTerm || filterType !== 'all'
                ? '검색 조건에 맞는 민원이 없습니다'
                : '새로운 민원이 접수되면 여기에 표시됩니다'
              }
            </p>
            {(searchTerm || filterType !== 'all') && (
              <button
                className="btn-secondary"
                onClick={handleResetFilters}
              >
                필터 초기화
              </button>
            )}
          </div>
        ) : (
          complaints.map((complaint, index) => (
            <div key={complaint.id ?? `${complaint.title}-${index}`} className="table-row">
              <div className="table-cell">
                <div className="cell-content">
                  <strong>{complaint.title || '제목 없음'}</strong>
                  <small>
                    {(complaint.contents || '')
                    .substring(0, 50)
                    .replace(/\n/g, ' ')}
                    {(complaint.contents || '').length > 50 ? '...' : ''}
                  </small>

                </div>
              </div>
              <div className="table-cell">
                <span className="category-badge">{getCategoryText(complaint.type)}</span>
              </div>
              <div className="table-cell">
                <span
                  className="priority-badge"
                  style={{ color: getPriorityColor(complaint.priority) }}
                >
                  {getPriorityText(complaint.priority)}
                </span>
              </div>
              <div className="table-cell">
                <span
                  className="status-badge"
                  style={{ color: getStatusColor(complaint.status) }}
                >
                  {getStatusText(complaint.status)}
                </span>
              </div>
              <div className="table-cell">
                <div className="cell-content">
                  <Clock size={16} />
                  {new Date(complaint.createdAt).toLocaleDateString('ko-KR')}
                </div>
              </div>
              <div className="table-cell">
                <div className="table-actions">
                  <button
                    className="action-btn view"
                    onClick={() => handleViewDetail(complaint)}
                    title="상세보기 및 답변"
                    disabled={loading}
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    className="action-btn delete"
                    onClick={() => handleDeleteComplaint(complaint.id)}
                    title="삭제"
                    disabled={loading}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
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
            disabled={pagination.page >= pagination.totalPages - 1 || loading}
          >
            다음
          </button>
          <button
            className="pagination-btn"
            onClick={() => handlePageChange(pagination.totalPages - 1)}
            disabled={pagination.page >= pagination.totalPages - 1 || loading}
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
      />
    </div>
  );
};

export default ComplaintManagement;