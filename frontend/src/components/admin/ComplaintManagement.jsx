import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit3, Trash2, Filter, Download, RefreshCw, FileText, Clock, User, AlertTriangle } from 'lucide-react';
import { inquiryAPI } from '../../services/api';
import './AdminCommon.css';

const ComplaintManagement = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  // 임시 데이터
  const [mockComplaints] = useState([
    {
      id: 1,
      title: '결제 오류 문의',
      content: '멘토링 세션 결제가 진행되지 않습니다.',
      userName: '김사용자',
      userEmail: 'user@example.com',
      status: 'pending',
      category: 'payment',
      createdAt: '2024-01-15T10:30:00',
      answer: null,
      priority: 'high'
    },
    {
      id: 2,
      title: '멘토 신고',
      content: '부적절한 언행을 하는 멘토가 있습니다.',
      userName: '이민원',
      userEmail: 'complaint@example.com',
      status: 'answered',
      category: 'report',
      createdAt: '2024-01-14T15:20:00',
      answer: '해당 멘토에 대한 조치를 취했습니다.',
      priority: 'urgent'
    },
    {
      id: 3,
      title: '기능 개선 요청',
      content: '채팅 기능에 파일 첨부가 가능했으면 좋겠습니다.',
      userName: '박개발',
      userEmail: 'dev@example.com',
      status: 'resolved',
      category: 'feature',
      createdAt: '2024-01-13T09:15:00',
      answer: '다음 업데이트에 반영하겠습니다.',
      priority: 'low'
    }
  ]);

  useEffect(() => {
    loadComplaints();
  }, []);

  const loadComplaints = async () => {
    setLoading(true);
    try {
      // const response = await inquiryAPI.getAllInquiries();
      // setComplaints(response.data);
      
      // 임시로 목 데이터 사용
      setTimeout(() => {
        setComplaints(mockComplaints);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('민원 데이터 로딩 실패:', error);
      setComplaints(mockComplaints);
      setLoading(false);
    }
  };

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.userName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || complaint.status === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleViewDetail = (complaint) => {
    setSelectedComplaint(complaint);
    setShowDetailModal(true);
  };

  const handleStatusUpdate = (complaintId, newStatus) => {
    setComplaints(complaints.map(complaint =>
      complaint.id === complaintId ? { ...complaint, status: newStatus } : complaint
    ));
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'answered': return '#3b82f6';
      case 'resolved': return '#10b981';
      default: return '#6b7280';
    }
  };

  const ComplaintDetailModal = ({ isOpen, onClose, complaint }) => {
    const [answer, setAnswer] = useState('');

    useEffect(() => {
      if (complaint) {
        setAnswer(complaint.answer || '');
      }
    }, [complaint]);

    const handleSubmitAnswer = () => {
      if (complaint) {
        setComplaints(complaints.map(c =>
          c.id === complaint.id
            ? { ...c, answer, status: 'answered' }
            : c
        ));
        onClose();
      }
    };

    if (!isOpen || !complaint) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content complaint-modal">
          <div className="modal-header">
            <h3>민원 상세</h3>
            <button className="modal-close" onClick={onClose}>×</button>
          </div>
          <div className="modal-body">
            <div className="complaint-info">
              <div className="info-row">
                <label>제목:</label>
                <span>{complaint.title}</span>
              </div>
              <div className="info-row">
                <label>작성자:</label>
                <span>{complaint.userName} ({complaint.userEmail})</span>
              </div>
              <div className="info-row">
                <label>카테고리:</label>
                <span className="category-badge">{complaint.category}</span>
              </div>
              <div className="info-row">
                <label>우선순위:</label>
                <span
                  className="priority-badge"
                  style={{ color: getPriorityColor(complaint.priority) }}
                >
                  {complaint.priority}
                </span>
              </div>
              <div className="info-row">
                <label>상태:</label>
                <span
                  className="status-badge"
                  style={{ color: getStatusColor(complaint.status) }}
                >
                  {complaint.status}
                </span>
              </div>
              <div className="info-row">
                <label>접수일:</label>
                <span>{new Date(complaint.createdAt).toLocaleString()}</span>
              </div>
            </div>
            
            <div className="complaint-content">
              <label>문의 내용:</label>
              <div className="content-box">
                {complaint.content}
              </div>
            </div>

            <div className="complaint-answer">
              <label>답변:</label>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="답변을 입력하세요..."
                rows="6"
                className="answer-textarea"
              />
            </div>
          </div>
          <div className="modal-actions">
            <button className="btn-secondary" onClick={onClose}>
              닫기
            </button>
            <button className="btn-primary" onClick={handleSubmitAnswer}>
              답변 저장
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="admin-content-wrapper">
      <div className="content-header">
        <div className="header-left">
          <h2>
            <FileText size={28} />
            민원 관리
          </h2>
          <p>사용자 문의 및 신고를 관리합니다</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={loadComplaints}>
            <RefreshCw size={18} className={loading ? 'spinning' : ''} />
            새로고침
          </button>
          <button className="btn-secondary">
            <Download size={18} />
            내보내기
          </button>
        </div>
      </div>

      <div className="content-filters">
        <div className="search-bar">
          <Search size={18} />
          <input
            type="text"
            placeholder="제목, 작성자로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="filter-select"
        >
          <option value="all">전체</option>
          <option value="pending">대기중</option>
          <option value="answered">답변완료</option>
          <option value="resolved">해결완료</option>
        </select>
      </div>

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
        ) : filteredComplaints.length === 0 ? (
          <div className="empty-state">
            <FileText size={48} />
            <h3>민원이 없습니다</h3>
            <p>새로운 민원이 접수되면 여기에 표시됩니다</p>
          </div>
        ) : (
          filteredComplaints.map((complaint) => (
            <div key={complaint.id} className="table-row">
              <div className="table-cell">
                <div className="cell-content">
                  <strong>{complaint.title}</strong>
                  <small>{complaint.content.substring(0, 50)}...</small>
                </div>
              </div>
              <div className="table-cell">
                <div className="cell-content">
                  <User size={16} />
                  {complaint.userName}
                </div>
              </div>
              <div className="table-cell">
                <span className="category-badge">{complaint.category}</span>
              </div>
              <div className="table-cell">
                <span 
                  className="priority-badge"
                  style={{ color: getPriorityColor(complaint.priority) }}
                >
                  {complaint.priority === 'urgent' && <AlertTriangle size={14} />}
                  {complaint.priority}
                </span>
              </div>
              <div className="table-cell">
                <span 
                  className="status-badge"
                  style={{ color: getStatusColor(complaint.status) }}
                >
                  {complaint.status}
                </span>
              </div>
              <div className="table-cell">
                <div className="cell-content">
                  <Clock size={16} />
                  {new Date(complaint.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="table-cell">
                <div className="table-actions">
                  <button 
                    className="action-btn view"
                    onClick={() => handleViewDetail(complaint)}
                    title="상세보기"
                  >
                    <Edit3 size={16} />
                  </button>
                  <select
                    value={complaint.status}
                    onChange={(e) => handleStatusUpdate(complaint.id, e.target.value)}
                    className="status-select"
                  >
                    <option value="pending">대기중</option>
                    <option value="answered">답변완료</option>
                    <option value="resolved">해결완료</option>
                  </select>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

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
