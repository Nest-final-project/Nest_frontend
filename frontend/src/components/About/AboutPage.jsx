import React from 'react';
import HeroSection from './sections/HeroSection';
import BrandStorySection from './sections/BrandStorySection';
import ServiceFeatures from './sections/ServiceFeatures';
import HowItWorks from './sections/HowItWorks';
import StatisticsSection from './sections/StatisticsSection';
import SuccessStories from './sections/SuccessStories';
import CallToAction from './sections/CallToAction';
import './AboutPage.css';

const AboutPage = () => {
  return (
    <div className="about-page">
      <HeroSection />
      <BrandStorySection />
      <ServiceFeatures />
      <HowItWorks />
      <StatisticsSection />
      <SuccessStories />
      <CallToAction />
    </div>
  );
};

export default AboutPage;
