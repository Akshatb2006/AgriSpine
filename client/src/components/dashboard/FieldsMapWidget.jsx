import React, { useState } from 'react';
import { Star, Maximize2, AlertTriangle, Eye, X } from 'lucide-react';

const FieldsMapWidget = () => {
  const [selectedField, setSelectedField] = useState(null);

  const fields = [
    { 
      id: 1, 
      name: 'Field 1', 
      crop: 'Wheat', 
      position: { top: '30%', left: '20%' }, 
      color: '#dc2626', 
      status: 'normal',
      area: '12.5 ha',
      yield: '5,200 kg/ha',
      moisture: '65%'
    },
    { 
      id: 2, 
      name: 'Field 2', 
      crop: 'Corn', 
      position: { top: '45%', right: '25%' }, 
      color: '#f59e0b', 
      status: 'normal',
      area: '8.3 ha',
      yield: '4,800 kg/ha',
      moisture: '58%'
    },
    { 
      id: 3, 
      name: 'Field 3', 
      crop: 'Soybeans', 
      position: { bottom: '25%', left: '30%' }, 
      color: '#22c55e', 
      status: 'warning',
      area: '15.2 ha',
      yield: '3,100 kg/ha',
      moisture: '45%'
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          My Fields
          <Star className="ml-2 w-4 h-4 text-gray-400" />
        </h2>
        <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
          <Maximize2 size={16} />
        </button>
      </div>

      <div className="relative">
        <div 
          className="w-full h-64 sm:h-80 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/20 dark:to-green-800/20 rounded-lg relative overflow-hidden"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2316a34a' fill-opacity='0.1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        >
          {/* Farm structures */}
          <div className="absolute top-4 left-4 w-3 h-3 bg-gray-600 dark:bg-gray-400 rounded-sm"></div>
          <div className="absolute top-4 left-8 w-2 h-2 bg-gray-500 dark:bg-gray-500 rounded-sm"></div>
          
          {/* Roads */}
          <div className="absolute top-0 left-16 w-1 h-full bg-gray-300 dark:bg-gray-600 opacity-50"></div>
          <div className="absolute top-20 left-0 w-full h-1 bg-gray-300 dark:bg-gray-600 opacity-50"></div>

          {/* Fields */}
          {fields.map((field) => (
            <div
              key={field.id}
              className="absolute cursor-pointer transform transition-all duration-200 hover:scale-105"
              style={field.position}
              onClick={() => setSelectedField(field)}
            >
              <div 
                className="w-16 h-12 sm:w-20 sm:h-16 rounded-lg border-2 border-white shadow-lg flex items-center justify-center relative"
                style={{ backgroundColor: field.color }}
              >
                {field.status === 'warning' && (
                  <AlertTriangle 
                    size={16} 
                    className="absolute -top-2 -right-2 text-red-500 bg-white rounded-full p-0.5" 
                  />
                )}
                <span className="text-white text-xs font-bold">{field.id}</span>
              </div>
              <div className="mt-1 text-center">
                <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {field.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  ({field.crop})
                </div>
              </div>
            </div>
          ))}

          {/* Legend */}
          <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg p-3 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              Field Status
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-400 rounded"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">Pest/Disease</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-400 rounded"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">Pest/Disease</span>
              </div>
            </div>
          </div>

          {/* Control buttons */}
          <div className="absolute top-4 right-4 flex flex-col space-y-2">
            <button className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
              <Eye size={16} />
            </button>
          </div>
        </div>

        {/* Field Details Popup */}
        {selectedField && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 rounded-lg">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedField.name}
                </h3>
                <button
                  onClick={() => setSelectedField(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Crop:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{selectedField.crop}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Area:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{selectedField.area}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Yield:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{selectedField.yield}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Soil Moisture:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{selectedField.moisture}</span>
                </div>
                {selectedField.status === 'warning' && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle size={16} className="text-red-500" />
                      <span className="text-red-700 dark:text-red-300 text-sm font-medium">
                        Water stress detected
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FieldsMapWidget;