import React from 'react';
import { Hero } from '../components/home/Hero';
import { Statistics } from '../components/home/Statistics';
import { ServiceCategories } from '../components/home/ServiceCategories';
import { WantToBecomeTutor } from '../components/home/WantToBecomeTutor';
import { StudentWorkflow } from '../components/home/StudentWorkflow';
import { TutoringMethod } from '../components/home/TutoringMethod';
import { TutorWorkflow } from '../components/home/TutorWorkflow';
import { Testimonials } from '../components/home/Testimonials';
import { AffiliateSection } from '../components/home/AffiliateSection';
import { WhyChooseUs } from '../components/home/WhyChooseUs';
import { AppDownload } from '../components/home/AppDownload';
import { FeaturedOn } from '../components/home/FeaturedOn';

export const Home: React.FC = () => {
  return (
    <div className="space-y-0">
      <Hero />
      <Statistics />
      <ServiceCategories />
      <WantToBecomeTutor />
      <StudentWorkflow />
      <TutoringMethod />
      <TutorWorkflow />
      <Testimonials />
      <AffiliateSection />
      <WhyChooseUs />
      <AppDownload />
      <FeaturedOn />
    </div>
  );
};
