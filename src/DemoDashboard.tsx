import React from 'react';
import dashboardImg from '../assets/dashboard.jpg';

export default function DemoDashboard() {
  return (
    <div className="min-h-screen bg-[#13151A] flex items-center justify-center font-sans overflow-hidden p-8">
      <img 
        src={dashboardImg} 
        alt="Identical Dashboard Mockup" 
        className="max-w-7xl w-full h-auto shadow-[0_0_100px_rgba(0,0,0,0.8)] rounded-3xl"
      />
    </div>
  );
}
