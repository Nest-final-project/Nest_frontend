import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit3, Trash2, Filter, Download, RefreshCw, Ticket, Clock, DollarSign } from 'lucide-react';
import { ticketAPI } from '../../services/api';
import './AdminCommon.css';

const TicketManagement = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // 임시 데이터
  const [mockTickets] = useState([
    {
      id: 1,
      name: '1회 멘토링 이용권',
      description: '1회 멘토링 세션을 이용할 수 있는 이용권',
      price: 15000,
      duration: 60,
      sessionCount: 1,
      isActive: true,
      salesCount: 234,
      createdAt: '2024-01-01T00:00:00'
    },
    {
      id: 2,
      name: '5회 멘토링 패키지',
      description: '5회 멘토링 세션을 할인된 가격으로 이용',
      price: 65000,
      duration: 60,
      sessionCount: 5,
      isActive: true,
      salesCount: 89,
      createdAt: '2024-01-01T00:00:00'
    },
    {
      id: 3,
      name: '월간 무제한 이용권',
      description: '한 달간 무제한 멘토링 세션 이용 가능',
      price: 150000,
      duration: 60,
      sessionCount: -1, // -1은 무제한을 의미
      isActive: true,
      salesCount: 45,
      createdAt: '2024-01-01T00:00:00'
    },
    {
      id: 4,
      name: '체험용 이용권',
      description: '신규 사용자를 위한 체험용 이용권',
      price: 0,
      duration: 30,
      sessionCount: 1,
      isActive: false,
      salesCount: 156,
      createdAt: '2024-01-01T00:00:00'
    }
  ]);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    setLoading(true);
    try {
      // const response = await ticketAPI.getTickets();
      // setTickets(response.data);
      
      // 임시로 목 데이터 사용
      setTimeout(() => {
        setTickets(mockTickets);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('이용권 데이터 로딩 실패:', error);
      setTickets(mockTickets);
      setLoading(false);
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'active' && ticket.isActive) ||
                         (filterType === 'inactive' && !ticket.isActive) ||
                         (filterType === 'free' && ticket.price === 0) ||
                         (filterType === 'paid' && ticket.price > 0);
    return matchesSearch && matchesFilter;
  });

  const handleEdit = (ticket) => {
    setSelectedTicket(ticket);
    setShowCreateModal(true);
  };

  const handleDelete = (ticketId) => {
    if (window.confirm('정말로 이 이용권을 삭제하시겠습니까?')) {
      setTickets(tickets.filter(ticket => ticket.id !== ticketId));
    }
  };

  const handleToggleActive = (ticketId) => {
    setTickets(tickets.map(ticket =>
      ticket.id === ticketId
        ? { ...ticket, isActive: !ticket.isActive }
        : ticket
    ));
  };

  const formatPrice = (price) => {
    return price === 0 ? '무료' : `₩${price.toLocaleString()}`;
  };

  const formatSessionCount = (count) => {
    return count === -1 ? '무제한' : `${count}회`;
  };

  const TicketModal = ({ isOpen, onClose, ticket }) => {
    const [formData, setFormData] = useState({
      name: '',
      description: '',
      price: 0,
      duration: 60,
      sessionCount: 1,
      isActive: true
    });

    useEffect(() => {
      if (ticket) {
        setFormData({
          name: ticket.name,
          description: ticket.description,
          price: ticket.price,
          duration: ticket.duration,
          sessionCount: ticket.sessionCount,
          isActive: ticket.isActive
        });
      } else {
        setFormData({
          name: '',
          description: '',
          price: 0,
          duration: 60,
          sessionCount: 1,
          isActive: true
        });
      }
    }, [ticket]);

    const handleSubmit = (e) => {
      e.preventDefault();
      if (ticket) {
        setTickets(tickets.map(t => 
          t.id === ticket.id 
            ? { ...t, ...formData }
            : t
        ));
      } else {
        setTickets([...tickets, { 
          ...formData, 
          id: Date.now(), 
          salesCount: 0,
          createdAt: new Date().toISOString()
        }]);
      }
      onClose();
    };

    if (!isOpen) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content ticket-modal">
          <div className="modal-header">
            <h3>{ticket ? '이용권 수정' : '새 이용권 추가'}</h3>
            <button className="modal-close" onClick={onClose}>×</button>
          </div>
          <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-group">
              <label>이용권명</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="이용권명을 입력하세요"
                required
              />
            </div>
            <div className="form-group">
              <label>설명</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="이용권 설명을 입력하세요"
                rows="3"
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>가격 (원)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: parseInt(e.target.value) || 0})}
                  min="0"
                  required
                />
              </div>
              <div className="form-group">
                <label>세션 시간 (분)</label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value) || 0})}
                  min="15"
                  step="15"
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>세션 횟수 (-1은 무제한)</label>
              <input
                type="number"
                value={formData.sessionCount}
                onChange={(e) => setFormData({...formData, sessionCount: parseInt(e.target.value) || 0})}
                min="-1"
                required
              />
            </div>
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                />
                활성 상태
              </label>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={onClose}>
                취소
              </button>
              <button type="submit" className="btn-primary">
                {ticket ? '수정' : '생성'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="admin-content-wrapper">
      <div className="content-header">
        <div className="header-left">
          <h2>
            <Ticket size={28} />
            이용권 관리
          </h2>
          <p>멘토링 이용권을 관리합니다</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={loadTickets}>
            <RefreshCw size={18} className={loading ? 'spinning' : ''} />
            새로고침
          </button>
          <button className="btn-secondary">
            <Download size={18} />
            내보내기
          </button>
          <button 
            className="btn-primary"
            onClick={() => {
              setSelectedTicket(null);
              setShowCreateModal(true);
            }}
          >
            <Plus size={18} />
            이용권 추가
          </button>
        </div>
      </div>

      <div className="content-filters">
        <div className="search-bar">
          <Search size={18} />
          <input
            type="text"
            placeholder="이용권명, 설명으로 검색..."
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
          <option value="active">활성</option>
          <option value="inactive">비활성</option>
          <option value="free">무료</option>
          <option value="paid">유료</option>
        </select>
      </div>

      <div className="content-table">
        <div className="table-header">
          <div className="table-cell">이용권명</div>
          <div className="table-cell">가격</div>
          <div className="table-cell">세션 정보</div>
          <div className="table-cell">판매량</div>
          <div className="table-cell">상태</div>
          <div className="table-cell">작업</div>
        </div>

        {loading ? (
          <div className="loading-state">
            <RefreshCw className="spinning" size={24} />
            <p>이용권 데이터를 불러오는 중...</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="empty-state">
            <Ticket size={48} />
            <h3>이용권이 없습니다</h3>
            <p>새로운 이용권을 추가해보세요</p>
          </div>
        ) : (
          filteredTickets.map((ticket) => (
            <div key={ticket.id} className="table-row">
              <div className="table-cell">
                <div className="cell-content">
                  <Ticket size={16} />
                  <div>
                    <strong>{ticket.name}</strong>
                    <small>{ticket.description}</small>
                  </div>
                </div>
              </div>
              <div className="table-cell">
                <div className="cell-content">
                  <DollarSign size={16} />
                  <span className={ticket.price === 0 ? 'free-price' : 'paid-price'}>
                    {formatPrice(ticket.price)}
                  </span>
                </div>
              </div>
              <div className="table-cell">
                <div className="cell-content">
                  <Clock size={16} />
                  <div>
                    <div>{formatSessionCount(ticket.sessionCount)}</div>
                    <small>{ticket.duration}분/세션</small>
                  </div>
                </div>
              </div>
              <div className="table-cell">
                <div className="cell-content">
                  <span className="sales-count">{ticket.salesCount}건</span>
                </div>
              </div>
              <div className="table-cell">
                <button
                  className={`status-toggle ${ticket.isActive ? 'active' : 'inactive'}`}
                  onClick={() => handleToggleActive(ticket.id)}
                >
                  {ticket.isActive ? '활성' : '비활성'}
                </button>
              </div>
              <div className="table-cell">
                <div className="table-actions">
                  <button 
                    className="action-btn edit"
                    onClick={() => handleEdit(ticket)}
                    title="수정"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button 
                    className="action-btn delete"
                    onClick={() => handleDelete(ticket.id)}
                    title="삭제"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <TicketModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setSelectedTicket(null);
        }}
        ticket={selectedTicket}
      />
    </div>
  );
};

export default TicketManagement;
