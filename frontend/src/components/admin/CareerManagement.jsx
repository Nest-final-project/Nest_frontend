import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit3, Trash2, Filter, Download, RefreshCw, Briefcase, Calendar, Building, MapPin } from 'lucide-react';
import { careerAPI } from '../../services/api';
import './AdminCommon.css';

const CareerManagement = () => {
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCareer, setSelectedCareer] = useState(null);

  // 임시 데이터
  const [mockCareers] = useState([
    {
      id: 1,
      title: '프론트엔드 개발자',
      company: '네이버',
      location: '서울',
      startDate: '2020-01-01',
      endDate: '2023-12-31',
      description: 'React를 활용한 웹 서비스 개발',
      isActive: true
    },
    {
      id: 2,
      title: '백엔드 개발자',
      company: '카카오',
      location: '판교',
      startDate: '2018-03-01',
      endDate: '2020-12-31',
      description: 'Spring Boot를 활용한 API 개발',
      isActive: true
    },
    {
      id: 3,
      title: 'DevOps 엔지니어',
      company: '라인',
      location: '서울',
      startDate: '2021-06-01',
      endDate: null,
      description: 'AWS 기반 인프라 구축 및 운영',
      isActive: true
    }
  ]);

  useEffect(() => {
    loadCareers();
  }, []);

  const loadCareers = async () => {
    setLoading(true);
    try {
      // const response = await careerAPI.getAllCareers();
      // setCareers(response.data);
      
      // 임시로 목 데이터 사용
      setTimeout(() => {
        setCareers(mockCareers);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('경력 데이터 로딩 실패:', error);
      setCareers(mockCareers);
      setLoading(false);
    }
  };

  const filteredCareers = careers.filter(career => {
    const matchesSearch = career.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         career.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'active' && career.isActive) ||
                         (filterType === 'inactive' && !career.isActive);
    return matchesSearch && matchesFilter;
  });

  const handleEdit = (career) => {
    setSelectedCareer(career);
    setShowCreateModal(true);
  };

  const handleDelete = (careerId) => {
    if (window.confirm('정말로 이 경력을 삭제하시겠습니까?')) {
      setCareers(careers.filter(career => career.id !== careerId));
    }
  };

  const CareerModal = ({ isOpen, onClose, career }) => {
    const [formData, setFormData] = useState({
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      description: '',
      isActive: true
    });

    useEffect(() => {
      if (career) {
        setFormData(career);
      } else {
        setFormData({
          title: '',
          company: '',
          location: '',
          startDate: '',
          endDate: '',
          description: '',
          isActive: true
        });
      }
    }, [career]);

    const handleSubmit = (e) => {
      e.preventDefault();
      if (career) {
        setCareers(careers.map(c => c.id === career.id ? { ...formData, id: career.id } : c));
      } else {
        setCareers([...careers, { ...formData, id: Date.now() }]);
      }
      onClose();
    };

    if (!isOpen) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content career-modal">
          <div className="modal-header">
            <h3>{career ? '경력 수정' : '새 경력 추가'}</h3>
            <button className="modal-close" onClick={onClose}>×</button>
          </div>
          <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-group">
              <label>직책</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="직책을 입력하세요"
                required
              />
            </div>
            <div className="form-group">
              <label>회사명</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({...formData, company: e.target.value})}
                placeholder="회사명을 입력하세요"
                required
              />
            </div>
            <div className="form-group">
              <label>근무지</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="근무지를 입력하세요"
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>시작일</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>종료일</label>
                <input
                  type="date"
                  value={formData.endDate || ''}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                />
              </div>
            </div>
            <div className="form-group">
              <label>업무 설명</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="담당했던 업무를 설명해주세요"
                rows="4"
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
                {career ? '수정' : '생성'}
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
            <Briefcase size={28} />
            경력 관리
          </h2>
          <p>멘토들의 경력 정보를 관리합니다</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={loadCareers}>
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
              setSelectedCareer(null);
              setShowCreateModal(true);
            }}
          >
            <Plus size={18} />
            경력 추가
          </button>
        </div>
      </div>

      <div className="content-filters">
        <div className="search-bar">
          <Search size={18} />
          <input
            type="text"
            placeholder="직책, 회사명으로 검색..."
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
        </select>
      </div>

      <div className="content-table">
        <div className="table-header">
          <div className="table-cell">직책</div>
          <div className="table-cell">회사</div>
          <div className="table-cell">근무지</div>
          <div className="table-cell">근무기간</div>
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
            <p>새로운 경력을 추가해보세요</p>
          </div>
        ) : (
          filteredCareers.map((career) => (
            <div key={career.id} className="table-row">
              <div className="table-cell">
                <div className="cell-content">
                  <strong>{career.title}</strong>
                </div>
              </div>
              <div className="table-cell">
                <div className="cell-content">
                  <Building size={16} />
                  {career.company}
                </div>
              </div>
              <div className="table-cell">
                <div className="cell-content">
                  <MapPin size={16} />
                  {career.location}
                </div>
              </div>
              <div className="table-cell">
                <div className="cell-content">
                  <Calendar size={16} />
                  {career.startDate} ~ {career.endDate || '현재'}
                </div>
              </div>
              <div className="table-cell">
                <span className={`status-badge ${career.isActive ? 'active' : 'inactive'}`}>
                  {career.isActive ? '활성' : '비활성'}
                </span>
              </div>
              <div className="table-cell">
                <div className="table-actions">
                  <button 
                    className="action-btn edit"
                    onClick={() => handleEdit(career)}
                    title="수정"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button 
                    className="action-btn delete"
                    onClick={() => handleDelete(career.id)}
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

      <CareerModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setSelectedCareer(null);
        }}
        career={selectedCareer}
      />
    </div>
  );
};

export default CareerManagement;
