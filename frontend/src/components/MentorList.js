import React, { useState, useEffect } from 'react';
import { Star, Search, ArrowLeft } from 'lucide-react';
import './MentorList.css';
import { profileAPI, categoryAPI } from '../services/api';

const MentorList = ({ category, onBack, onMentorSelect }) => {
  const [mentors, setMentors] = useState([]);
  const [filteredMentors, setFilteredMentors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(category || '');

  // 카테고리 목록 로딩
  useEffect(() => {
    categoryAPI.getCategories()
    .then((res) => {
      const categoryList = Array.isArray(res?.data?.data)
          ? res.data.data
          : res?.data?.data?.content || [];
      setCategories(categoryList);
    })
    .catch((err) => {
      console.error('카테고리 정보를 불러오는 데 실패했습니다. : ', err);
    });
  }, []);

  // 멘토 목록 로딩
  useEffect(() => {
    profileAPI.getAllMentors()
    .then(res => {
      const allMentors = res?.data?.data || [];

      const filtered = selectedCategory
          ? allMentors.filter(m => m.category === selectedCategory)
          : allMentors;

      setMentors(filtered);
      setFilteredMentors(filtered);
    })
    .catch(err => {
      console.error('멘토 목록 불러오기 실패:', err);
    });
  }, [selectedCategory]);

  // 검색 및 정렬 필터링
  useEffect(() => {
    let result = [...mentors];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(m =>
          (m.title && m.title.toLowerCase().includes(term)) ||
          (m.introduction && m.introduction.toLowerCase().includes(term)) ||
          (m.category && m.category.toLowerCase().includes(term))
      );
    }

    switch (sortBy) {
      case 'name':
        result.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        break;
      case 'created':
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default:
        break;
    }

    setFilteredMentors(result);
  }, [mentors, searchTerm, sortBy]);

  return (
      <div className="mentor-list-container">
        <div className="mentor-list-header">
          <button className="back-button" onClick={onBack}>
            <ArrowLeft className="icon" />
            뒤로가기
          </button>
          <h1 className="mentor-list-title">
            {selectedCategory || '전체'} 멘토 ({filteredMentors.length}명)
          </h1>
        </div>

        <div className="mentor-list-controls">
          <div className="search-section">
            <div className="search-input-wrapper">
              <Search className="search-icon" />
              <input
                  type="text"
                  placeholder="키워드로 검색"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
              />
            </div>
          </div>

          <div className="filter-controls">
            <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
            >
              <option value="name">이름순</option>
              <option value="created">최근등록순</option>
            </select>

            <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="filter-select"
            >
              <option value="">전체 카테고리</option>
              {Array.isArray(categories) &&
                  categories.map(cat => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                  ))}
            </select>
          </div>
        </div>

        <div className="mentor-grid">
          {filteredMentors.map((mentor) => (
              <div
                  key={mentor.id}
                  className="mentor-list-card glass-effect"
                  onClick={() => onMentorSelect?.(mentor)}
              >
                <div className="mentor-card-header">
                  <div className="mentor-avatar">{mentor.title?.[0]}</div>
                  <div className="mentor-basic-info">
                    <h3 className="mentor-name">{mentor.name}</h3>
                    <p className="mentor-role">{mentor.title}</p>
                    <p className="mentor-company">{mentor.category}</p>
                  </div>

                </div>

                <div className="mentor-card-body">
                  <p className="mentor-description">{mentor.introduction}</p>
                  <div className="mentor-stats-row">
                    <div className="stat-item">
                      <span>{new Date(mentor.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
          ))}
        </div>

        {filteredMentors.length === 0 && (
            <div className="no-results">
              <h3>멘토가 없습니다</h3>
              <p>다른 키워드나 카테고리를 선택해보세요.</p>
            </div>
        )}
      </div>
  );
};

export default MentorList;
