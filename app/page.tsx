import React from 'react';
import { HeroSection } from '@/components/HeroSection';
import { FeaturesSection } from '@/components/FeatureSection';
import { StatsSection } from '@/components/StatsSection';
import Link from 'next/link';

const HomePage: React.FC<NavigationBarProps> = ({ setCurrentPage }) => (
  <div className="min-h-screen bg-gray-50">
    <HeroSection setCurrentPage={setCurrentPage} />
    <FeaturesSection />
    <StatsSection />
    
    <div className="bg-blue-800 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          Ready to Transform Your Grading Process?
        </h2>
        <p className="text-xl text-gray-300 mb-8">
          Join hundreds of educators using our AI-powered system for faster, more accurate exam marking.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/demo"
            className="inline-block bg-white hover:bg-gray-100 text-blue-800 px-8 py-3 rounded-md text-lg font-medium transition-colors"
          >
            Request a Demo
          </Link>
          <Link
            href="/signup"
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-md text-lg font-medium transition-colors"
          >
            Get Started
          </Link>
        </div>
      </div>
    </div>
  </div>
);

export default HomePage;