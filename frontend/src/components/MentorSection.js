import React, { useState } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import './MentorSection.css';

const MentorSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const mentors = [
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
      color: 'from-purple-500 to-pink-500'
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
      color: 'from-blue-500 to-cyan-500'
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
      color: 'from-green-500 to-teal-500'
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
      color: 'from-orange-500 to-red-500'
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
      color: 'from-indigo-500 to-purple-500'
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
      color: 'from-pink-500 to-rose-500'
    }
  ];

  const nextMentor = () => {
    setCurrentIndex((prev) => (prev + 1) % mentors.length);
  };

  const prevMentor = () => {
    setCurrentIndex((prev) => (prev - 1 + mentors.length) % mentors.length);
  };

  return (
    <section className="mentor-section">
      <div className="mentor-container">
        <h2 className="section-title gradient-text">추천 멘토</h2>
        
        <div className="mentor-carousel">
          <button 
            className="carousel-button carousel-button-prev"
            onClick={prevMentor}
          >
            <ChevronLeft />
          </button>
          
          <div className="mentor-grid">
            {mentors.map((mentor, index) => (
              <div 
                key={mentor.id}
                className="mentor-card glass-effect"
                style={{
                  display: window.innerWidth <= 768 ? 'block' : 
                    (index >= currentIndex && index < currentIndex + 3) || 
                    (currentIndex + 3 > mentors.length && index < (currentIndex + 3) % mentors.length) 
                    ? 'block' : 'none'
                }}
              >
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
                  <span className="mentor-price">{mentor.price}</span>
                  {mentor.isOnline && (
                    <span className="online-status">온라인</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <button 
            className="carousel-button carousel-button-next"
            onClick={nextMentor}
          >
            <ChevronRight />
          </button>
        </div>
      </div>
    </section>
  );
};

export default MentorSection;
