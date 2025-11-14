// client/src/components/pages/CropPrediction.jsx (Enhanced Version)
import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  MapPin, 
  Calendar, 
  Droplets,
  Wheat,
  Target,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Sparkles,
  Brain,
  Activity,
  Zap,
  Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api, { predictionsAPI } from '../../services/api';

const CropPrediction = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [formData, setFormData] = useState({
    // Step 1: Basic Information
    cropType: '',
    fieldSize: '',
    location: '',
    soilType: '',
    
    // Step 2: Agricultural Details
    irrigationType: '',
    plantingDate: '',
    previousYield: '',
    fertilizer: '',
    
    // Step 3: Additional Information
    notes: '',
    weatherConcerns: [],
    farmingExperience: ''
  });

  const [errors, setErrors] = useState({});

  // Crop types available in India
  const cropTypes = [
    { value: 'rice', label: 'Rice', icon: '🌾', description: 'Staple grain crop' },
    { value: 'wheat', label: 'Wheat', icon: '🌾', description: 'Winter crop' },
    { value: 'corn', label: 'Corn/Maize', icon: '🌽', description: 'High-yield grain' },
    { value: 'soybeans', label: 'Soybeans', icon: '🫘', description: 'Protein-rich legume' },
    { value: 'cotton', label: 'Cotton', icon: '🌱', description: 'Cash crop fiber' },
    { value: 'sugarcane', label: 'Sugarcane', icon: '🎋', description: 'Sugar production' },
    { value: 'tomatoes', label: 'Tomatoes', icon: '🍅', description: 'Vegetable crop' },
    { value: 'potatoes', label: 'Potatoes', icon: '🥔', description: 'Root vegetable' },
    { value: 'onions', label: 'Onions', icon: '🧅', description: 'Bulb vegetable' },
    { value: 'chilies', label: 'Chilies', icon: '🌶️', description: 'Spice crop' }
  ];

  const soilTypes = [
    { value: 'alluvial', label: 'Alluvial Soil', description: 'Fertile river-deposited soil' },
    { value: 'black', label: 'Black Cotton Soil', description: 'Rich in nutrients, ideal for cotton' },
    { value: 'red', label: 'Red Soil', description: 'Good drainage, iron-rich' },
    { value: 'laterite', label: 'Laterite Soil', description: 'Good for tree crops' },
    { value: 'desert', label: 'Desert Soil', description: 'Sandy, low organic matter' },
    { value: 'mountain', label: 'Mountain Soil', description: 'Varied composition' }
  ];

  const irrigationTypes = [
    { value: 'drip', label: 'Drip Irrigation', icon: '💧', description: 'Water-efficient system' },
    { value: 'sprinkler', label: 'Sprinkler System', icon: '🌧️', description: 'Overhead watering' },
    { value: 'flood', label: 'Flood Irrigation', icon: '🌊', description: 'Traditional flooding' },
    { value: 'rainfed', label: 'Rain-fed', icon: '☔', description: 'Natural rainfall only' },
    { value: 'canal', label: 'Canal Irrigation', icon: '🏞️', description: 'Channel water supply' },
    { value: 'borewell', label: 'Borewell/Tubewell', icon: '🕳️', description: 'Groundwater extraction' }
  ];

  const fertilizerTypes = [
    { value: 'organic', label: 'Organic Fertilizer', description: 'Natural, eco-friendly' },
    { value: 'npk', label: 'NPK Chemical Fertilizer', description: 'Balanced nutrients' },
    { value: 'urea', label: 'Urea', description: 'High nitrogen content' },
    { value: 'dap', label: 'DAP (Diammonium Phosphate)', description: 'Phosphorus-rich' },
    { value: 'compost', label: 'Compost', description: 'Decomposed organic matter' },
    { value: 'vermicompost', label: 'Vermicompost', description: 'Worm-processed organic' }
  ];

  const weatherConcerns = [
    { value: 'drought', label: 'Drought Risk', icon: '🌵', color: 'text-orange-600' },
    { value: 'flooding', label: 'Flooding Risk', icon: '🌊', color: 'text-blue-600' },
    { value: 'hail', label: 'Hail Damage', icon: '🧊', color: 'text-gray-600' },
    { value: 'temperature', label: 'Temperature Extremes', icon: '🌡️', color: 'text-red-600' },
    { value: 'pests', label: 'Pest Infestation', icon: '🐛', color: 'text-green-600' },
    { value: 'diseases', label: 'Disease Outbreak', icon: '🦠', color: 'text-purple-600' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleWeatherConcernToggle = (concern) => {
    setFormData(prev => ({
      ...prev,
      weatherConcerns: prev.weatherConcerns.includes(concern)
        ? prev.weatherConcerns.filter(c => c !== concern)
        : [...prev.weatherConcerns, concern]
    }));
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!formData.cropType) newErrors.cropType = 'Please select a crop type';
        if (!formData.fieldSize) newErrors.fieldSize = 'Field size is required';
        if (!formData.location) newErrors.location = 'Location is required';
        if (!formData.soilType) newErrors.soilType = 'Please select soil type';
        break;
      
      case 2:
        if (!formData.irrigationType) newErrors.irrigationType = 'Please select irrigation type';
        if (!formData.plantingDate) newErrors.plantingDate = 'Planting date is required';
        break;
      
      case 3:
        // Optional validation for step 3
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

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setLoading(true);
    setLoadingMessage('Initializing AI analysis...');
    
    try {
      // Step 1: Initiate prediction
      const response = await predictionsAPI.generateYieldPrediction(formData);
      
      if (response.data.success) {
        const predictionId = response.data.predictionId;
        // Navigate immediately; PredictionResults handles polling and loading UI
        setLoading(false);
        setLoadingMessage('');
        navigate(`/prediction-results/${predictionId}`, { state: { formData } });
      } else {
        setErrors({ submit: 'Failed to initiate prediction. Please try again.' });
        setLoading(false);
        setLoadingMessage('');
      }
    } catch (error) {
      console.error('Prediction error:', error);
      setErrors({ submit: 'Failed to generate prediction. Please try again.' });
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((step) => (
        <React.Fragment key={step}>
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
              step <= currentStep
                ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
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
              className={`w-16 h-1 mx-2 transition-all duration-300 ${
                step < currentStep
                  ? 'bg-gradient-to-r from-green-500 to-blue-500'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <div className="bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
          <Wheat className="w-12 h-12 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Basic Information</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">Tell us about your crop and field details</p>
      </div>

      {/* Crop Type Selection */}
      <div>
        <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
          Select Crop Type *
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {cropTypes.map((crop) => (
            <button
              key={crop.value}
              type="button"
              onClick={() => handleInputChange('cropType', crop.value)}
              className={`group p-4 rounded-xl border-2 text-center transition-all duration-200 hover:scale-105 ${
                formData.cropType === crop.value
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 shadow-lg'
                  : 'border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{crop.icon}</div>
              <div className="font-semibold text-gray-900 dark:text-white mb-1">{crop.label}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{crop.description}</div>
            </button>
          ))}
        </div>
        {errors.cropType && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
            <AlertCircle size={16} className="mr-1" />
            {errors.cropType}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Field Size */}
        <div>
          <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Field Size (in acres) *
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.1"
              placeholder="e.g., 2.5"
              value={formData.fieldSize}
              onChange={(e) => handleInputChange('fieldSize', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-lg"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              acres
            </div>
          </div>
          {errors.fieldSize && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
              <AlertCircle size={16} className="mr-1" />
              {errors.fieldSize}
            </p>
          )}
        </div>

        {/* Location */}
        <div>
          <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Location (City/District) *
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="e.g., Pune, Maharashtra"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-lg"
            />
          </div>
          {errors.location && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
              <AlertCircle size={16} className="mr-1" />
              {errors.location}
            </p>
          )}
        </div>
      </div>

      {/* Soil Type */}
      <div>
        <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
          Soil Type *
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {soilTypes.map((soil) => (
            <button
              key={soil.value}
              type="button"
              onClick={() => handleInputChange('soilType', soil.value)}
              className={`p-4 rounded-xl border-2 text-left transition-all duration-200 hover:scale-105 ${
                formData.soilType === soil.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-lg'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <div className="font-semibold text-gray-900 dark:text-white mb-1">{soil.label}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{soil.description}</div>
            </button>
          ))}
        </div>
        {errors.soilType && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
            <AlertCircle size={16} className="mr-1" />
            {errors.soilType}
          </p>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <div className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
          <Droplets className="w-12 h-12 text-blue-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Agricultural Details</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">Information about your farming practices</p>
      </div>

      {/* Irrigation Type */}
      <div>
        <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
          Irrigation Type *
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {irrigationTypes.map((irrigation) => (
            <button
              key={irrigation.value}
              type="button"
              onClick={() => handleInputChange('irrigationType', irrigation.value)}
              className={`p-4 rounded-xl border-2 text-left transition-all duration-200 hover:scale-105 ${
                formData.irrigationType === irrigation.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-lg'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-2xl">{irrigation.icon}</span>
                <div className="font-semibold text-gray-900 dark:text-white">{irrigation.label}</div>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{irrigation.description}</div>
            </button>
          ))}
        </div>
        {errors.irrigationType && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
            <AlertCircle size={16} className="mr-1" />
            {errors.irrigationType}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Planting Date */}
        <div>
          <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Planting Date *
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="date"
              value={formData.plantingDate}
              onChange={(e) => handleInputChange('plantingDate', e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-lg"
            />
          </div>
          {errors.plantingDate && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
              <AlertCircle size={16} className="mr-1" />
              {errors.plantingDate}
            </p>
          )}
        </div>

        {/* Previous Yield */}
        <div>
          <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Previous Year Yield (tons/acre)
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.1"
              placeholder="e.g., 3.2"
              value={formData.previousYield}
              onChange={(e) => handleInputChange('previousYield', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-lg"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              tons/acre
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex items-center">
            <TrendingUp size={16} className="mr-1" />
            Optional: Helps improve prediction accuracy
          </p>
        </div>
      </div>

      {/* Fertilizer Type */}
      <div>
        <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
          Fertilizer Type
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {fertilizerTypes.map((fertilizer) => (
            <button
              key={fertilizer.value}
              type="button"
              onClick={() => handleInputChange('fertilizer', fertilizer.value)}
              className={`p-4 rounded-xl border-2 text-left transition-all duration-200 hover:scale-105 ${
                formData.fertilizer === fertilizer.value
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 shadow-lg'
                  : 'border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <div className="font-semibold text-gray-900 dark:text-white mb-1">{fertilizer.label}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{fertilizer.description}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
          <Target className="w-12 h-12 text-purple-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Additional Information</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">Optional details to improve prediction accuracy</p>
      </div>

      {/* Weather Concerns */}
      <div>
        <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
          Weather Concerns (select all that apply)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {weatherConcerns.map((concern) => (
            <button
              key={concern.value}
              type="button"
              onClick={() => handleWeatherConcernToggle(concern.value)}
              className={`p-4 rounded-xl border-2 text-left transition-all duration-200 hover:scale-105 ${
                formData.weatherConcerns.includes(concern.value)
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 shadow-lg'
                  : 'border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-2xl">{concern.icon}</span>
                <div className={`font-semibold ${concern.color} dark:text-white`}>{concern.label}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Farming Experience */}
        <div>
          <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Years of Farming Experience
          </label>
          <select
            value={formData.farmingExperience}
            onChange={(e) => handleInputChange('farmingExperience', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-lg"
          >
            <option value="">Select experience level</option>
            <option value="0-2">0-2 years (Beginner)</option>
            <option value="3-5">3-5 years</option>
            <option value="6-10">6-10 years</option>
            <option value="11-20">11-20 years</option>
            <option value="20+">20+ years (Expert)</option>
          </select>
        </div>
      </div>

      {/* Additional Notes */}
      <div>
        <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Additional Notes
        </label>
        <textarea
          rows={5}
          placeholder="Any specific concerns, past issues, or additional information about your field..."
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors resize-none text-lg"
        />
      </div>

      {errors.submit && (
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle size={20} className="text-red-500" />
            <span className="text-red-700 dark:text-red-300 font-medium">{errors.submit}</span>
          </div>
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

  return (
    <div className="max-w-6xl mx-auto">
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md mx-auto text-center shadow-2xl">
            <div className="bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl p-8 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <Loader2 size={40} className="text-green-600 animate-spin" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              AI Analysis in Progress
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
              {loadingMessage || 'Processing your farm data...'}
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <Brain size={20} className="text-blue-600" />
                <span className="font-semibold text-blue-700 dark:text-blue-300">AI Processing</span>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Please don't close this window. Analysis typically takes 30-60 seconds.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Back Button */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/prediction')}
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Predictions</span>
        </button>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 p-8 text-white">
          <div className="text-center">
            <div className="flex justify-center space-x-2 mb-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                <Sparkles size={28} />
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                <Brain size={28} />
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                <Activity size={28} />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-3">
              AI Crop Yield Prediction
            </h1>
            <p className="text-xl text-white/90 mb-4">
              Get accurate yield predictions powered by advanced AI technology
            </p>
            <div className="flex items-center justify-center space-x-6 text-white/80">
              <div className="flex items-center space-x-2">
                <Zap size={16} />
                <span>Instant Analysis</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield size={16} />
                <span>95% Accuracy</span>
              </div>
              <div className="flex items-center space-x-2">
                <Activity size={16} />
                <span>Real-time Insights</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Step Indicator */}
          {renderStepIndicator()}

          {/* Form Content */}
          <div className="mb-8">
            {renderCurrentStep()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-8 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex items-center space-x-2 px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ChevronLeft size={20} />
              <span className="font-medium">Previous</span>
            </button>

            <div className="text-center">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Step {currentStep} of 3
              </div>
              <div className="flex space-x-2">
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      step <= currentStep ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>

            {currentStep < 3 ? (
              <button
                onClick={handleNext}
                className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <span>Next</span>
                <ChevronRight size={20} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg disabled:transform-none disabled:shadow-none"
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>{loadingMessage || 'Generating Prediction...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    <span>Generate AI Prediction</span>
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

export default CropPrediction;