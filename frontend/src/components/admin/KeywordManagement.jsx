import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit3, Trash2, Filter, Download, RefreshCw, Hash, TrendingUp } from 'lucide-react';
import { keywordAPI } from '../../services/api';
import './AdminCommon.css';

const KeywordManagement = () => {
  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedKeyword, setSelectedKeyword] = useState(null);

  // 임시 데이터
  const [mockKeywords] = useState([
    {
      id: 1,
      name: 'React',
      category: '프론트엔드',
      usageCount: 156,
      isActive: true,
      popularity: 'high',
      createdAt: '2024-01-01T00:00:00'
    },
    {
      id: 2,
      name: 'Spring Boot',
      category: '백엔드',
      usageCount: 134,
      isActive: true,
      popularity: 'high',
      createdAt: '2024-01-01T00:00:00'
    },
    {
      id: 3,
      name: 'Docker',
      category: 'DevOps',
      usageCount: 89,
      isActive: true,
      popularity: 'medium',
      createdAt: '2024-01-01T00:00:00'
    },
    {
      id: 4,
      name: 'Machine Learning',
      category: '데이터 사이언스',
      usageCount: 67,
      isActive: true,
      popularity: 'medium',
      createdAt: '2024-01-01T00:00:00'
    },
    {
      id: 5,
      name: 'Angular',
      category: '프론트엔드',
      usageCount: 23,
      isActive: false,
      popularity: 'low',
      createdAt: '2024-01-01T00:00:00'
    }
  ]);

  useEffect(() => {
    loadKeywords();
  }, []);

  const loadKeywords = async () => {
    setLoading(true);
    try {
      // const response = await keywordAPI.getKeywords();
      // setKeywords(response.data);
      
      // 임시로 목 데이터 사용
      setTimeout(() => {
        setKeywords(mockKeywords);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('키워드 데이터 로딩 실패:', error);
      setKeywords(mockKeywords);
      setLoading(false);
    }
  };

  const filteredKeywords = keywords.filter(keyword => {
    const matchesSearch = keyword.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         keyword.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'active' && keyword.isActive) ||
                         (filterType === 'inactive' && !keyword.isActive) ||
                         (filterType === keyword.popularity);
    return matchesSearch && matchesFilter;
  });

  const handleEdit = (keyword) => {
    setSelectedKeyword(keyword);
    setShowCreateModal(true);
  };

  const handleDelete = (keywordId) => {
    if (window.confirm('정말로 이 키워드를 삭제하시겠습니까?')) {
      setKeywords(keywords.filter(keyword => keyword.id !== keywordId));
    }
  };

  const handleToggleActive = (keywordId) => {
    setKeywords(keywords.map(keyword =>
      keyword.id === keywordId
        ? { ...keyword, isActive: !keyword.isActive }
        : keyword
    ));
  };

  const getPopularityColor = (popularity) => {
    switch (popularity) {
      case 'high': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'low': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const KeywordModal = ({ isOpen, onClose, keyword }) => {
    const [formData, setFormData] = useState({
      name: '',
      category: '',
      isActive: true,
      popularity: 'medium'
    });

    useEffect(() => {
      if (keyword) {
        setFormData({
          name: keyword.name,
          category: keyword.category,
          isActive: keyword.isActive,
          popularity: keyword.popularity
        });
      } else {
        setFormData({
          name: '',
          category: '',
          isActive: true,
          popularity: 'medium'
        });
      }
    }, [keyword]);

    const handleSubmit = (e) => {
      e.preventDefault();
      if (keyword) {
        setKeywords(keywords.map(k => 
          k.id === keyword.id 
            ? { ...k, ...formData }
            : k
        ));
      } else {
        setKeywords([...keywords, { 
          ...formData, 
          id: Date.now(), 
          usageCount: 0,
          createdAt: new Date().toISOString()
        }]);
      }
      onClose();
    };

    if (!isOpen) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content keyword-modal">
          <div className="modal-header">
            <h3>{keyword ? '키워드 수정' : '새 키워드 추가'}</h3>
            <button className="modal-close" onClick={onClose}>×</button>
          </div>
          <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-group">
              <label>키워드명</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="키워드명을 입력하세요"
                required
              />
            </div>
            <div className="form-group">
              <label>카테고리</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                required
              >
                <option value="">카테고리 선택</option>
                <option value="프론트엔드">프론트엔드</option>
                <option value="백엔드">백엔드</option>
                <option value="DevOps">DevOps</option>
                <option value="데이터 사이언스">데이터 사이언스</option>
                <option value="모바일">모바일</option>
              </select>
            </div>
            <div className="form-group">
              <label>인기도</label>
              <select
                value={formData.popularity}
                onChange={(e) => setFormData({...formData, popularity: e.target.value})}
              >
                <option value="high">높음</option>
                <option value="medium">보통</option>
                <option value="low">낮음</option>
              </select>
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
                {keyword ? '수정' : '생성'}
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
            <Hash size={28} />
            키워드 관리
          </h2>
          <p>검색 및 분류에 사용되는 키워드를 관리합니다</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={loadKeywords}>
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
              setSelectedKeyword(null);
              setShowCreateModal(true);
            }}
          >
            <Plus size={18} />
            키워드 추가
          </button>
        </div>
      </div>

      <div className="content-filters">
        <div className="search-bar">
          <Search size={18} />
          <input
            type="text"
            placeholder="키워드명, 카테고리로 검색..."
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
          <option value="high">높은 인기도</option>
          <option value="medium">보통 인기도</option>
          <option value="low">낮은 인기도</option>
        </select>
      </div>

      <div className="content-table">
        <div className="table-header">
          <div className="table-cell">키워드</div>
          <div className="table-cell">카테고리</div>
          <div className="table-cell">사용 횟수</div>
          <div className="table-cell">인기도</div>
          <div className="table-cell">상태</div>
          <div className="table-cell">작업</div>
        </div>

        {loading ? (
          <div className="loading-state">
            <RefreshCw className="spinning" size={24} />
            <p>키워드 데이터를 불러오는 중...</p>
          </div>
        ) : filteredKeywords.length === 0 ? (
          <div className="empty-state">
            <Hash size={48} />
            <h3>키워드가 없습니다</h3>
            <p>새로운 키워드를 추가해보세요</p>
          </div>
        ) : (
          filteredKeywords.map((keyword) => (
            <div key={keyword.id} className="table-row">
              <div className="table-cell">
                <div className="cell-content">
                  <Hash size={16} />
                  <strong>{keyword.name}</strong>
                </div>
              </div>
              <div className="table-cell">
                <span className="category-badge">{keyword.category}</span>
              </div>
              <div className="table-cell">
                <div className="cell-content">
                  <TrendingUp size={16} />
                  {keyword.usageCount}회
                </div>
              </div>
              <div className="table-cell">
                <span 
                  className="popularity-badge"
                  style={{ color: getPopularityColor(keyword.popularity) }}
                >
                  {keyword.popularity}
                </span>
              </div>
              <div className="table-cell">
                <button
                  className={`status-toggle ${keyword.isActive ? 'active' : 'inactive'}`}
                  onClick={() => handleToggleActive(keyword.id)}
                >
                  {keyword.isActive ? '활성' : '비활성'}
                </button>
              </div>
              <div className="table-cell">
                <div className="table-actions">
                  <button 
                    className="action-btn edit"
                    onClick={() => handleEdit(keyword)}
                    title="수정"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button 
                    className="action-btn delete"
                    onClick={() => handleDelete(keyword.id)}
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

      <KeywordModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setSelectedKeyword(null);
        }}
        keyword={selectedKeyword}
      />
    </div>
  );
};

export default KeywordManagement;
