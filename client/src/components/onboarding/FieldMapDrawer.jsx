// client/src/components/onboarding/FieldMapDrawer.jsx
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  X, 
  MapPin,
  Crop,
  Info
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const FieldMapDrawer = ({ center, fields, onFieldsUpdate }) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState([]);
  const [editingField, setEditingField] = useState(null);
  const [showFieldForm, setShowFieldForm] = useState(false);
  const [fieldForm, setFieldForm] = useState({
    name: '',
    cropType: '',
    soilType: '',
    irrigationType: '',
    area: 0
  });

  const defaultCenter = center || [20.5937, 78.9629]; // Default to center of India

  const cropOptions = [
    'Rice', 'Wheat', 'Corn', 'Soybeans', 'Cotton', 
    'Sugarcane', 'Tomatoes', 'Potatoes', 'Onions', 'Chilies'
  ];

  const soilTypes = [
    'Alluvial', 'Black Cotton', 'Red', 'Laterite', 'Desert', 'Mountain'
  ];

  const irrigationTypes = [
    'Drip Irrigation', 'Sprinkler System', 'Flood Irrigation', 
    'Rain-fed', 'Canal Irrigation', 'Borewell/Tubewell'
  ];

  // Calculate area of polygon using shoelace formula
  const calculateArea = (coordinates) => {
    if (coordinates.length < 3) return 0;
    
    let area = 0;
    for (let i = 0; i < coordinates.length; i++) {
      const j = (i + 1) % coordinates.length;
      area += coordinates[i][0] * coordinates[j][1];
      area -= coordinates[j][0] * coordinates[i][1];
    }
    area = Math.abs(area) / 2;
    
    // Convert from degrees to square meters (rough approximation)
    const areaInSqMeters = area * 111320 * 111320;
    const areaInAcres = areaInSqMeters / 4047; // 1 acre = 4047 sq meters
    
    return Math.round(areaInAcres * 100) / 100;
  };

  // Component for handling map clicks
  const MapEvents = () => {
    useMapEvents({
      click: (e) => {
        if (isDrawing) {
          const newPoint = [e.latlng.lat, e.latlng.lng];
          setCurrentPoints(prev => [...prev, newPoint]);
        }
      }
    });
    return null;
  };

  // Component for centering map
  const MapCenter = ({ center }) => {
    const map = useMap();
    
    useEffect(() => {
      if (center) {
        map.setView(center, 15);
      }
    }, [center, map]);
    
    return null;
  };

  const startDrawing = () => {
    setIsDrawing(true);
    setCurrentPoints([]);
  };

  const cancelDrawing = () => {
    setIsDrawing(false);
    setCurrentPoints([]);
  };

  const completeField = () => {
    if (currentPoints.length < 3) {
      alert('Please draw at least 3 points to create a field');
      return;
    }

    const area = calculateArea(currentPoints);
    setFieldForm({
      name: `Field ${fields.length + 1}`,
      cropType: '',
      soilType: '',
      irrigationType: '',
      area: area
    });
    setShowFieldForm(true);
  };

  const saveField = () => {
    const newField = {
      id: Date.now(),
      ...fieldForm,
      coordinates: currentPoints,
      area: calculateArea(currentPoints)
    };

    if (editingField) {
      const updatedFields = fields.map(field => 
        field.id === editingField.id ? { ...newField, id: editingField.id } : field
      );
      onFieldsUpdate(updatedFields);
      setEditingField(null);
    } else {
      onFieldsUpdate([...fields, newField]);
    }

    setIsDrawing(false);
    setCurrentPoints([]);
    setShowFieldForm(false);
    setFieldForm({
      name: '',
      cropType: '',
      soilType: '',
      irrigationType: '',
      area: 0
    });
  };

  const deleteField = (fieldId) => {
    const updatedFields = fields.filter(field => field.id !== fieldId);
    onFieldsUpdate(updatedFields);
  };

  const editField = (field) => {
    setEditingField(field);
    setCurrentPoints(field.coordinates);
    setFieldForm({
      name: field.name,
      cropType: field.cropType,
      soilType: field.soilType,
      irrigationType: field.irrigationType,
      area: field.area
    });
    setShowFieldForm(true);
    setIsDrawing(true);
  };

  const getFieldColor = (index) => {
    const colors = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];
    return colors[index % colors.length];
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-2 mb-4">
        {!isDrawing ? (
          <button
            onClick={startDrawing}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus size={16} />
            <span>Draw New Field</span>
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={completeField}
              disabled={currentPoints.length < 3}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Save size={16} />
              <span>Complete Field</span>
            </button>
            <button
              onClick={cancelDrawing}
              className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <X size={16} />
              <span>Cancel</span>
            </button>
          </div>
        )}
      </div>

      {/* Instructions */}
      {isDrawing && (
        <div className="bg-blue-50/20 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Info size={16} className="text-blue-600" />
            <span className="text-blue-700 font-medium">Drawing Mode</span>
          </div>
          <p className="text-blue-600 text-sm mt-1">
            Click on the map to add points and outline your field. You need at least 3 points. 
            Current points: {currentPoints.length}
          </p>
        </div>
      )}

      {/* Map */}
      <div className="h-96 w-full rounded-lg overflow-hidden border border-gray-200">
        <MapContainer
          center={defaultCenter}
          zoom={15}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapCenter center={defaultCenter} />
          <MapEvents />

          {/* Current location marker */}
          {center && (
            <Marker position={center}>
              <Popup>Your current location</Popup>
            </Marker>
          )}

          {/* Existing fields */}
          {fields.map((field, index) => (
            <Polygon
              key={field.id}
              positions={field.coordinates}
              color={getFieldColor(index)}
              fillColor={getFieldColor(index)}
              fillOpacity={0.3}
            >
              <Popup>
                <div className="space-y-2">
                  <h3 className="font-semibold">{field.name}</h3>
                  <p className="text-sm">Crop: {field.cropType || 'Not specified'}</p>
                  <p className="text-sm">Area: {field.area} acres</p>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => editField(field)}
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                    >
                      <Edit3 size={12} />
                      <span className="text-xs">Edit</span>
                    </button>
                    <button
                      onClick={() => deleteField(field.id)}
                      className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={12} />
                      <span className="text-xs">Delete</span>
                    </button>
                  </div>
                </div>
              </Popup>
            </Polygon>
          ))}

          {/* Current drawing polygon */}
          {currentPoints.length >= 3 && (
            <Polygon
              positions={currentPoints}
              color="#6366f1"
              fillColor="#6366f1"
              fillOpacity={0.2}
            />
          )}

          {/* Current drawing points */}
          {currentPoints.map((point, index) => (
            <Marker
              key={index}
              position={point}
              icon={L.divIcon({
                className: 'custom-marker',
                html: `<div style="background-color: #6366f1; width: 10px; height: 10px; border-radius: 50%; border: 2px solid white;"></div>`,
                iconSize: [10, 10],
                iconAnchor: [5, 5]
              })}
            />
          ))}
        </MapContainer>
      </div>

      {/* Fields Summary */}
      {fields.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Your Fields</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="bg-white rounded-lg p-3 border border-gray-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{field.name}</h4>
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: getFieldColor(index) }}
                  ></div>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>Area: {field.area} acres</p>
                  <p>Crop: {field.cropType || 'Not specified'}</p>
                  <p>Soil: {field.soilType || 'Not specified'}</p>
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => editField(field)}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-xs"
                  >
                    <Edit3 size={12} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => deleteField(field.id)}
                    className="flex items-center space-x-1 text-red-600 hover:text-red-700 text-xs"
                  >
                    <Trash2 size={12} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-900">
              Total Area: {fields.reduce((sum, field) => sum + field.area, 0).toFixed(2)} acres
            </p>
          </div>
        </div>
      )}

      {/* Field Form Modal */}
      {showFieldForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingField ? 'Edit Field' : 'Field Details'}
              </h3>
              <button
                onClick={() => {
                  setShowFieldForm(false);
                  if (!editingField) {
                    cancelDrawing();
                  }
                }}
                className="text-gray-400 hover:text-gray-600:text-gray-300"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Field Name *
                </label>
                <input
                  type="text"
                  value={fieldForm.name}
                  onChange={(e) => setFieldForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Crop Type
                </label>
                <select
                  value={fieldForm.cropType}
                  onChange={(e) => setFieldForm(prev => ({ ...prev, cropType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                >
                  <option value="">Select crop type</option>
                  {cropOptions.map(crop => (
                    <option key={crop} value={crop}>{crop}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Soil Type
                </label>
                <select
                  value={fieldForm.soilType}
                  onChange={(e) => setFieldForm(prev => ({ ...prev, soilType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                >
                  <option value="">Select soil type</option>
                  {soilTypes.map(soil => (
                    <option key={soil} value={soil}>{soil}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Irrigation Type
                </label>
                <select
                  value={fieldForm.irrigationType}
                  onChange={(e) => setFieldForm(prev => ({ ...prev, irrigationType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                >
                  <option value="">Select irrigation type</option>
                  {irrigationTypes.map(irrigation => (
                    <option key={irrigation} value={irrigation}>{irrigation}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Calculated Area
                </label>
                <input
                  type="text"
                  value={`${fieldForm.area} acres`}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={saveField}
                disabled={!fieldForm.name.trim()}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                {editingField ? 'Update Field' : 'Save Field'}
              </button>
              <button
                onClick={() => {
                  setShowFieldForm(false);
                  if (!editingField) {
                    cancelDrawing();
                  }
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FieldMapDrawer;