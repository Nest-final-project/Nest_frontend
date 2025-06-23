import React, { useState, useEffect } from 'react';
import { inquiryAPI } from '../services/api';
import './Inquiry.css';

const Inquiry = ({ onBack, initialTab = 'inquiries' }) => {
  const [activeTab, setActiveTab] = useState(initialTab); // 'inquiries' or 'create'
  const [inquiries, setInquiries] = useState([]);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    content: ''
  });
  const [loading, setLoading] = useState(false);

  // 문의 목록 조회 API 호출
  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const response = await inquiryAPI.getUserInquiries();
      
      if (response.data) {
        setInquiries(response.data.data || response.data);
      }
    } catch (error) {
      console.error('문의 목록 조회 오류:', error);
      if (error.response?.status === 401) {
        alert('로그인이 필요합니다.');
      } else {
        alert('문의 목록을 불러오는데 오류가 발생했습니다.');
      }
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
        setSelectedInquiry(response.data);
      }
    } catch (error) {
      console.error('문의 상세 조회 오류:', error);
      alert('문의 상세 정보를 불러오는데 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 문의 삭제
  const deleteInquiry = async (complaintId) => {
    if (!window.confirm('정말로 이 문의를 삭제하시겠습니까?')) {
      return;
    }

    try {
      setLoading(true);
      await inquiryAPI.deleteUserInquiry(complaintId);
      
      // 목록에서 삭제된 문의 제거
      setInquiries(prev => prev.filter(inquiry => inquiry.id !== complaintId));
      
      // 상세 보기 중이었다면 목록으로 돌아가기
      if (selectedInquiry && selectedInquiry.id === complaintId) {
        setSelectedInquiry(null);
      }
      
      alert('문의가 성공적으로 삭제되었습니다.');
    } catch (error) {
      console.error('문의 삭제 오류:', error);
      alert('문의 삭제 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 문의 목록 조회
  useEffect(() => {
    if (activeTab === 'inquiries') {
      fetchInquiries();
    }
  }, [activeTab]);

  const categories = [
    { value: '', label: '문의 종류를 선택해주세요' },
    { value: '결제', label: '결제' },
    { value: '채팅', label: '채팅' },
    { value: '계정', label: '계정' },
    { value: '예약', label: '예약' },
    { value: '쿠폰', label: '쿠폰' },
    { value: '이용권', label: '이용권' },
    { value: '프로필', label: '프로필' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 새 문의 등록 API 호출
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.category || !formData.content) {
      alert('모든 항목을 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      const response = await inquiryAPI.createInquiry({
        title: formData.title,
        category: formData.category,
        content: formData.content
      });

      if (response.data) {
        setFormData({ title: '', category: '', content: '' });
        setActiveTab('inquiries');
        alert('문의가 성공적으로 등록되었습니다.');
        // 새로운 문의가 등록되었으므로 목록 새로고침
        fetchInquiries();
      }
    } catch (error) {
      console.error('문의 등록 오류:', error);
      if (error.response?.status === 401) {
        alert('로그인이 필요합니다.');
      } else {
        alert(error.response?.data?.message || '문의 등록 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'ANSWERED':
      case 'answered':
        return '답변완료';
      case 'PENDING':
      case 'pending':
      default:
        return '답변대기';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'ANSWERED':
      case 'answered':
        return 'status-answered';
      case 'PENDING':
      case 'pending':
      default:
        return 'status-pending';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const handleInquiryClick = (inquiry) => {
    fetchInquiryDetail(inquiry.id);
  };

  const handleBackToList = () => {
    setSelectedInquiry(null);
  };

  return (
    <div className="inquiry-page">
      {/* 사이드바 */}
      <div className="inquiry-sidebar">
        <div className="sidebar-header">
          <h2>고객센터</h2>
        </div>
        <div className="sidebar-menu">
          <div className="menu-item">
            자주 묻는 질문
          </div>
          <div 
            className={`menu-item ${activeTab === 'inquiries' ? 'current' : ''}`}
            onClick={() => {
              setActiveTab('inquiries');
              setSelectedInquiry(null);
            }}
          >
            문의 사항
          </div>
          <div 
            className={`menu-item ${activeTab === 'create' ? 'current' : ''}`}
            onClick={() => setActiveTab('create')}
          >
            문의하기
          </div>
          <div className="menu-item">
            공지사항
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="inquiry-main">
        <div className="inquiry-header">
          <button className="back-button" onClick={onBack}>
            ← 돌아가기
          </button>
          <h1>
            {selectedInquiry ? '문의 상세' : 
             activeTab === 'inquiries' ? '문의 사항' : '문의하기'}
          </h1>
        </div>

        {/* 탭 컨텐츠 */}
        <div className="tab-content">
          {selectedInquiry ? (
            // 문의 상세 보기
            <div className="inquiry-detail">
              <div className="detail-header">
                <button className="back-button" onClick={handleBackToList}>
                  ← 목록으로
                </button>
                <div className="detail-meta">
                  <span className="category-badge">{selectedInquiry.category}</span>
                  <span className={`status-badge ${getStatusClass(selectedInquiry.status)}`}>
                    {getStatusText(selectedInquiry.status)}
                  </span>
                </div>
              </div>
              
              <div className="detail-content">
                <h3>{selectedInquiry.title}</h3>
                <div className="detail-info">
                  <span>작성일: {formatDate(selectedInquiry.createdAt)}</span>
                  <button 
                    className="delete-btn"
                    onClick={() => deleteInquiry(selectedInquiry.id)}
                    disabled={loading}
                  >
                    삭제
                  </button>
                </div>
                <div className="detail-body">
                  <h4>문의 내용</h4>
                  <p>{selectedInquiry.content}</p>
                </div>
                
                {selectedInquiry.answer && (
                  <div className="answer-section">
                    <h4>답변</h4>
                    <div className="answer-content">
                      <p>{selectedInquiry.answer}</p>
                      {selectedInquiry.answeredAt && (
                        <div className="answer-date">
                          답변일: {formatDate(selectedInquiry.answeredAt)}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'inquiries' ? (
            // 문의 목록
            <div className="inquiries-list">
              <h3>내 문의 내역</h3>
              {loading ? (
                <div className="loading-state">
                  <p>문의 목록을 불러오고 있습니다...</p>
                </div>
              ) : inquiries.length === 0 ? (
                <div className="empty-state">
                  <p>등록된 문의가 없습니다.</p>
                  <button 
                    className="create-inquiry-btn"
                    onClick={() => setActiveTab('create')}
                  >
                    문의하기
                  </button>
                </div>
              ) : (
                <div className="inquiries-table">
                  <div className="table-header">
                    <div className="header-cell category">종류</div>
                    <div className="header-cell title">제목</div>
                    <div className="header-cell date">작성일</div>
                    <div className="header-cell status">상태</div>
                    <div className="header-cell actions">관리</div>
                  </div>
                  {inquiries.map(inquiry => (
                    <div key={inquiry.id} className="table-row">
                      <div className="table-cell category">
                        <span className="category-badge">{inquiry.category}</span>
                      </div>
                      <div 
                        className="table-cell title clickable" 
                        onClick={() => handleInquiryClick(inquiry)}
                      >
                        {inquiry.title}
                      </div>
                      <div className="table-cell date">
                        {formatDate(inquiry.createdAt || inquiry.created_at || inquiry.date)}
                      </div>
                      <div className="table-cell status">
                        <span className={`status-badge ${getStatusClass(inquiry.status)}`}>
                          {getStatusText(inquiry.status)}
                        </span>
                      </div>
                      <div className="table-cell actions">
                        <button 
                          className="delete-btn small"
                          onClick={() => deleteInquiry(inquiry.id)}
                          disabled={loading}
                        >
                          삭제
                        </button>
                      </div>
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
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="문의 제목을 입력해주세요"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="category">종류 *</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="content">내용 *</label>
                  <textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    placeholder="문의 내용을 상세히 입력해주세요"
                    rows="8"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-actions">
                  <button 
                    type="button" 
                    className="cancel-btn" 
                    onClick={() => setActiveTab('inquiries')}
                    disabled={loading}
                  >
                    취소
                  </button>
                  <button 
                    type="submit" 
                    className="submit-btn"
                    disabled={loading}
                  >
                    {loading ? '등록 중...' : '문의 등록'}
                  </button>
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