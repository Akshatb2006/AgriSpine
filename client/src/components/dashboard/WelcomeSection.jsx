// client/src/components/dashboard/WelcomeSection.jsx (Enhanced)
import React from 'react';
import { MapPin, TrendingUp, Droplets, Thermometer } from 'lucide-react';

const WelcomeSection = ({ selectedField }) => {
  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="bg-gradient-to-r from-green-600 to-blue-600 dark:from-green-700 dark:to-blue-700 rounded-xl p-6 text-white shadow-lg">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div className="mb-4 lg:mb-0">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            {selectedField ? `${selectedField.name} Overview` : 'Welcome to Your Farm Dashboard'}
          </h1>
          <p className="text-green-100 dark:text-green-200 text-sm sm:text-base">
            {currentDate} • {currentTime}
          </p>
          {selectedField && (
            <div className="mt-2 flex items-center space-x-4 text-sm">
              <span className="bg-white/20 px-2 py-1 rounded-full">
                {selectedField.area} acres
              </span>
              <span className="bg-white/20 px-2 py-1 rounded-full">
                {selectedField.crop || 'No crop set'}
              </span>
              {selectedField.soilType && (
                <span className="bg-white/20 px-2 py-1 rounded-full">
                  {selectedField.soilType} soil
                </span>
              )}
            </div>
          )}
        </div>
        
        {selectedField && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
              <Droplets size={20} className="mx-auto mb-1" />
              <div className="text-xs opacity-90">Moisture</div>
              <div className="font-bold">65%</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
              <Thermometer size={20} className="mx-auto mb-1" />
              <div className="text-xs opacity-90">Temp</div>
              <div className="font-bold">28°C</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
              <TrendingUp size={20} className="mx-auto mb-1" />
              <div className="text-xs opacity-90">Health</div>
              <div className="font-bold">Good</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
              <MapPin size={20} className="mx-auto mb-1" />
              <div className="text-xs opacity-90">Status</div>
              <div className="font-bold">Active</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WelcomeSection;