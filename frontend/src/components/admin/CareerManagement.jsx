import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Edit3, RefreshCw, Briefcase, CheckCircle, XCircle, User } from 'lucide-react';
import { adminAPI } from '../../services/api';
import CareerDetailModal from './CareerDetailModal';
import './AdminCommon.css';

const CareerManagement = ({ isDarkMode }) => {
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCareer, setSelectedCareer] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadCareers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminAPI.getMentorCareers();
      const data = response.data?.data;
      if (Array.isArray(data?.content)) setCareers(data.content);
      else setCareers([]);
    } catch (error) {
      console.error('경력 데이터 로딩 실패:', error);
      setError('경력 데이터를 불러오는데 실패했습니다.');
      setCareers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCareers();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 상태 변경
  const handleStatusChange = useCallback(async (careerId, newStatus) => {
    try {
      await adminAPI.updateMentorCareerStatus(careerId, newStatus);
      setCareers(prevCareers => prevCareers.map(career =>
          career.careerId === careerId ? { ...career, status: newStatus } : career
      ));
      // 상세 모달이 열려있고, 대상 경력이 바뀐 거라면 모달 내용도 업데이트
      setSelectedCareer(prevSelected => {
        if (prevSelected && prevSelected.careerId === careerId) {
          return { ...prevSelected, status: newStatus };
        }
        return prevSelected;
      });
      return true; // 성공 시 true 반환
    } catch (error) {
      console.error('상태 변경 실패:', error);
      alert('상태 변경에 실패했습니다.');
      return false; // 실패 시 false 반환
    }
  }, []);

  // 상세보기
  const handleViewDetail = useCallback(async (career) => {
    setDetailLoading(true);
    try {
      const response = await adminAPI.getMentorCareerDetail(career.careerId);
      const detailData = response.data?.data;
      console.log('상세조회 결과:', detailData);
      if (detailData) {
        setSelectedCareer(detailData);
        setShowDetailModal(true);
      } else {
        alert('경력 상세 정보를 불러올 수 없습니다.');
      }
    } catch (error) {
      console.error('경력 상세 조회 실패:', error);
      alert('경력 상세 정보를 불러오는데 실패했습니다.');
    } finally {
      setDetailLoading(false);
    }
  }, []);


  // 첨부파일 다운로드
  const handleFileDownload = async (filename) => {
    try {
      // API를 통해 파일 다운로드 URL을 받아오거나 직접 다운로드 처리
      const response = await adminAPI.downloadCareerFile(filename);
      
      if (response.data) {
        // Blob 형태로 파일을 받은 경우
        const blob = new Blob([response.data]);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else if (response.url) {
        // 다운로드 URL을 받은 경우
        const link = document.createElement('a');
        link.href = response.url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('파일 다운로드 실패:', error);
      alert('파일 다운로드에 실패했습니다.');
    }
  };

  // 필터
  const filteredCareers = useMemo(() => {
    return Array.isArray(careers)
        ? careers.filter(career => {
          const matchesFilter =
              filterStatus === 'all' || career.status === filterStatus;
          return matchesFilter;
        })
        : [];
  }, [careers, filterStatus]);

  // 상태 뱃지
  const getStatusBadge = useCallback((status) => {
    switch (status) {
      case 'AUTHORIZED':
        return { className: 'approved', text: '승인됨', icon: CheckCircle };
      case 'UNAUTHORIZED':
      default:
        return { className: 'rejected', text: '거절됨', icon: XCircle };
    }
  }, []);

  // 날짜 포맷
  const formatDate = useCallback((dateStr) => {
    if (!dateStr) return '-';
    return dateStr.slice(0, 10);
  }, []);

  // 모달 닫기
  const handleCloseModal = useCallback(() => {
    setShowDetailModal(false);
    setSelectedCareer(null);
    setDetailLoading(false);
  }, []);

  // 상세 모달
  const CareerDetailModal = ({ isOpen, onClose, career }) => {
    if (!isOpen) return null;
    const statusBadge = career ? getStatusBadge(career.status) : null;
    const StatusIcon = statusBadge?.icon;

    return (
        <div className="modal-overlay">
          <div className="modal-content career-detail-modal">
            <div className="modal-header">
              <h3>경력 상세 정보</h3>
              <button className="modal-close" onClick={onClose}>×</button>
            </div>
            <div className="modal-body">
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
                  <div className="career-info">
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
            <div className="modal-actions">
              {!detailLoading && career && (
                  <div className="status-actions">
                    {career.status !== 'AUTHORIZED' && (
                        <button className="btn-success"
                                onClick={() => { handleStatusChange(career.careerId, 'AUTHORIZED'); onClose(); }}>
                          <CheckCircle size={16} /> 승인
                        </button>
                    )}
                    {career.status !== 'UNAUTHORIZED' && (
                        <button className="btn-danger"
                                onClick={() => { handleStatusChange(career.careerId, 'UNAUTHORIZED'); onClose(); }}>
                          <XCircle size={16} /> 거절
                        </button>
                    )}
                  </div>
              )}
              <button className="btn-secondary" onClick={onClose}>닫기</button>
            </div>
          </div>
        </div>
    );
  };

  return (
      <div className="admin-content-wrapper">
        <div className="content-header">
          <div className="header-left">
            <h2><Briefcase size={28} />경력 관리</h2>
            <p>멘토들의 경력 정보를 검토하고 관리합니다</p>
          </div>
          <div className="header-actions">
            <button className="btn-secondary" onClick={loadCareers}>
              <RefreshCw size={18} className={loading ? 'spinning' : ''} />
              새로고침
            </button>
            <button className="btn-secondary" onClick={exportData}>
              <Download size={18} /> 내보내기
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message" style={{
            color: 'red',
            padding: '16px',
            margin: '16px 0',
            backgroundColor: '#fee',
            borderRadius: '8px',
            border: '1px solid #fcc'
          }}>
            {error}
            <button onClick={loadCareers} style={{ marginLeft: '16px' }}>재시도</button>
          </div>
        )}

        <div className="content-stats">
          <div className="stat-card total">
            <div className="stat-number">{careers.length}</div>
            <div className="stat-label">전체</div>
          </div>
          <div className="stat-card approved">
            <div className="stat-number">{careers.filter(c => c.status === 'AUTHORIZED').length}</div>
            <div className="stat-label">승인됨</div>
          </div>
          <div className="stat-card rejected">
            <div className="stat-number">{careers.filter(c => c.status === 'UNAUTHORIZED').length}</div>
            <div className="stat-label">거절됨</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{careers.length}</div>
            <div className="stat-label">전체</div>
          </div>
        </div>

        <div className="content-filters">
          <div className="search-bar">
            <Search size={18} />
            <input
                type="text"
                placeholder="멘토명, 이메일, 회사명 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
          >
            <option value="all">전체 상태</option>
            <option value="AUTHORIZED">승인됨</option>
            <option value="UNAUTHORIZED">거절됨</option>
          </select>
        </div>

        <div className="content-table">
          <div className="table-header">
            <div className="table-cell">멘토명</div>
            <div className="table-cell">이메일</div>
            <div className="table-cell">회사</div>
            <div className="table-cell">근무 시작</div>
            <div className="table-cell">근무 종료</div>
            <div className="table-cell">상태</div>
            <div className="table-cell">작업</div>
          </div>
          {loading ? (
              <div className="loading-state">
                <RefreshCw className="spinning" size={24} />
                <p>경력 데이터를 불러오는 중...</p>
              </div>
          ) : filteredCareers.length === 0 ? (
              <div className="empty-state">
                <Briefcase size={48} />
                <h3>경력 데이터가 없습니다</h3>
                <p>{filterStatus !== 'all' ? '검색 조건을 확인해보세요' : '등록된 경력이 없습니다'}</p>
              </div>
          ) : (
              filteredCareers.map((career) => {
                const statusBadge = getStatusBadge(career.status);
                const StatusIcon = statusBadge.icon;
                return (
                    <div key={career.careerId} className="table-row">
                      <div className="table-cell">
                        <div className="cell-content">
                          <User size={16} />
                          <strong>{career.mentorName}</strong>
                        </div>
                      </div>
                      <div className="table-cell">{career.mentorEmail}</div>
                      <div className="table-cell">{career.company}</div>
                      <div className="table-cell">{formatDate(career.startAt)}</div>
                      <div className="table-cell">{formatDate(career.endAt)}</div>
                      <div className="table-cell">
                        <span className={`status-badge ${statusBadge.className}`}>
                          <StatusIcon size={14} />
                          {statusBadge.text}
                        </span>
                      </div>
                      <div className="table-cell">
                        <div className="table-actions">
                          <button
                              className="action-btn view"
                              onClick={() => handleViewDetail(career)}
                              title="상세보기"
                              disabled={detailLoading}
                          >
                            <Edit3 size={16} />
                          </button>
                          {career.status !== 'AUTHORIZED' && (
                              <button
                                  className="action-btn approve"
                                  onClick={() => handleStatusChange(career.careerId, 'AUTHORIZED')}
                                  title="승인"
                                  disabled={detailLoading}
                              >
                                <CheckCircle size={16} />
                              </button>
                          )}
                          {career.status !== 'UNAUTHORIZED' && (
                              <button
                                  className="action-btn reject"
                                  onClick={() => handleStatusChange(career.careerId, 'UNAUTHORIZED')}
                                  title="거절"
                                  disabled={detailLoading}
                              >
                                <XCircle size={16} />
                              </button>
                          )}
                        </div>
                      </div>
                    </div>
                );
              })
          )}
        </div>

        {showDetailModal && (
          <CareerDetailModal
              isOpen={showDetailModal}
              onClose={handleCloseModal}
              career={selectedCareer}
              onStatusChange={handleStatusChange}
              detailLoading={detailLoading}
              isDarkMode={isDarkMode}
          />
        )}
      </div>
  );
};

export default CareerManagement;
