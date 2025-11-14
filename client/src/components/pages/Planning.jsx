import React from 'react';
import { Calendar, Brain } from 'lucide-react';

const Planning = () => {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
          <div className="flex space-x-2">
            <Calendar size={24} className="text-gray-400" />
            <Brain size={24} className="text-gray-400" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-black dark:text-white mb-2">
          AI Planning Assistant
        </h2>
        <p className="text-black dark:text-white opacity-70 mb-6">
          Smart farming recommendations and task scheduling powered by AI. This section will help you optimize your farming operations.
        </p>
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-left max-w-md">
          <h3 className="font-medium text-green-900 dark:text-green-100 mb-2">AI Features:</h3>
          <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
            <li>• Automated irrigation scheduling</li>
            <li>• Fertilizer application recommendations</li>
            <li>• Pest and disease prevention plans</li>
            <li>• Optimal harvest time predictions</li>
            <li>• Weather-based task adjustments</li>
            <li>• Resource optimization suggestions</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Planning;