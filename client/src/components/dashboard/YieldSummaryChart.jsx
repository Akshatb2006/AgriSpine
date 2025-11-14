import React from 'react';
import { Star, TrendingUp } from 'lucide-react';

const YieldSummaryChart = () => {
  const yieldData = [
    { period: '00', value: 5 },
    { period: '22', value: 8 },
    { period: '30', value: 12 },
    { period: '70', value: 18 },
    { period: '130', value: 20 }
  ];

  const maxValue = Math.max(...yieldData.map(d => d.value));

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          Yield Summary
          <Star className="ml-2 w-4 h-4 text-gray-400" />
        </h2>
        <div className="bg-green-100/30 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
          +8% YOC
        </div>
      </div>

      <div className="space-y-4">
        {/* Chart */}
        <div className="h-32 flex items-end space-x-2">
          {yieldData.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="w-full bg-gray-200 rounded-t-sm relative overflow-hidden">
                <div 
                  className="bg-gradient-to-t from-green-500 to-green-400 rounded-t-sm transition-all duration-500 ease-out"
                  style={{ 
                    height: `${(item.value / maxValue) * 100}%`,
                    minHeight: '8px'
                  }}
                ></div>
              </div>
              <span className="text-xs text-gray-500 mt-1">
                {item.period}
              </span>
            </div>
          ))}
        </div>

        {/* Chart values */}
        <div className="flex justify-between text-xs text-gray-500">
          <span>0</span>
          <span>5</span>
          <span>10</span>
          <span>15</span>
          <span>20</span>
        </div>

        {/* Performance indicator */}
        <div className="flex items-center justify-center space-x-2 p-3 bg-green-50/20 rounded-lg">
          <TrendingUp size={16} className="text-green-600" />
          <span className="text-green-700 text-sm font-medium">
            Performance trending upward
          </span>
        </div>
      </div>
    </div>
  );
};

export default YieldSummaryChart;