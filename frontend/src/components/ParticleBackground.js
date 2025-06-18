import React, { useEffect, useState } from 'react';
import './ParticleBackground.css';

const ParticleBackground = () => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const createParticles = () => {
      const newParticles = [];
      const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'];
      
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
  }, []);

  return (
    <>
      {/* Dynamic Background */}
      <div className="dynamic-background">
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
