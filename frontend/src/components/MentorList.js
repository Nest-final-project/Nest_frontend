import React, { useState, useEffect } from 'react';
import { Star, Filter, Search, ArrowLeft } from 'lucide-react';
import './MentorList.css';

const MentorList = ({ category, onBack, onMentorSelect }) => {
  const [mentors, setMentors] = useState([]);
  const [filteredMentors, setFilteredMentors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [filterBy, setFilterBy] = useState('all');

  const categories = {
    all: '전체',
    backend: '백엔드',
    frontend: '프론트엔드',
    devops: 'DevOps',
    ai: 'AI/ML',
    design: '디자인',
    fullstack: '풀스택'
  };

  const allMentors = [
    {
      id: 1,
      name: '김재연',
      role: '시니어 백엔드 개발자',
      company: 'Nest Corp',
      rating: 4.9,
      sessions: 142,
      tags: ['#백엔드', '#Node.js', '#AWS'],
      avatar: '김',
      isOnline: true,
      price: '50,000원/시간',
      color: 'from-purple-500 to-pink-500',
      category: 'backend',
      experience: '5년',
      description: '대규모 서비스 아키텍처 설계 및 최적화 전문가'
    },
    {
      id: 2,
      name: '박성원',
      role: 'DevOps 엔지니어',
      company: 'Cloud Solutions',
      rating: 4.8,
      sessions: 89,
      tags: ['#DevOps', '#Docker', '#K8s'],
      avatar: '박',
      isOnline: true,
      price: '60,000원/시간',
      color: 'from-blue-500 to-cyan-500',
      category: 'devops',
      experience: '4년',
      description: '클라우드 인프라 구축 및 자동화 전문가'
    },
    {
      id: 3,
      name: '황원욱',
      role: '풀스택 개발자',
      company: 'Tech Innovations',
      rating: 4.9,
      sessions: 203,
      tags: ['#풀스택', '#React', '#Python'],
      avatar: '황',
      isOnline: false,
      price: '55,000원/시간',
      color: 'from-green-500 to-teal-500',
      category: 'fullstack',
      experience: '6년',
      description: '프론트엔드부터 백엔드까지 전 영역 개발 가능'
    },
    {
      id: 4,
      name: '이수진',
      role: '프론트엔드 리드',
      company: 'Design Studio',
      rating: 4.9,
      sessions: 167,
      tags: ['#프론트엔드', '#Vue', '#TypeScript'],
      avatar: '이',
      isOnline: true,
      price: '45,000원/시간',
      color: 'from-orange-500 to-red-500',
      category: 'frontend',
      experience: '4년',
      description: '사용자 경험을 중시하는 프론트엔드 개발 전문가'
    },
    {
      id: 5,
      name: '정민호',
      role: 'AI 엔지니어',
      company: 'AI Labs',
      rating: 4.9,
      sessions: 234,
      tags: ['#AI', '#머신러닝', '#TensorFlow'],
      avatar: '정',
      isOnline: true,
      price: '70,000원/시간',
      color: 'from-indigo-500 to-purple-500',
      category: 'ai',
      experience: '7년',
      description: '머신러닝 모델 설계 및 최적화 전문가'
    },
    {
      id: 6,
      name: '최유리',
      role: 'UI/UX 디렉터',
      company: 'Creative Hub',
      rating: 4.8,
      sessions: 156,
      tags: ['#디자인', '#Figma', '#브랜딩'],
      avatar: '최',
      isOnline: true,
      price: '55,000원/시간',
      color: 'from-pink-500 to-rose-500',
      category: 'design',
      experience: '5년',
      description: '사용자 중심의 디자인 시스템 구축 전문가'
    },
    {
      id: 7,
      name: '강민수',
      role: '백엔드 아키텍트',
      company: 'Enterprise Solutions',
      rating: 4.9,
      sessions: 189,
      tags: ['#백엔드', '#Java', '#Spring'],
      avatar: '강',
      isOnline: true,
      price: '65,000원/시간',
      color: 'from-cyan-500 to-blue-500',
      category: 'backend',
      experience: '8년',
      description: '대용량 트래픽 처리 및 시스템 아키텍처 설계'
    },
    {
      id: 8,
      name: '신지은',
      role: '프론트엔드 개발자',
      company: 'Startup Hub',
      rating: 4.8,
      sessions: 124,
      tags: ['#프론트엔드', '#React', '#Next.js'],
      avatar: '신',
      isOnline: true,
      price: '40,000원/시간',
      color: 'from-yellow-500 to-orange-500',
      category: 'frontend',
      experience: '3년',
      description: '모던 프론트엔드 기술 스택 활용 전문가'
    },
    {
      id: 9,
      name: '임현우',
      role: 'ML 엔지니어',
      company: 'Data Science Corp',
      rating: 4.8,
      sessions: 98,
      tags: ['#AI', '#딥러닝', '#PyTorch'],
      avatar: '임',
      isOnline: true,
      price: '65,000원/시간',
      color: 'from-purple-500 to-indigo-500',
      category: 'ai',
      experience: '5년',
      description: '딥러닝 모델 개발 및 최적화 전문가'
    },
    {
      id: 10,
      name: '조민영',
      role: '클라우드 아키텍트',
      company: 'Cloud Native Inc',
      rating: 4.9,
      sessions: 156,
      tags: ['#DevOps', '#AWS', '#Terraform'],
      avatar: '조',
      isOnline: true,
      price: '70,000원/시간',
      color: 'from-blue-500 to-green-500',
      category: 'devops',
      experience: '6년',
      description: '클라우드 네이티브 아키텍처 설계 전문가'
    }
  ];

  useEffect(() => {
    // 카테고리에 따른 멘토 필터링
    const categoryMentors = category === 'all' 
      ? allMentors 
      : allMentors.filter(mentor => mentor.category === category);
    
    setMentors(categoryMentors);
    setFilteredMentors(categoryMentors);
  }, [category]);

  useEffect(() => {
    let result = [...mentors];

    // 검색 필터링
    if (searchTerm) {
      result = result.filter(mentor => 
        mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mentor.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mentor.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mentor.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // 상태 필터링 제거 (온라인/오프라인 필터 삭제)
    // if (filterBy === 'online') {
    //   result = result.filter(mentor => mentor.isOnline);
    // } else if (filterBy === 'offline') {
    //   result = result.filter(mentor => !mentor.isOnline);
    // }

    // 정렬
    switch (sortBy) {
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'sessions':
        result.sort((a, b) => b.sessions - a.sessions);
        break;
      case 'price':
        result.sort((a, b) => {
          const priceA = parseInt(a.price.replace(/[^0-9]/g, ''));
          const priceB = parseInt(b.price.replace(/[^0-9]/g, ''));
          return priceA - priceB;
        });
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    setFilteredMentors(result);
  }, [mentors, searchTerm, sortBy, filterBy]);

  return (
    <div className="mentor-list-container">
      <div className="mentor-list-header">
        <button className="back-button" onClick={onBack}>
          <ArrowLeft className="icon" />
          뒤로가기
        </button>
        <h1 className="mentor-list-title">
          {categories[category]} 멘토 ({filteredMentors.length}명)
        </h1>
      </div>

      <div className="mentor-list-controls">
        <div className="search-section">
          <div className="search-input-wrapper">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="멘토 이름, 역할, 기술스택으로 검색"
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
            <option value="rating">평점순</option>
            <option value="sessions">세션수순</option>
            <option value="price">가격순</option>
            <option value="name">이름순</option>
          </select>

          {/* 온라인/오프라인 필터 제거 */}
          {/* <select 
            value={filterBy} 
            onChange={(e) => setFilterBy(e.target.value)}
            className="filter-select"
          >
            <option value="all">전체상태</option>
            <option value="online">온라인</option>
            <option value="offline">오프라인</option>
          </select> */}
        </div>
      </div>

      <div className="mentor-grid">
        {filteredMentors.map((mentor) => (
          <div 
            key={mentor.id} 
            className="mentor-list-card glass-effect"
            onClick={() => onMentorSelect && onMentorSelect(mentor)}
          >
            <div className="mentor-card-header">
              <div className={`mentor-avatar gradient-bg-${mentor.id}`}>
                {mentor.avatar}
              </div>
              <div className="mentor-basic-info">
                <h3 className="mentor-name">{mentor.name}</h3>
                <p className="mentor-role">{mentor.role}</p>
                <p className="mentor-company">{mentor.company}</p>
                {/* 온라인/오프라인 상태 제거 */}
                {/* <div className="mentor-status">
                  <div className={`status-indicator ${mentor.isOnline ? 'online' : 'offline'}`}></div>
                  <span className="status-text">
                    {mentor.isOnline ? '온라인' : '오프라인'}
                  </span>
                </div> */}
              </div>
              <div className="mentor-price">
                <span className="price-text">{mentor.price}</span>
              </div>
            </div>

            <div className="mentor-card-body">
              <p className="mentor-description">{mentor.description}</p>
              
              <div className="mentor-stats-row">
                <div className="stat-item">
                  <Star className="star-icon" />
                  <span>{mentor.rating}</span>
                </div>
                <div className="stat-item">
                  <span>경력 {mentor.experience}</span>
                </div>
                <div className="stat-item">
                  <span>{mentor.sessions}회 세션</span>
                </div>
              </div>

              <div className="mentor-tags">
                {mentor.tags.map((tag, tagIndex) => (
                  <span key={tagIndex} className="mentor-tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* 프로필보기, 세션예약 버튼 제거 */}
            {/* <div className="mentor-card-footer">
              <button className="view-profile-button">프로필 보기</button>
              <button className="book-session-button">세션 예약</button>
            </div> */}
          </div>
        ))}
      </div>

      {filteredMentors.length === 0 && (
        <div className="no-results">
          <h3>검색 결과가 없습니다</h3>
          <p>다른 검색어나 필터를 시도해보세요.</p>
        </div>
      )}
    </div>
  );
};

export default MentorList;
