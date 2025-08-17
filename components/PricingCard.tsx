"use client";
import React from "react";

const PricingCard: React.FC<PricingCardProps> = ({ 
  title, 
  price, 
  features, 
  popular = false, 
  buttonText = "Choose Plan" 
}) => (
  <div className={`bg-white rounded-lg shadow p-8 relative ${popular ? 'border-2 border-emerald-500 shadow-lg' : ''}`}>
    {popular && (
      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
        <span className="bg-emerald-500 text-white px-4 py-1 rounded-full text-sm font-medium">
          Most Popular
        </span>
      </div>
    )}
    <h3 className="text-2xl font-semibold mb-4">{title}</h3>
    <div className="text-4xl font-bold text-slate-800 mb-6">
      £{price}<span className="text-lg text-gray-500">/month</span>
    </div>
    <ul className="space-y-3 mb-8">
      {features.map((feature: string, index: number) => (
        <li key={index} className="flex items-center">
          <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
          {feature}
        </li>
      ))}
    </ul>
    <button className={`w-full py-3 rounded-md font-medium ${
      popular 
        ? 'bg-emerald-500 text-white hover:bg-emerald-600' 
        : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
    }`}>
      {buttonText}
    </button>
  </div>
);

export default PricingCard;