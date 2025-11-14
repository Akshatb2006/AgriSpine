// client/src/components/onboarding/Onboarding.jsx (Enhanced with more field details)
import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  User, 
  Wheat,
  CheckCircle,
  Loader2,
  Plus,
  Trash2,
  Calendar,
  Droplet,
  TestTube
} from 'lucide-react';
import { authAPI } from '../../services/api';

const Onboarding = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Step 1: Personal Information
    farmingExperience: '',
    farmSize: '',
    primaryCrops: [],
    farmingMethod: 'conventional',
    
    // Step 2: Location
    location: {
      state: '',
      district: '',
      village: '',
      coordinates: null
    },
    
    // Step 3: Enhanced Fields with detailed information
    fields: []
  });

  const [errors, setErrors] = useState({});

  const farmingExperienceOptions = [
    { value: '0-2', label: '0-2 years (Beginner)' },
    { value: '3-5', label: '3-5 years' },
    { value: '6-10', label: '6-10 years' },
    { value: '11-20', label: '11-20 years' },
    { value: '20+', label: '20+ years (Expert)' }
  ];

  const cropOptions = [
    { value: 'rice', label: 'Rice', icon: '🌾' },
    { value: 'wheat', label: 'Wheat', icon: '🌾' },
    { value: 'corn', label: 'Corn/Maize', icon: '🌽' },
    { value: 'soybeans', label: 'Soybeans', icon: '🫘' },
    { value: 'cotton', label: 'Cotton', icon: '🌱' },
    { value: 'sugarcane', label: 'Sugarcane', icon: '🎋' },
    { value: 'tomatoes', label: 'Tomatoes', icon: '🍅' },
    { value: 'potatoes', label: 'Potatoes', icon: '🥔' },
    { value: 'onions', label: 'Onions', icon: '🧅' },
    { value: 'chilies', label: 'Chilies', icon: '🌶️' }
  ];

  const soilTypes = [
    'Alluvial', 'Black Cotton', 'Red', 'Laterite', 'Desert', 'Mountain'
  ];

  const irrigationTypes = [
    'Drip Irrigation', 'Sprinkler System', 'Flood Irrigation', 
    'Rain-fed', 'Canal Irrigation', 'Borewell/Tubewell'
  ];

  const growthStages = [
    { value: 'not_planted', label: 'Not Yet Planted' },
    { value: 'land_preparation', label: 'Land Preparation' },
    { value: 'sowing', label: 'Sowing/Planting' },
    { value: 'germination', label: 'Germination' },
    { value: 'vegetative', label: 'Vegetative Growth' },
    { value: 'flowering', label: 'Flowering' },
    { value: 'fruiting', label: 'Fruiting/Grain Filling' },
    { value: 'maturity', label: 'Maturity' },
    { value: 'harvest_ready', label: 'Ready for Harvest' }
  ];

  const farmingMethods = [
    { value: 'conventional', label: 'Conventional', description: 'Standard farming with chemical inputs' },
    { value: 'organic', label: 'Organic', description: 'Natural methods without synthetic chemicals' },
    { value: 'integrated', label: 'Integrated (IPM)', description: 'Balanced approach combining methods' }
  ];

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            location: {
              ...prev.location,
              coordinates: [position.coords.longitude, position.coords.latitude]
            }
          }));
        },
        (error) => {
          console.warn('Geolocation error:', error);
        }
      );
    }
  }, []);

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleCropToggle = (crop) => {
    setFormData(prev => ({
      ...prev,
      primaryCrops: prev.primaryCrops.includes(crop)
        ? prev.primaryCrops.filter(c => c !== crop)
        : [...prev.primaryCrops, crop]
    }));
  };

  const addField = () => {
    const newField = {
      id: Date.now(),
      name: `Field ${formData.fields.length + 1}`,
      area: '',
      cropType: '',
      soilType: '',
      irrigationType: '',
      // Enhanced field data
      growthStage: 'not_planted',
      plantingDate: '',
      previousYield: '',
      soilHealth: {
        pH: '',
        nitrogen: '',
        phosphorus: '',
        potassium: '',
        organicMatter: ''
      },
      knownIssues: '',
      waterAvailability: 'adequate'
    };
    setFormData(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }));
  };

  const updateField = (fieldId, fieldData) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.map(field => 
        field.id === fieldId ? { ...field, ...fieldData } : field
      )
    }));
  };

  const updateFieldSoilHealth = (fieldId, soilHealthData) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.map(field => 
        field.id === fieldId 
          ? { ...field, soilHealth: { ...field.soilHealth, ...soilHealthData } }
          : field
      )
    }));
  };

  const removeField = (fieldId) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.filter(field => field.id !== fieldId)
    }));
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!formData.farmingExperience) newErrors.farmingExperience = 'Please select your farming experience';
        if (!formData.farmSize) newErrors.farmSize = 'Farm size is required';
        if (formData.primaryCrops.length === 0) newErrors.primaryCrops = 'Please select at least one crop';
        break;
      
      case 2:
        if (!formData.location.state) newErrors['location.state'] = 'State is required';
        if (!formData.location.district) newErrors['location.district'] = 'District is required';
        break;
      
      case 3:
        if (formData.fields.length === 0) {
          newErrors.fields = 'Please add at least one field';
        } else {
          formData.fields.forEach((field) => {
            if (!field.name.trim()) newErrors[`field_${field.id}_name`] = 'Field name is required';
            if (!field.area || field.area <= 0) newErrors[`field_${field.id}_area`] = 'Field area is required';
            if (!field.cropType) newErrors[`field_${field.id}_crop`] = 'Please select a crop type';
          });
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleComplete = async () => {
    if (!validateStep(3)) return;

    setLoading(true);
    try {
      // Complete onboarding with enhanced data
      await authAPI.completeOnboarding(formData);
      
      // Trigger initialization (will be handled by parent component)
      onComplete(formData);
    } catch (error) {
      console.error('Onboarding completion error:', error);
      setErrors({ submit: 'Failed to complete onboarding. Please try again.' });
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((step) => (
        <React.Fragment key={step}>
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
              step <= currentStep
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-500'
            }`}
          >
            {step < currentStep ? (
              <CheckCircle size={20} />
            ) : (
              step
            )}
          </div>
          {step < 3 && (
            <div
              className={`w-12 h-1 mx-2 transition-colors ${
                step < currentStep
                  ? 'bg-green-600'
                  : 'bg-gray-200'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <User className="w-12 h-12 text-green-600 mx-auto mb-2" />
        <h2 className="text-2xl font-bold text-gray-900">Tell us about yourself</h2>
        <p className="text-gray-600">Help us understand your farming background</p>
      </div>

      {/* Farming Experience */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Farming Experience *
        </label>
        <select
          value={formData.farmingExperience}
          onChange={(e) => handleInputChange('farmingExperience', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="">Select your experience level</option>
          {farmingExperienceOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.farmingExperience && (
          <p className="mt-1 text-sm text-red-600">{errors.farmingExperience}</p>
        )}
      </div>

      {/* Farm Size */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Total Farm Size (in acres) *
        </label>
        <input
          type="number"
          step="0.1"
          placeholder="e.g., 5.5"
          value={formData.farmSize}
          onChange={(e) => handleInputChange('farmSize', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
        {errors.farmSize && (
          <p className="mt-1 text-sm text-red-600">{errors.farmSize}</p>
        )}
      </div>

      {/* Farming Method */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Preferred Farming Method *
        </label>
        <div className="space-y-3">
          {farmingMethods.map((method) => (
            <label
              key={method.value}
              className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                formData.farmingMethod === method.value
                  ? 'border-green-500 bg-green-50/20'
                  : 'border-gray-200 hover:border-green-300:border-green-600'
              }`}
            >
              <input
                type="radio"
                name="farmingMethod"
                value={method.value}
                checked={formData.farmingMethod === method.value}
                onChange={(e) => handleInputChange('farmingMethod', e.target.value)}
                className="mt-1 mr-3"
              />
              <div>
                <div className="font-medium text-gray-900">{method.label}</div>
                <div className="text-sm text-gray-600">{method.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Primary Crops */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Primary Crops (select all that apply) *
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {cropOptions.map((crop) => (
            <button
              key={crop.value}
              type="button"
              onClick={() => handleCropToggle(crop.value)}
              className={`p-3 rounded-lg border-2 text-center transition-colors ${
                formData.primaryCrops.includes(crop.value)
                  ? 'border-green-500 bg-green-50/20 text-green-700'
                  : 'border-gray-200 hover:border-green-300:border-green-600'
              }`}
            >
              <div className="text-2xl mb-1">{crop.icon}</div>
              <div className="text-xs font-medium text-gray-900">{crop.label}</div>
            </button>
          ))}
        </div>
        {errors.primaryCrops && (
          <p className="mt-1 text-sm text-red-600">{errors.primaryCrops}</p>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <MapPin className="w-12 h-12 text-blue-600 mx-auto mb-2" />
        <h2 className="text-2xl font-bold text-gray-900">Farm Location</h2>
        <p className="text-gray-600">Tell us where your farm is located</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          State *
        </label>
        <input
          type="text"
          placeholder="e.g., Maharashtra"
          value={formData.location.state}
          onChange={(e) => handleInputChange('location.state', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
        {errors['location.state'] && (
          <p className="mt-1 text-sm text-red-600">{errors['location.state']}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          District *
        </label>
        <input
          type="text"
          placeholder="e.g., Pune"
          value={formData.location.district}
          onChange={(e) => handleInputChange('location.district', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
        {errors['location.district'] && (
          <p className="mt-1 text-sm text-red-600">{errors['location.district']}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Village/Tehsil
        </label>
        <input
          type="text"
          placeholder="e.g., Hadapsar"
          value={formData.location.village}
          onChange={(e) => handleInputChange('location.village', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {formData.location.coordinates && (
        <div className="bg-blue-50/20 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <MapPin size={16} className="text-blue-600" />
            <span className="text-blue-700 text-sm font-medium">
              Current location detected
            </span>
          </div>
          <p className="text-blue-600 text-sm mt-1">
            Lat: {formData.location.coordinates[1].toFixed(4)}, 
            Lng: {formData.location.coordinates[0].toFixed(4)}
          </p>
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Wheat className="w-12 h-12 text-purple-600 mx-auto mb-2" />
        <h2 className="text-2xl font-bold text-gray-900">Your Fields</h2>
        <p className="text-gray-600">Add detailed information about your farming fields</p>
      </div>

      <div className="flex justify-center mb-6">
        <button
          onClick={addField}
          className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus size={16} />
          <span>Add Field</span>
        </button>
      </div>

      <div className="space-y-6">
        {formData.fields.map((field, index) => (
          <div
            key={field.id}
            className="bg-gray-50 rounded-lg p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900 text-lg">
                Field {index + 1} Details
              </h3>
              <button
                onClick={() => removeField(field.id)}
                className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50:bg-red-900/20 rounded transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>

            {/* Basic Information */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Field Name *
                  </label>
                  <input
                    type="text"
                    value={field.name}
                    onChange={(e) => updateField(field.id, { name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., North Field"
                  />
                  {errors[`field_${field.id}_name`] && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors[`field_${field.id}_name`]}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Area (acres) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={field.area}
                    onChange={(e) => updateField(field.id, { area: parseFloat(e.target.value) || '' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., 2.5"
                  />
                  {errors[`field_${field.id}_area`] && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors[`field_${field.id}_area`]}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current/Planned Crop *
                  </label>
                  <select
                    value={field.cropType}
                    onChange={(e) => updateField(field.id, { cropType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select crop type</option>
                    {cropOptions.map((crop) => (
                      <option key={crop.value} value={crop.value}>
                        {crop.label}
                      </option>
                    ))}
                  </select>
                  {errors[`field_${field.id}_crop`] && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors[`field_${field.id}_crop`]}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Growth Stage
                  </label>
                  <select
                    value={field.growthStage}
                    onChange={(e) => updateField(field.id, { growthStage: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    {growthStages.map((stage) => (
                      <option key={stage.value} value={stage.value}>
                        {stage.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Soil Type
                  </label>
                  <select
                    value={field.soilType}
                    onChange={(e) => updateField(field.id, { soilType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select soil type</option>
                    {soilTypes.map((soil) => (
                      <option key={soil} value={soil}>
                        {soil}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Irrigation Type
                  </label>
                  <select
                    value={field.irrigationType}
                    onChange={(e) => updateField(field.id, { irrigationType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select irrigation type</option>
                    {irrigationTypes.map((irrigation) => (
                      <option key={irrigation} value={irrigation}>
                        {irrigation}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Additional Details (Collapsible) */}
              <details className="group mt-4">
                <summary className="flex items-center justify-between cursor-pointer p-3 bg-blue-50/20 rounded-lg hover:bg-blue-100:bg-blue-900/30 transition-colors">
                  <span className="font-medium text-blue-900 flex items-center">
                    <TestTube size={16} className="mr-2" />
                    Additional Field Data (Optional but Recommended)
                  </span>
                  <ChevronRight size={16} className="text-blue-600 group-open:rotate-90 transition-transform" />
                </summary>
                
                <div className="mt-4 space-y-4 p-4 bg-white rounded-lg border border-gray-200">
                  {/* Planting Date */}
                  {field.growthStage !== 'not_planted' && field.growthStage !== 'land_preparation' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <Calendar size={14} className="mr-1" />
                        Planting Date
                      </label>
                      <input
                        type="date"
                        value={field.plantingDate}
                        onChange={(e) => updateField(field.id, { plantingDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  )}

                  {/* Previous Yield */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Previous Season Yield (kg/acre)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={field.previousYield}
                      onChange={(e) => updateField(field.id, { previousYield: e.target.value })}
                      placeholder="e.g., 2500"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Helps AI provide better yield predictions
                    </p>
                  </div>

                  {/* Soil Health Data */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900 text-sm">
                      Soil Health (if available from soil test)
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          pH Level
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="14"
                          value={field.soilHealth.pH}
                          onChange={(e) => updateFieldSoilHealth(field.id, { pH: e.target.value })}
                          placeholder="e.g., 6.5"
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded bg-white text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Nitrogen (N)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={field.soilHealth.nitrogen}
                          onChange={(e) => updateFieldSoilHealth(field.id, { nitrogen: e.target.value })}
                          placeholder="kg/ha"
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded bg-white text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Phosphorus (P)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={field.soilHealth.phosphorus}
                          onChange={(e) => updateFieldSoilHealth(field.id, { phosphorus: e.target.value })}
                          placeholder="kg/ha"
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded bg-white text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Potassium (K)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={field.soilHealth.potassium}
                          onChange={(e) => updateFieldSoilHealth(field.id, { potassium: e.target.value })}
                          placeholder="kg/ha"
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded bg-white text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Organic Matter (%)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={field.soilHealth.organicMatter}
                          onChange={(e) => updateFieldSoilHealth(field.id, { organicMatter: e.target.value })}
                          placeholder="e.g., 2.5"
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded bg-white text-gray-900"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Water Availability */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Droplet size={14} className="mr-1" />
                      Water Availability
                    </label>
                    <select
                      value={field.waterAvailability}
                      onChange={(e) => updateField(field.id, { waterAvailability: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="abundant">Abundant - Always available</option>
                      <option value="adequate">Adequate - Usually sufficient</option>
                      <option value="limited">Limited - Sometimes scarce</option>
                      <option value="scarce">Scarce - Frequently unavailable</option>
                    </select>
                  </div>

                  {/* Known Issues */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Known Issues or Concerns
                    </label>
                    <textarea
                      value={field.knownIssues}
                      onChange={(e) => updateField(field.id, { knownIssues: e.target.value })}
                      placeholder="e.g., pest problems, drainage issues, nutrient deficiency..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      This helps AI provide targeted recommendations
                    </p>
                  </div>
                </div>
              </details>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      {formData.fields.length > 0 && (
        <div className="bg-blue-50/20 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">Summary</h3>
          <p className="text-blue-700 text-sm">
            Total Fields: {formData.fields.length} | 
            Total Area: {formData.fields.reduce((sum, field) => sum + (parseFloat(field.area) || 0), 0).toFixed(1)} acres
          </p>
          <p className="text-blue-600 text-xs mt-2">
            💡 More detailed information helps our AI provide better recommendations
          </p>
        </div>
      )}

      {errors.fields && (
        <div className="bg-red-50/20 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">{errors.fields}</p>
        </div>
      )}

      {errors.submit && (
        <div className="bg-red-50/20 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">{errors.submit}</p>
        </div>
      )}
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      default:
        return renderStep1();
    }
  };

  const stepTitles = {
    1: 'Personal Information',
    2: 'Farm Location',
    3: 'Field Information'
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-green-600 text-white p-3 rounded-full">
                <Wheat size={24} />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to Farmer's Desk
            </h1>
            <p className="text-gray-600">
              Let's set up your farm profile to get AI-powered insights
            </p>
          </div>

          {/* Step Indicator */}
          {renderStepIndicator()}

          {/* Step Title */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {stepTitles[currentStep]}
            </h2>
          </div>

          {/* Form Content */}
          <div className="mb-8">
            {renderCurrentStep()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </button>

            <div className="text-sm text-gray-500">
              Step {currentStep} of 3
            </div>

            {currentStep < 3 ? (
              <button
                onClick={handleNext}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={loading}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    <span>Complete Setup</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;