import React from 'react';
import ScrollReveal from '../components/ScrollReveal';
import AnimatedButton from '../components/AnimatedButton';
import ChickAnimation from '../components/ChickAnimation';
import './CallToAction.css';

const CallToAction = () => {
  return (
    <section className="cta-section">
      <div className="cta-container">
        <ScrollReveal animation="fadeUp">
          <div className="cta-content">
            <h2 className="cta-title">
              성장의 여정을 시작하세요
              <ChickAnimation size="large" animation="bounce" />
            </h2>
            <p className="cta-description">
              지금 바로 전문 멘토와 함께 당신의 목표를 현실로 만들어보세요. 
              첫 상담은 무료로 진행됩니다.
            </p>
            
            <div className="cta-buttons">
              <AnimatedButton 
                variant="primary" 
                size="large"
                onClick={() => alert('멘토링 시작하기 클릭!')}
              >
                🚀 무료 상담 신청하기
              </AnimatedButton>
              
              <AnimatedButton 
                variant="secondary" 
                size="large"
                onClick={() => alert('더 알아보기 클릭!')}
              >
                📞 문의하기
              </AnimatedButton>
            </div>
            
            <div className="cta-features">
              <div className="feature-item">
                <span className="feature-icon">✅</span>
                <span className="feature-text">무료 첫 상담</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">⚡</span>
                <span className="feature-text">24시간 빠른 매칭</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🎯</span>
                <span className="feature-text">100% 맞춤형 솔루션</span>
              </div>
            </div>
          </div>
        </ScrollReveal>
        
        <ScrollReveal animation="scale" delay={300}>
          <div className="cta-visual">
            <div className="success-badge">
              <span className="badge-emoji">🏆</span>
              <div className="badge-text">
                <strong>1,500+</strong>
                <span>성공 사례</span>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default CallToAction;
