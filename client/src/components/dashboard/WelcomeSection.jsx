// client/src/components/dashboard/WelcomeSection.jsx
import React from 'react';

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
    <div className="bg-black dark:bg-white rounded p-6 text-white dark:text-black">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div className="mb-4 lg:mb-0">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            {selectedField ? `${selectedField.name} Overview` : 'Welcome to Your Farm Dashboard'}
          </h1>
          <p className="text-white opacity-90 text-sm sm:text-base">
            {currentDate} • {currentTime}
          </p>
          {selectedField && (
            <div className="mt-2 flex items-center space-x-4 text-sm">
              <span className="bg-white bg-opacity-20 px-2 py-1 rounded">
                {selectedField.area} acres
              </span>
              <span className="bg-white bg-opacity-20 px-2 py-1 rounded">
                {selectedField.crop || 'No crop set'}
              </span>
              {selectedField.soilType && (
                <span className="bg-white bg-opacity-20 px-2 py-1 rounded">
                  {selectedField.soilType} soil
                </span>
              )}
            </div>
          )}
        </div>
        
        {selectedField && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white bg-opacity-20 rounded p-3 text-center">
              <div className="text-2xl mb-1">💧</div>
              <div className="text-xs opacity-90">Moisture</div>
              <div className="font-bold">65%</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded p-3 text-center">
              <div className="text-2xl mb-1">🌡️</div>
              <div className="text-xs opacity-90">Temp</div>
              <div className="font-bold">28°C</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded p-3 text-center">
              <div className="text-2xl mb-1">📈</div>
              <div className="text-xs opacity-90">Health</div>
              <div className="font-bold">Good</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded p-3 text-center">
              <div className="text-2xl mb-1">📍</div>
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