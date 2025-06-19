import React, { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import './MentorSection.css';

const MentorSection = ({ onCategorySelect }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: '전체' },
    { id: 'backend', name: '백엔드' },
    { id: 'frontend', name: '프론트엔드' },
    { id: 'devops', name: 'DevOps' },
    { id: 'ai', name: 'AI/ML' },
    { id: 'design', name: '디자인' },
    { id: 'fullstack', name: '풀스택' }
  ];

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
      category: 'backend'
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
      category: 'devops'
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
      category: 'fullstack'
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
      category: 'frontend'
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
      category: 'ai'
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
      category: 'design'
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
      category: 'backend'
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
      category: 'frontend'
    }
  ];

  const handleCategoryClick = (categoryId) => {
    if (onCategorySelect) {
      onCategorySelect(categoryId);
    } else {
      setSelectedCategory(categoryId);
    }
  };

  // 카테고리에 따른 멘토 필터링
  const filteredMentors = selectedCategory === 'all' 
    ? allMentors 
    : allMentors.filter(mentor => mentor.category === selectedCategory);

  // 3초마다 자동 슬라이드
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % Math.max(1, filteredMentors.length - 2));
    }, 3000);

    return () => clearInterval(interval);
  }, [filteredMentors.length]);

  // 카테고리 변경시 인덱스 리셋
  useEffect(() => {
    setCurrentIndex(0);
  }, [selectedCategory]);

  const nextMentor = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, filteredMentors.length - 2));
  };

  const prevMentor = () => {
    setCurrentIndex((prev) => (prev - 1 + Math.max(1, filteredMentors.length - 2)) % Math.max(1, filteredMentors.length - 2));
  };

  const getVisibleMentors = () => {
    const visible = [];
    for (let i = 0; i < 3; i++) {
      if (filteredMentors[currentIndex + i]) {
        visible.push(filteredMentors[currentIndex + i]);
      }
    }
    return visible;
  };

  return (
    <section className="mentor-section" id="category">
      <div className="mentor-container">
        <h2 className="section-title mento-text">카테고리별 추천 멘토</h2>
        
        {/* 카테고리 탭 */}
        <div className="category-tabs">
          {categories.map(category => (
            <button
              key={category.id}
              className={`category-tab ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => handleCategoryClick(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
        
        <div className="mentor-carousel">
          <button 
            className="carousel-button carousel-button-prev"
            onClick={prevMentor}
            disabled={filteredMentors.length <= 3}
          >
            <ChevronLeft />
          </button>
          
          <div className="mentor-slider">
            <div 
              className="mentor-track"
              style={{
                transform: `translateX(-${currentIndex * 33.333}%)`,
                transition: 'transform 0.5s ease-in-out'
              }}
            >
              {filteredMentors.map((mentor) => (
                <div 
                  key={mentor.id}
                  className="mentor-slide"
                >
                  <div className="mentor-card glass-effect">
                    <div className="mentor-card-shimmer"></div>
                    <div className={`mentor-avatar gradient-bg-${mentor.id}`}>
                      {mentor.avatar}
                    </div>
                    <h3 className="mentor-name">{mentor.name}</h3>
                    <p className="mentor-role">{mentor.role}</p>
                    <p className="mentor-company">{mentor.company}</p>
                    
                    <div className="mentor-stats">
                      <div className="mentor-stat">
                        <Star className="star-icon" />
                        <span>{mentor.rating}</span>
                      </div>
                      <div className="mentor-stat">
                        <span>{mentor.sessions}회</span>
                      </div>
                    </div>
                    
                    <div className="mentor-tags">
                      {mentor.tags.map((tag, tagIndex) => (
                        <span key={tagIndex} className="mentor-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="mentor-footer">
                      <button className="reservation-button">예약하기</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <button 
            className="carousel-button carousel-button-next"
            onClick={nextMentor}
            disabled={filteredMentors.length <= 3}
          >
            <ChevronRight />
          </button>
        </div>
        
        {/* 슬라이드 인디케이터 */}
        <div className="slide-indicators">
          {Array.from({ length: Math.max(1, filteredMentors.length - 2) }).map((_, index) => (
            <button
              key={index}
              className={`indicator ${currentIndex === index ? 'active' : ''}`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default MentorSection;
