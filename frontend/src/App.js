import React, { useState } from 'react';
import './App.css';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import StatsSection from './components/StatsSection';
import MentorSection from './components/MentorSection';
import CTASection from './components/CTASection';
import ParticleBackground from './components/ParticleBackground';

const App = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
      <div className="app">
        <ParticleBackground />
        <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
        <main className="main-content">
          <HeroSection />
          <StatsSection />
          <MentorSection />
          <CTASection />
        </main>
      </div>
  );
};

export default App;
