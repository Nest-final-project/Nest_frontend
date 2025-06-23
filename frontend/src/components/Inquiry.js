import React, { useState, useEffect } from 'react';
import { inquiryAPI } from '../services/api';
import './Inquiry.css';

// 카테고리 한글 매핑 객체
const CATEGORY_LABELS = {
  COMPLAINT: '민원',
  INQUIRY_ACCOUNT: '계정 관련 문의',
  INQUIRY_CHAT: '채팅 관련 문의',
  INQUIRY_PAY: '결제 관련 문의',
  INQUIRY_RESERVATION: '예약 관련 문의',
  INQUIRY_TICKET: '이용권 관련 문의',
  INQUIRY_PROFILE: '프로필 관련 문의',
};
const getCategoryLabel = (key) => CATEGORY_LABELS[key] || key || '-';

const Inquiry = ({ onBack, initialTab = 'inquiries' }) => {
  const [activeTab, setActiveTab] = useState(initialTab); // 'inquiries', 'myInquiries', 'create'
  const [inquiries, setInquiries] = useState([]);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    content: ''
  });
  const [loading, setLoading] = useState(false);

  // 전체 문의 목록 조회
  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const response = await inquiryAPI.getAllComplaints();
      if (response.data) {
        let list = response.data.data?.content || response.data.data || response.data;
        setInquiries(list);
      }
    } catch (error) {
      console.error('문의 목록 조회 오류:', error);
      alert('문의 목록을 불러오는데 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 내 문의 내역 조회
  const fetchMyInquiries = async () => {
    try {
      setLoading(true);
      const response = await inquiryAPI.getUserInquiries();
      if (response.data) {
        let list = response.data.data?.content || response.data.data || response.data;
        setInquiries(list);
      }
    } catch (error) {
      console.error('내 문의 내역 조회 오류:', error);
      alert('내 문의 내역을 불러오는데 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 문의 상세 조회
  const fetchInquiryDetail = async (complaintId) => {
    try {
      setLoading(true);
      const response = await inquiryAPI.getUserInquiryDetail(complaintId);
      if (response.data) {
        setSelectedInquiry(response.data.data || response.data);
      }
    } catch (error) {
      console.error('문의 상세 조회 오류:', error);
      alert('문의 상세 정보를 불러오는데 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 문의 삭제 (내 문의 내역 탭에서만 사용)
  const deleteInquiry = async (complaintId) => {
    if (!window.confirm('정말로 이 문의를 삭제하시겠습니까?')) return;
    try {
      setLoading(true);
      await inquiryAPI.deleteUserInquiry(complaintId);
      setInquiries(prev => prev.filter(inquiry => inquiry.id !== complaintId));
      if (selectedInquiry && selectedInquiry.id === complaintId) setSelectedInquiry(null);
      alert('문의가 성공적으로 삭제되었습니다.');
    } catch (error) {
      console.error('문의 삭제 오류:', error);
      alert('문의 삭제 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 탭/컴포넌트 마운트 시 목록 조회
  useEffect(() => {
    if (activeTab === 'inquiries') {
      fetchInquiries();
    } else if (activeTab === 'myInquiries') {
      fetchMyInquiries();
    }
  }, [activeTab]);

  // 문의 종류
  const categories = [
    { value: '', label: '문의 종류를 선택해주세요' },
    { value: 'COMPLAINT', label: '민원' },
    { value: 'INQUIRY_ACCOUNT', label: '계정 관련 문의' },
    { value: 'INQUIRY_CHAT', label: '채팅 관련 문의' },
    { value: 'INQUIRY_PAY', label: '결제 관련 문의' },
    { value: 'INQUIRY_RESERVATION', label: '예약 관련 문의' },
    { value: 'INQUIRY_TICKET', label: '이용권 관련 문의' },
    { value: 'INQUIRY_PROFILE', label: '프로필 관련 문의' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 문의 등록
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return alert('제목을 입력해주세요.');
    if (!formData.category) return alert('문의 종류를 선택해주세요.');
    if (!formData.content.trim()) return alert('문의 내용을 입력해주세요.');
    if (formData.title.trim().length < 2) return alert('제목은 2글자 이상 입력해주세요.');
    if (formData.content.trim().length < 10) return alert('문의 내용은 10글자 이상 입력해주세요.');

    try {
      setLoading(true);
      const requestData = {
        title: formData.title.trim(),
        type: formData.category,
        contents: formData.content.trim()
      };
      const response = await inquiryAPI.createInquiry(requestData);
      if (response.data) {
        setFormData({ title: '', category: '', content: '' });
        setActiveTab('myInquiries');
        alert('문의가 성공적으로 등록되었습니다.');
        fetchMyInquiries();
      }
    } catch (error) {
      console.error('문의 등록 오류:', error);
      alert('문의 등록 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 상태 텍스트/클래스
  const getStatusText = (status) => {
    switch (status) {
      case 'ANSWERED': case 'answered': return '답변완료';
      case 'PENDING': case 'pending': default: return '답변대기';
    }
  };
  const getStatusClass = (status) => {
    switch (status) {
      case 'ANSWERED': case 'answered': return 'status-answered';
      case 'PENDING': case 'pending': default: return 'status-pending';
    }
  };
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const handleInquiryClick = (inquiry) => fetchInquiryDetail(inquiry.id);
  const handleBackToList = () => setSelectedInquiry(null);

  return (
      <div className="inquiry-page">
        {/* 사이드바 */}
        <div className="inquiry-sidebar">
          <div className="sidebar-header"><h2>고객센터</h2></div>
          <div className="sidebar-menu">
            <div className="menu-item">자주 묻는 질문</div>
            <div
                className={`menu-item ${activeTab === 'inquiries' ? 'current' : ''}`}
                onClick={() => { setActiveTab('inquiries'); setSelectedInquiry(null); }}>
              문의 사항
            </div>
            <div
                className={`menu-item ${activeTab === 'myInquiries' ? 'current' : ''}`}
                onClick={() => { setActiveTab('myInquiries'); setSelectedInquiry(null); }}>
              내 문의 내역
            </div>
            <div
                className={`menu-item ${activeTab === 'create' ? 'current' : ''}`}
                onClick={() => setActiveTab('create')}>
              문의하기
            </div>
            <div className="menu-item">공지사항</div>
          </div>
        </div>

        {/* 메인 컨텐츠 */}
        <div className="inquiry-main">
          <div className="inquiry-header">
            <button className="back-button" onClick={onBack}>← 돌아가기</button>
            <h1>
              {selectedInquiry ? '문의 상세'
                  : activeTab === 'myInquiries' ? '내 문의 내역'
                      : activeTab === 'inquiries' ? '문의 사항'
                          : '문의하기'}
            </h1>
          </div>

          <div className="tab-content">
            {selectedInquiry ? (
                // 문의 상세
                <div className="inquiry-detail">
                  <div className="detail-header">
                    <button className="back-button" onClick={handleBackToList}>
                      <i className="arrow-icon">←</i> 목록으로
                    </button>
                    <div className="detail-actions">
                      {activeTab === 'myInquiries' && (
                          <button
                              className="delete-button"
                              onClick={() => deleteInquiry(selectedInquiry.id)}
                              disabled={loading}
                              title="문의 삭제"
                          >
                            <i className="delete-icon">🗑️</i> 삭제
                          </button>
                      )}
                    </div>
                  </div>

                  <div className="detail-card">
                    <div className="detail-card-header">
                      <div className="title-section">
                        <h2 className="detail-title">{selectedInquiry.title}</h2>
                        <div className="detail-badges">
                          <span className="category-badge">
                            {getCategoryLabel(selectedInquiry.category || selectedInquiry.type)}
                          </span>
                          <span className={`status-badge ${getStatusClass(selectedInquiry.status)}`}>
                            {getStatusText(selectedInquiry.status)}
                          </span>
                        </div>
                      </div>
                      <div className="detail-meta">
                        <div className="meta-item">
                          <span className="meta-label">작성일</span>
                          <span className="meta-value">{formatDate(selectedInquiry.createdAt || selectedInquiry.created_at)}</span>
                        </div>
                        {selectedInquiry.answeredAt && (
                            <div className="meta-item">
                              <span className="meta-label">답변일</span>
                              <span className="meta-value">{formatDate(selectedInquiry.answeredAt)}</span>
                            </div>
                        )}
                      </div>
                    </div>

                    <div className="detail-content">
                      <div className="content-section">
                        <div className="content-header">
                          <h3>문의 내용</h3>
                          <div className="content-icon">💬</div>
                        </div>
                        <div className="content-body">
                          <p>{selectedInquiry.contents || selectedInquiry.content}</p>
                        </div>
                      </div>

                      {selectedInquiry.answer ? (
                          <div className="answer-section">
                            <div className="answer-header">
                              <h3>답변</h3>
                              <div className="answer-icon">✅</div>
                            </div>
                            <div className="answer-content">
                              <p>{selectedInquiry.answer}</p>
                            </div>
                          </div>
                      ) : (
                          <div className="no-answer-section">
                            <div className="no-answer-icon">⏳</div>
                            <p>답변을 기다리고 있습니다</p>
                          </div>
                      )}
                    </div>
                  </div>
                </div>
            ) : (activeTab === 'inquiries' || activeTab === 'myInquiries') ? (
                // 문의 목록
                <div className="inquiries-list">
                  <h3>{activeTab === 'myInquiries' ? '내 문의 내역' : '문의 사항'}</h3>
                  {loading ? (
                      <div className="loading-state"><p>문의 목록을 불러오고 있습니다...</p></div>
                  ) : inquiries.length === 0 ? (
                      <div className="empty-state">
                        <p>등록된 문의가 없습니다.</p>
                        {activeTab === 'myInquiries' && (
                            <button className="create-inquiry-btn" onClick={() => setActiveTab('create')}>문의하기</button>
                        )}
                      </div>
                  ) : (
                      <div className="inquiries-table">
                        <div className={`table-header ${activeTab === 'myInquiries' ? 'with-actions' : ''}`}>
                          <div className="header-cell category">종류</div>
                          <div className="header-cell title">제목</div>
                          <div className="header-cell date">작성일</div>
                          <div className="header-cell status">상태</div>
                          {activeTab === 'myInquiries' && <div className="header-cell actions">관리</div>}
                        </div>
                        {inquiries.map(inquiry => (
                            <div key={inquiry.id} className={`table-row ${activeTab === 'myInquiries' ? 'with-actions' : ''}`}>
                              <div className="table-cell category">
                                <span className="category-badge">{getCategoryLabel(inquiry.category || inquiry.type)}</span>
                              </div>
                              <div className="table-cell title clickable" onClick={() => handleInquiryClick(inquiry)}>
                                {inquiry.title}
                              </div>
                              <div className="table-cell date">
                                {formatDate(inquiry.createdAt || inquiry.created_at || inquiry.date)}
                              </div>
                              <div className="table-cell status">
                                <span className={`status-badge ${getStatusClass(inquiry.status)}`}>{getStatusText(inquiry.status)}</span>
                              </div>
                              {activeTab === 'myInquiries' && (
                                  <div className="table-cell actions">
                                    <button
                                        className="action-button delete-action"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          deleteInquiry(inquiry.id);
                                        }}
                                        disabled={loading}
                                        title="문의 삭제"
                                    >
                                      🗑️
                                    </button>
                                  </div>
                              )}
                            </div>
                        ))}
                      </div>
                  )}
                </div>
            ) : (
                // 문의 등록 폼
                <div className="inquiry-form-container">
                  <h3>새 문의 등록</h3>
                  <form onSubmit={handleSubmit} className="inquiry-form">
                    <div className="form-group">
                      <label htmlFor="title">제목 *</label>
                      <input type="text" id="title" name="title" value={formData.title}
                             onChange={handleInputChange} placeholder="문의 제목을 입력해주세요 (2글자 이상)" required disabled={loading} maxLength={100} minLength={2} />
                    </div>
                    <div className="form-group">
                      <label htmlFor="category">종류 *</label>
                      <select id="category" name="category" value={formData.category} onChange={handleInputChange} required disabled={loading}>
                        {categories.map(category => (
                            <option key={category.value} value={category.value} disabled={!category.value}>{category.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="content">내용 *</label>
                      <textarea id="content" name="content" value={formData.content}
                                onChange={handleInputChange} placeholder="문의 내용을 상세히 입력해주세요 (10글자 이상)" rows="8" required disabled={loading} maxLength={1000} minLength={10} />
                      <div className="char-count">{formData.content.length}/1000</div>
                    </div>
                    <div className="form-actions">
                      <button type="button" className="cancel-btn" onClick={() => setActiveTab('myInquiries')} disabled={loading}>취소</button>
                      <button type="submit" className="submit-btn" disabled={loading}>{loading ? '등록 중...' : '문의 등록'}</button>
                    </div>
                  </form>
                </div>
            )}
          </div>
        </div>
      </div>
  );
};

export default Inquiry;