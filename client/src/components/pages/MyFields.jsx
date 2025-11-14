// client/src/components/pages/MyFields.jsx (Updated for basic fields)
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Eye,
  BarChart3,
  Droplets,
  Thermometer,
  Loader2,
  MapPin
} from 'lucide-react';
import { fieldsAPI } from '../../services/api';

const MyFields = () => {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedField, setSelectedField] = useState(null);

  useEffect(() => {
    fetchFields();
  }, []);

  const fetchFields = async () => {
    try {
      const response = await fieldsAPI.getAllFields();
      if (response.data.success) {
        setFields(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching fields:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalArea = () => {
    return fields.reduce((sum, field) => sum + (field.area || 0), 0).toFixed(2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 size={32} className="text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your fields...</p>
        </div>
      </div>
    );
  }

  if (fields.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
            <MapPin size={32} className="text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No Fields Found
          </h2>
          <p className="text-gray-600 mb-6">
            It looks like you haven't added any fields yet. Complete the onboarding process to add your fields.
          </p>
          <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
            Add Your First Field
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Fields</h1>
          <p className="text-gray-600">
            Manage and monitor your {fields.length} field{fields.length !== 1 ? 's' : ''} 
            ({calculateTotalArea()} acres total)
          </p>
        </div>
        
        <button className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          <Plus size={16} />
          <span>Add Field</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-green-100/20 rounded-lg p-3">
              <MapPin className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Fields</p>
              <p className="text-2xl font-bold text-gray-900">{fields.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-blue-100/20 rounded-lg p-3">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Area</p>
              <p className="text-2xl font-bold text-gray-900">{calculateTotalArea()}</p>
              <p className="text-sm text-gray-500">acres</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-yellow-100/20 rounded-lg p-3">
              <Droplets className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Fields</p>
              <p className="text-2xl font-bold text-gray-900">{fields.length}</p>
              <p className="text-sm text-gray-500">monitoring</p>
            </div>
          </div>
        </div>
      </div>

      {/* Fields Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {field.name}
              </h3>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setSelectedField(field)}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <Eye size={16} />
                </button>
                <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                  <Edit3 size={16} />
                </button>
                <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Area</p>
                <p className="font-medium text-gray-900">{field.area} acres</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Crop</p>
                <p className="font-medium text-gray-900 capitalize">
                  {field.crop || 'Not specified'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Soil Type</p>
                <p className="font-medium text-gray-900">
                  {field.soilType || 'Not specified'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span className="inline-block px-2 py-1 bg-green-100/20 text-green-700 rounded-full text-xs font-medium">
                  Active
                </span>
              </div>
            </div>

            {/* Mock field metrics */}
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Recent Metrics</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="bg-blue-100/20 rounded-lg p-2 mb-1">
                    <Droplets className="w-4 h-4 text-blue-600 mx-auto" />
                  </div>
                  <p className="text-xs text-gray-600">Moisture</p>
                  <p className="text-sm font-medium text-gray-900">65%</p>
                </div>
                <div className="text-center">
                  <div className="bg-orange-100/20 rounded-lg p-2 mb-1">
                    <Thermometer className="w-4 h-4 text-orange-600 mx-auto" />
                  </div>
                  <p className="text-xs text-gray-600">Temp</p>
                  <p className="text-sm font-medium text-gray-900">28°C</p>
                </div>
                <div className="text-center">
                  <div className="bg-green-100/20 rounded-lg p-2 mb-1">
                    <BarChart3 className="w-4 h-4 text-green-600 mx-auto" />
                  </div>
                  <p className="text-xs text-gray-600">Health</p>
                  <p className="text-sm font-medium text-gray-900">Good</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Field Details Modal */}
      {selectedField && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedField.name}
              </h2>
              <button
                onClick={() => setSelectedField(null)}
                className="text-gray-400 hover:text-gray-600:text-gray-300"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Field Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Area:</span>
                    <span className="font-medium text-gray-900">{selectedField.area} acres</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Crop:</span>
                    <span className="font-medium text-gray-900 capitalize">
                      {selectedField.crop || 'Not specified'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Soil Type:</span>
                    <span className="font-medium text-gray-900">
                      {selectedField.soilType || 'Not specified'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Irrigation:</span>
                    <span className="font-medium text-gray-900">
                      {selectedField.irrigationType || 'Not specified'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Current Conditions</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Soil Moisture:</span>
                    <span className="font-medium text-gray-900">65%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Temperature:</span>
                    <span className="font-medium text-gray-900">28°C</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Health Status:</span>
                    <span className="font-medium text-green-600">Good</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Updated:</span>
                    <span className="font-medium text-gray-900">2 hours ago</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors">
                View Analytics
              </button>
              <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors">
                Create Prediction
              </button>
              <button className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium transition-colors">
                Edit Field
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyFields;