import React, { useState, useEffect } from 'react';
import './Inquiry.css';

const Inquiry = ({ onBack, initialTab = 'inquiries' }) => {
  const [activeTab, setActiveTab] = useState(initialTab); // 'inquiries' or 'create'
  const [inquiries, setInquiries] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    content: ''
  });

  // 문의 목록 더미 데이터 (추후 API로 교체)
  useEffect(() => {
    const dummyInquiries = [
      {
        id: 1,
        category: '결제',
        title: '결제가 완료되었는데 이용권이 적용되지 않습니다.',
        date: '2024-06-20',
        status: 'answered'
      },
      {
        id: 2,
        category: '채팅',
        title: '채팅 메시지가 전송되지 않는 문제',
        date: '2024-06-19',
        status: 'pending'
      },
      {
        id: 3,
        category: '예약',
        title: '멘토 예약 시간 변경 요청',
        date: '2024-06-18',
        status: 'answered'
      },
      {
        id: 4,
        category: '계정',
        title: '프로필 사진 업로드가 안됩니다',
        date: '2024-06-17',
        status: 'pending'
      }
    ];
    setInquiries(dummyInquiries);
  }, []);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.category || !formData.content) {
      alert('모든 항목을 입력해주세요.');
      return;
    }

    // 새 문의 생성 (추후 API 호출로 교체)
    const newInquiry = {
      id: Date.now(),
      category: formData.category,
      title: formData.title,
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
      content: formData.content
    };

    setInquiries(prev => [newInquiry, ...prev]);
    setFormData({ title: '', category: '', content: '' });
    setActiveTab('inquiries');
    alert('문의가 성공적으로 등록되었습니다.');
  };

  const getStatusText = (status) => {
    return status === 'answered' ? '답변완료' : '답변대기';
  };

  const getStatusClass = (status) => {
    return status === 'answered' ? 'status-answered' : 'status-pending';
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
            onClick={() => setActiveTab('inquiries')}
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
          <h1>{activeTab === 'inquiries' ? '문의 사항' : '문의하기'}</h1>
        </div>

        {/* 탭 컨텐츠 */}
        <div className="tab-content">
          {activeTab === 'inquiries' ? (
            <div className="inquiries-list">
              <h3>내 문의 내역</h3>
              {inquiries.length === 0 ? (
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
                  </div>
                  {inquiries.map(inquiry => (
                    <div key={inquiry.id} className="table-row">
                      <div className="table-cell category">
                        <span className="category-badge">{inquiry.category}</span>
                      </div>
                      <div className="table-cell title">{inquiry.title}</div>
                      <div className="table-cell date">{inquiry.date}</div>
                      <div className="table-cell status">
                        <span className={`status-badge ${getStatusClass(inquiry.status)}`}>
                          {getStatusText(inquiry.status)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
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
                  />
                </div>

                <div className="form-actions">
                  <button type="button" className="cancel-btn" onClick={() => setActiveTab('inquiries')}>
                    취소
                  </button>
                  <button type="submit" className="submit-btn">
                    문의 등록
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