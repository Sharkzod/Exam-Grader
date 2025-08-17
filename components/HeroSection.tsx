"use client";
import Link from "next/link";
import { useState } from "react";

export const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="bg-gradient-to-br from-blue-800 to-blue-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Revolutionizing<br />
            <span className="text-blue-300">Exam Assessment</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            AI-powered smart marking system that delivers accurate, consistent, 
            and instant grading for educational institutions worldwide.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-2xl mx-auto">
            <Link
              href="/demo"
              className="bg-white hover:bg-gray-100 text-blue-800 px-8 py-4 rounded-md font-medium text-lg shadow-lg"
            >
              Request a Demo
            </Link>
            <Link
              href="/signup"
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-md font-medium text-lg shadow-lg"
            >
              Get Started
            </Link>
          </div>

          <div className="mt-12 max-w-4xl mx-auto bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold mb-4">Experience the Future of Grading</h3>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Enter sample answer to grade..."
                  className="w-full px-4 py-3 text-gray-900 rounded-md focus:outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md font-medium">
                Analyze Answer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};