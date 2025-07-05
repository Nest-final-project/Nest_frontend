import React, { useEffect, useState } from 'react';
import './ParticleBackground.css';

const ParticleBackground = () => {
  const [particles, setParticles] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // 다크모드 감지 함수
    const checkDarkMode = () => {
      // 여러 방법으로 다크모드 확인
      const bodyDark = document.body.classList.contains('dark-mode');
      const htmlTheme = document.documentElement.getAttribute('data-theme') === 'dark';
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

      const isDark = bodyDark || htmlTheme || systemDark;
      console.log('🔍 다크모드 감지 결과:', {
        bodyDark,
        htmlTheme,
        systemDark,
        finalIsDark: isDark
      });

      setIsDarkMode(isDark);

      // body에 클래스 강제 적용 (디버깅용)
      if (isDark) {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
    };

    // 초기 체크
    checkDarkMode();

    // MutationObserver로 클래스 변경 감지
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class', 'data-theme']
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    // 시스템 테마 변경 감지
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = (e) => {
      console.log('시스템 테마 변경:', e.matches);
      checkDarkMode();
    };
    mediaQuery.addEventListener('change', handleMediaChange);

    // 파티클 생성
    const createParticles = () => {
      const newParticles = [];
      // 다크모드와 라이트모드에 따른 색상 설정
      const lightColors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'];
      const darkColors = ['#3b82f6', '#8b5cf6', '#6366f1', '#10b981', '#f59e0b'];
      const colors = isDarkMode ? darkColors : lightColors;

      console.log(`🎨 파티클 색상 적용: ${isDarkMode ? '다크모드' : '라이트모드'}`, colors);

      for (let i = 0; i < 30; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          delay: Math.random() * 15,
          duration: Math.random() * 10 + 10,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
      setParticles(newParticles);
    };

    createParticles();

    // 전역 디버깅 함수
    window.toggleDarkMode = () => {
      const currentDark = document.body.classList.contains('dark-mode');
      if (currentDark) {
        document.body.classList.remove('dark-mode');
        document.documentElement.removeAttribute('data-theme');
        console.log('🌞 라이트모드로 전환');
      } else {
        document.body.classList.add('dark-mode');
        document.documentElement.setAttribute('data-theme', 'dark');
        console.log('🌙 다크모드로 전환');
      }
    };

    window.checkBackground = () => {
      const bg = document.querySelector('.dynamic-background');
      console.log('배경 요소:', bg);
      console.log('배경 클래스:', bg?.className);
      console.log('배경 스타일:', window.getComputedStyle(bg).background);
    };

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', handleMediaChange);
    };
  }, [isDarkMode]);

  return (
      <>
        {/* Dynamic Background */}
        <div className={`dynamic-background ${isDarkMode ? 'dark-mode' : ''}`}>
          <div className="gradient-overlay"></div>
        </div>

        {/* Particles */}
        <div className="particles-container">
          {particles.map(particle => (
              <div
                  key={particle.id}
                  className="particle"
                  style={{
                    left: `${particle.x}%`,
                    backgroundColor: particle.color,
                    animationDelay: `${particle.delay}s`,
                    animationDuration: `${particle.duration}s`,
                    boxShadow: `0 0 10px ${particle.color}`
                  }}
              />
          ))}
        </div>
      </>
  );
};

export default ParticleBackground;
