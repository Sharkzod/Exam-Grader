"use client";
import React, { useState } from "react";
import { Menu, X } from "lucide-react";

const NavigationBar: React.FC<NavigationBarProps> = ({ currentPage, setCurrentPage }) => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div
              className="text-2xl font-bold text-slate-800 cursor-pointer"
              onClick={() => setCurrentPage('home')}
            >
              ContractFlow
            </div>
            <div className="hidden md:ml-10 md:flex space-x-8">
              <button 
                onClick={() => setCurrentPage('jobs')}
                className="text-gray-700 hover:text-slate-800 px-3 py-2 text-sm font-medium"
              >
                Find Jobs
              </button>
              <button 
                onClick={() => setCurrentPage('pricing')}
                className="text-gray-700 hover:text-slate-800 px-3 py-2 text-sm font-medium"
              >
                Pricing
              </button>
              <button 
                onClick={() => setCurrentPage('about')}
                className="text-gray-700 hover:text-slate-800 px-3 py-2 text-sm font-medium"
              >
                About
              </button>
            </div>
          </div>
                   
          <div className="hidden md:flex items-center space-x-4">
            <button 
              onClick={() => setCurrentPage('login')}
              className="text-gray-700 hover:text-slate-800 px-3 py-2 text-sm font-medium"
            >
              Log In
            </button>
            <button 
              onClick={() => setCurrentPage('register')}
              className="bg-slate-800 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-700"
            >
              Sign Up
            </button>
          </div>
           
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <button 
              onClick={() => {setCurrentPage('jobs'); setIsMenuOpen(false)}}
              className="block px-3 py-2 text-gray-700 hover:text-slate-800"
            >
              Find Jobs
            </button>
            <button 
              onClick={() => {setCurrentPage('pricing'); setIsMenuOpen(false)}}
              className="block px-3 py-2 text-gray-700 hover:text-slate-800"
            >
              Pricing
            </button>
            <button 
              onClick={() => {setCurrentPage('login'); setIsMenuOpen(false)}}
              className="block px-3 py-2 text-gray-700 hover:text-slate-800"
            >
              Log In
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavigationBar;