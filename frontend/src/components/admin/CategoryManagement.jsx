import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit3, Trash2, Filter, Download, RefreshCw, Tag, Eye } from 'lucide-react';
import { categoryAPI } from '../../services/api';
import './AdminCommon.css';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // 임시 데이터
  const [mockCategories] = useState([
    {
      id: 1,
      name: '프론트엔드',
      description: 'React, Vue, Angular 등 프론트엔드 기술',
      mentorCount: 45,
      isActive: true,
      createdAt: '2024-01-01T00:00:00'
    },
    {
      id: 2,
      name: '백엔드',
      description: 'Spring, Node.js, Django 등 백엔드 기술',
      mentorCount: 38,
      isActive: true,
      createdAt: '2024-01-01T00:00:00'
    },
    {
      id: 3,
      name: 'DevOps',
      description: 'AWS, Docker, Kubernetes 등 인프라',
      mentorCount: 22,
      isActive: true,
      createdAt: '2024-01-01T00:00:00'
    },
    {
      id: 4,
      name: '데이터 사이언스',
      description: '머신러닝, 데이터 분석, AI',
      mentorCount: 15,
      isActive: false,
      createdAt: '2024-01-01T00:00:00'
    }
  ]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      // const response = await categoryAPI.getCategories();
      // setCategories(response.data);
      
      // 임시로 목 데이터 사용
      setTimeout(() => {
        setCategories(mockCategories);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('카테고리 데이터 로딩 실패:', error);
      setCategories(mockCategories);
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setShowCreateModal(true);
  };

  const handleDelete = (categoryId) => {
    if (window.confirm('정말로 이 카테고리를 삭제하시겠습니까?')) {
      setCategories(categories.filter(category => category.id !== categoryId));
    }
  };

  const handleToggleActive = (categoryId) => {
    setCategories(categories.map(category =>
      category.id === categoryId
        ? { ...category, isActive: !category.isActive }
        : category
    ));
  };

  const CategoryModal = ({ isOpen, onClose, category }) => {
    const [formData, setFormData] = useState({
      name: '',
      description: '',
      isActive: true
    });

    useEffect(() => {
      if (category) {
        setFormData({
          name: category.name,
          description: category.description,
          isActive: category.isActive
        });
      } else {
        setFormData({
          name: '',
          description: '',
          isActive: true
        });
      }
    }, [category]);

    const handleSubmit = (e) => {
      e.preventDefault();
      if (category) {
        setCategories(categories.map(c => 
          c.id === category.id 
            ? { ...c, ...formData }
            : c
        ));
      } else {
        setCategories([...categories, { 
          ...formData, 
          id: Date.now(), 
          mentorCount: 0,
          createdAt: new Date().toISOString()
        }]);
      }
      onClose();
    };

    if (!isOpen) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content category-modal">
          <div className="modal-header">
            <h3>{category ? '카테고리 수정' : '새 카테고리 추가'}</h3>
            <button className="modal-close" onClick={onClose}>×</button>
          </div>
          <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-group">
              <label>카테고리명</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="카테고리명을 입력하세요"
                required
              />
            </div>
            <div className="form-group">
              <label>설명</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="카테고리 설명을 입력하세요"
                rows="4"
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
                {category ? '수정' : '생성'}
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
            <Tag size={28} />
            카테고리 관리
          </h2>
          <p>멘토링 카테고리를 관리합니다</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={loadCategories}>
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
              setSelectedCategory(null);
              setShowCreateModal(true);
            }}
          >
            <Plus size={18} />
            카테고리 추가
          </button>
        </div>
      </div>

      <div className="content-filters">
        <div className="search-bar">
          <Search size={18} />
          <input
            type="text"
            placeholder="카테고리명, 설명으로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="content-table">
        <div className="table-header">
          <div className="table-cell">카테고리명</div>
          <div className="table-cell">설명</div>
          <div className="table-cell">멘토 수</div>
          <div className="table-cell">상태</div>
          <div className="table-cell">작업</div>
        </div>

        {loading ? (
          <div className="loading-state">
            <RefreshCw className="spinning" size={24} />
            <p>카테고리 데이터를 불러오는 중...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="empty-state">
            <Tag size={48} />
            <h3>카테고리가 없습니다</h3>
            <p>새로운 카테고리를 추가해보세요</p>
          </div>
        ) : (
          filteredCategories.map((category) => (
            <div key={category.id} className="table-row">
              <div className="table-cell">
                <div className="cell-content">
                  <Tag size={16} />
                  <strong>{category.name}</strong>
                </div>
              </div>
              <div className="table-cell">
                <div className="cell-content">
                  {category.description}
                </div>
              </div>
              <div className="table-cell">
                <div className="cell-content">
                  <span className="mentor-count">{category.mentorCount}명</span>
                </div>
              </div>
              <div className="table-cell">
                <button
                  className={`status-toggle ${category.isActive ? 'active' : 'inactive'}`}
                  onClick={() => handleToggleActive(category.id)}
                >
                  {category.isActive ? '활성' : '비활성'}
                </button>
              </div>
              <div className="table-cell">
                <div className="table-actions">
                  <button 
                    className="action-btn edit"
                    onClick={() => handleEdit(category)}
                    title="수정"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button 
                    className="action-btn delete"
                    onClick={() => handleDelete(category.id)}
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

      <CategoryModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setSelectedCategory(null);
        }}
        category={selectedCategory}
      />
    </div>
  );
};

export default CategoryManagement;
