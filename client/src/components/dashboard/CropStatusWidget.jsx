import React from 'react';
import { Star, Droplets, AlertTriangle } from 'lucide-react';

const CropStatusWidget = () => {
  const crops = [
    {
      crop: 'Corn',
      status: 'Monitoring',
      forecast: '5,200 kgha ± 300',
      color: 'bg-blue-100/30 text-blue-700'
    },
    {
      crop: 'Monitoring',
      status: '5,200 kgha ± 307',
      forecast: 'Consider irrigation',
      color: 'bg-blue-100/30 text-blue-700'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          Crop
          <Star className="ml-2 w-4 h-4 text-gray-400" />
        </h2>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-sm font-medium text-gray-600 border-b border-gray-200 pb-2">
          <span>Corp</span>
          <span>Status</span>
          <span>Latest Forecast</span>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-4 items-center py-2">
            <span className="text-gray-900 font-medium">Corn</span>
            <span className="px-2 py-1 bg-blue-100/30 text-blue-700 rounded-full text-xs text-center">
              Monitoring
            </span>
            <span className="text-gray-900 text-sm">5,200 kgha ± 300</span>
          </div>

          <div className="grid grid-cols-3 gap-4 items-center py-2">
            <span className="text-gray-900 font-medium">Monitoring</span>
            <span className="text-gray-900 text-sm">5,200 kgha ± 307</span>
            <span className="text-orange-600 text-sm flex items-center">
              <Droplets size={14} className="mr-1" />
              Consider irrigation
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropStatusWidget;