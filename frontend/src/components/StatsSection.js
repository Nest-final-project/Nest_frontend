import React from 'react';
import './StatsSection.css';

const StatsSection = () => {
  const stats = [
    { number: '500+', label: '전문 멘토' },
    { number: '10K+', label: '성공한 멘티' },
    { number: '95%', label: '만족도' },
    { number: '24/7', label: '지원' }
  ];

  return (
    <section className="stats-section">
      <div className="stats-container">
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card glass-effect hover-scale">
              <div className="stat-number gradient-text">
                {stat.number}
              </div>
              <div className="stat-label">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
