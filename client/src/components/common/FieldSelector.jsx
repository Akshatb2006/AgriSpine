// client/src/components/common/FieldSelector.jsx
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, MapPin, Wheat, Check } from 'lucide-react';
import { useField } from '../../contexts/FieldContext';

const FieldSelector = ({ variant = 'default', className = '' }) => {
  const { selectedField, fields, selectField, loading } = useField();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFieldSelect = (field) => {
    selectField(field);
    setIsOpen(false);
  };

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-10 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  if (!fields.length) {
    return (
      <div className={`text-sm text-gray-500 ${className}`}>
        No fields available
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50:bg-gray-700 transition-colors"
        >
          <MapPin size={16} className="text-green-600" />
          <span className="font-medium text-gray-900">
            {selectedField?.name || 'Select Field'}
          </span>
          <ChevronDown 
            size={16} 
            className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div className="p-2">
              {fields.map((field) => (
                <button
                  key={field.id}
                  onClick={() => handleFieldSelect(field)}
                  className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50:bg-gray-700 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100/20 p-2 rounded-lg">
                      <Wheat size={16} className="text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {field.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {field.area} acres • {field.crop || 'No crop'}
                      </div>
                    </div>
                  </div>
                  {selectedField?.id === field.id && (
                    <Check size={16} className="text-green-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700">
          Select Field
        </label>
      </div>
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-green-300:border-green-600 transition-colors"
      >
        <div className="flex items-center space-x-3">
          {selectedField ? (
            <>
              <div className="bg-green-100/20 p-2 rounded-lg">
                <Wheat size={20} className="text-green-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900 text-left">
                  {selectedField.name}
                </div>
                <div className="text-sm text-gray-500 text-left">
                  {selectedField.area} acres • {selectedField.crop || 'No crop set'}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-gray-100 p-2 rounded-lg">
                <MapPin size={20} className="text-gray-400" />
              </div>
              <div>
                <div className="font-medium text-gray-900 text-left">
                  Select a field
                </div>
                <div className="text-sm text-gray-500 text-left">
                  Choose from your {fields.length} field{fields.length !== 1 ? 's' : ''}
                </div>
              </div>
            </>
          )}
        </div>
        <ChevronDown 
          size={20} 
          className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          <div className="p-2">
            {fields.map((field) => (
              <button
                key={field.id}
                onClick={() => handleFieldSelect(field)}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50:bg-gray-700 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100/20 p-2 rounded-lg">
                    <Wheat size={16} className="text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {field.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {field.area} acres • {field.crop || 'No crop'} • {field.soilType || 'Unknown soil'}
                    </div>
                  </div>
                </div>
                {selectedField?.id === field.id && (
                  <Check size={16} className="text-green-600" />
                )}
              </button>
            ))}
          </div>
          
          <div className="border-t border-gray-200 p-3">
            <button className="w-full text-center text-sm text-green-600 hover:text-green-700:text-green-300 font-medium">
              Manage Fields
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FieldSelector;