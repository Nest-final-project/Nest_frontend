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

// Nest.dev FAQ
const FAQ_LIST = [
  {
    question: "Nest.dev에서는 어떤 서비스를 이용할 수 있나요?",
    answer: `Nest.dev에서는 개발자 멘토링, 코드 리뷰, 실무 프로젝트 Q&A, 이력서·포트폴리오 첨삭, 커리어 상담 등 다양한 개발자 맞춤 서비스를 제공합니다.
서비스 예약 및 진행, 결제, 피드백은 모두 Nest.dev 웹사이트에서 이루어집니다.`
  },
  {
    question: "멘토는 어떻게 찾고 예약할 수 있나요?",
    answer: `상단 카테고리 또는 검색 기능을 통해 원하는 분야(예: 백엔드, 프론트엔드, AI, CS 등)의 멘토를 찾을 수 있습니다.
멘토 프로필에서 제공 서비스, 경력, 후기, 예약 가능 시간을 확인하고 바로 예약 신청이 가능합니다.`
  },
  {
    question: "멘토링·코드리뷰 신청 후 진행 과정은 어떻게 되나요?",
    answer: `1. 멘토를 선택 후 신청서(질문/요청사항 등)와 함께 예약을 완료하면 멘토가 확인 후 수락하게 됩니다.
2. 예약 시간에 맞춰 온라인(채팅/화상/문서)으로 상담이 진행되며, 필요시 코드/문서 첨부도 가능합니다.
3. 멘토링 종료 후 피드백 및 후기를 남길 수 있습니다.`
  },
  {
    question: "결제와 환불 정책은 어떻게 되나요?",
    answer: `모든 서비스 결제는 Nest.dev 내 안전결제 시스템을 이용합니다.
예약 확정 전까지는 무료이며, 멘토가 수락 시 결제가 진행됩니다.
환불 정책은 [이용약관] 및 [환불규정]을 참고해 주세요. 예약 전 취소 시 전액 환불, 서비스 시작 이후 환불 불가입니다.`
  },
  {
    question: "기술 질문(코딩, CS, 진로 등)은 어떻게 남기면 되나요?",
    answer: `멘토 선택 후 "문의하기" 또는 "멘토링 신청"에서 구체적인 질문을 남겨주세요.
질문 내용이 구체적일수록 빠르고 정확한 답변을 받을 수 있습니다.`
  },
  {
    question: "멘토로 참여하고 싶어요. 어떻게 신청하나요?",
    answer: `마이페이지 > 멘토 신청 메뉴에서 지원할 수 있습니다.
심사 후 승인 시 멘토로 활동할 수 있으며, 본인의 전문 분야와 일정에 맞춰 서비스 등록·운영이 가능합니다.`
  },
  {
    question: "Nest.dev에서 진행된 상담/리뷰 기록은 어디서 볼 수 있나요?",
    answer: `내 문의 내역, 예약 내역, 멘토링 이력 등은 마이페이지 또는 고객센터 > 내 문의 내역에서 모두 확인할 수 있습니다.`
  }
];

const Inquiry = ({ onBack, initialTab = 'inquiries' }) => {
  const [activeTab, setActiveTab] = useState(initialTab); // 'faq', 'inquiries', 'myInquiries', 'create'
  const [inquiries, setInquiries] = useState([]);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    content: ''
  });
  const [loading, setLoading] = useState(false);
  const [faqOpenIndex, setFaqOpenIndex] = useState(null); // FAQ 오픈된 항목 인덱스

  // 문의 목록 조회
  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const response = await inquiryAPI.getAllComplaints();
      if (response.data) {
        let list = response.data.data?.content || response.data.data || response.data;
        setInquiries(list);
      }
    } catch (error) {
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
      alert('문의 상세 정보를 불러오는데 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 문의 삭제
  const deleteInquiry = async (complaintId) => {
    if (!window.confirm('정말로 이 문의를 삭제하시겠습니까?')) return;
    try {
      setLoading(true);
      await inquiryAPI.deleteUserInquiry(complaintId);
      setInquiries(prev => prev.filter(inquiry => inquiry.id !== complaintId));
      if (selectedInquiry && selectedInquiry.id === complaintId) setSelectedInquiry(null);
      alert('문의가 성공적으로 삭제되었습니다.');
    } catch (error) {
      alert('문의 삭제 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 탭 변경/마운트 시 데이터 로딩
  useEffect(() => {
    setSelectedInquiry(null);
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

  // FAQ 아코디언 토글
  const toggleFaq = (idx) => setFaqOpenIndex(faqOpenIndex === idx ? null : idx);

  return (
      <div className="inquiry-page">
        {/* 사이드바 */}
        <div className="inquiry-sidebar">
          <div className="sidebar-header"><h2>고객센터</h2></div>
          <div className="sidebar-menu">
            <div
                className={`menu-item ${activeTab === 'faq' ? 'current' : ''}`}
                onClick={() => { setActiveTab('faq'); setSelectedInquiry(null); }}
                style={{ cursor: 'pointer' }}
            >자주 묻는 질문</div>
            <div
                className={`menu-item ${activeTab === 'inquiries' ? 'current' : ''}`}
                onClick={() => { setActiveTab('inquiries'); setSelectedInquiry(null); }}
            >문의 사항</div>
            <div
                className={`menu-item ${activeTab === 'myInquiries' ? 'current' : ''}`}
                onClick={() => { setActiveTab('myInquiries'); setSelectedInquiry(null); }}
            >내 문의 내역</div>
            <div
                className={`menu-item ${activeTab === 'create' ? 'current' : ''}`}
                onClick={() => setActiveTab('create')}
            >문의하기</div>
            <div className="menu-item">공지사항</div>
          </div>
        </div>

        {/* 메인 컨텐츠 */}
        <div className="inquiry-main">
          <div className="inquiry-header">
            <button className="back-button" onClick={onBack}>← 돌아가기</button>
            <h1>
              {activeTab === 'faq'
                  ? '자주 묻는 질문'
                  : selectedInquiry
                      ? '문의 상세'
                      : activeTab === 'myInquiries'
                          ? '내 문의 내역'
                          : activeTab === 'inquiries'
                              ? '문의 사항'
                              : '문의하기'}
            </h1>
          </div>

          <div className="tab-content">
            {/* FAQ 탭만 FAQ만 */}
            {activeTab === 'faq' && (
                <div className="faq-list">
                  <section>
                    <div className="faq-title" style={{
                      color: "#555", fontSize: "18px", fontWeight: "bold", marginBottom: 24
                    }}>
                      서비스 이용방법 및 자주 묻는 질문(FAQ)
                    </div>
                    <div>
                      {FAQ_LIST.map((faq, idx) => (
                          <div
                              key={idx}
                              className="faq-item"
                              style={{
                                borderBottom: "1px solid #eee",
                                marginBottom: 0,
                                paddingBottom: 0
                              }}
                          >
                            <div
                                className="faq-question"
                                onClick={() => toggleFaq(idx)}
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  padding: "12px 0",
                                  cursor: 'pointer',
                                  color: "#767676",
                                  fontSize: "15px",
                                  fontWeight: 500
                                }}
                            >
                              <span>{faq.question}</span>
                              <svg
                                  width="16" height="16"
                                  style={{ transform: faqOpenIndex === idx ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}
                                  viewBox="0 0 16 16" fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                              >
                                <path d="M13.3334 5.33317L8.00008 10.6665L2.66675 5.33317" stroke="#555" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </div>
                            <div
                                className="faq-answer"
                                style={{
                                  maxHeight: faqOpenIndex === idx ? 500 : 0,
                                  opacity: faqOpenIndex === idx ? 1 : 0,
                                  overflow: 'hidden',
                                  transition: 'all 0.3s',
                                  paddingBottom: faqOpenIndex === idx ? 12 : 0
                                }}
                            >
                              <div style={{ display: 'flex', gap: 6 }}>
                          <span style={{
                            color: "#444", fontWeight: "bold"
                          }}>·</span>
                                <span
                                    style={{
                                      color: "#1a202c",
                                      fontSize: "14px",
                                      whiteSpace: "pre-line"
                                    }}
                                >{faq.answer}</span>
                              </div>
                            </div>
                          </div>
                      ))}
                    </div>
                  </section>
                </div>
            )}

            {/* FAQ가 아닌 탭들만 문의/폼/상세 노출 */}
            {activeTab !== 'faq' && (
                <>
                  {selectedInquiry ? (
                      // 문의 상세
                      <div className="inquiry-detail">
                        {/* ...문의 상세 기존 코드 붙이기... */}
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
                </>
            )}
          </div>
        </div>
      </div>
  );
};

export default Inquiry;
