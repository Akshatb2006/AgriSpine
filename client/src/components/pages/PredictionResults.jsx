import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  Target, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Loader2,
  ArrowLeft,
  Download,
  Share2,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Droplets,
  Sun,
  Wind,
  Thermometer,
  Cloud,
  Calendar,
  MapPin,
  BarChart3
} from 'lucide-react';
import { predictionsAPI } from '../../services/api';

const PredictionResults = () => {
  const { predictionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!predictionId) return;
    let cancelled = false;

    const poll = async () => {
      const status = await fetchPredictionResults();
      if (cancelled) return;
      if (status === 'processing' || status === 'pending') {
        setTimeout(poll, 3000);
      }
    };

    // initial fetch and start polling
    poll();

    return () => { cancelled = true; };
  }, [predictionId]);

  const fetchPredictionResults = async () => {
    try {
      const response = await predictionsAPI.getPredictionStatus(`${predictionId}?_=${Date.now()}`);
      
      if (response.data.success && response.data.data) {
        setPrediction(response.data.data);
        return response.data.data.status;
      } else {
        console.error('Invalid response structure:', response.data);
        setError('Invalid response from server');
        return 'failed';
      }
    } catch (error) {
      console.error('Error fetching prediction:', error);
      setError('Failed to fetch prediction results');
      return 'failed';
    }
  };

  const formData = location.state?.formData;

  if (!prediction || (prediction?.status === 'processing') || (prediction?.status === 'pending')) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="bg-green-100 dark:bg-green-900/20 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
            <Loader2 size={32} className="text-green-600 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Analyzing Your Data
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Our AI is processing your farm data and generating predictions...
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 max-w-md mx-auto">
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <p className="font-medium mb-2">Analysis in progress:</p>
              <ul className="space-y-1 text-left">
                <li>✓ Processing crop and soil data</li>
                <li>✓ Analyzing weather patterns</li>
                <li>✓ Calculating yield predictions</li>
                <li className="opacity-50">• Generating recommendations</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || prediction?.status === 'failed') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="bg-red-100 dark:bg-red-900/20 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
            <AlertTriangle size={32} className="text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Analysis Failed
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || prediction?.error || 'Unable to complete the prediction analysis'}
          </p>
          <div className="space-x-4">
            <button
              onClick={() => navigate('/prediction')}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!prediction || (prediction.status === 'completed' && !prediction.prediction && !prediction.aiResponse)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Prediction Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The requested prediction could not be found.
          </p>
          <button
            onClick={() => navigate('/prediction')}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Create New Prediction
          </button>
        </div>
      </div>
    );
  }

  const predictionData = prediction.prediction || prediction.aiResponse;
  const inputData = prediction.inputData || formData;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Target },
    { id: 'recommendations', label: 'Recommendations', icon: CheckCircle },
    { id: 'risks', label: 'Risk Analysis', icon: AlertTriangle },
    { id: 'weather', label: 'Weather Data', icon: Cloud },
    { id: 'details', label: 'Details', icon: BarChart3 }
  ];

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Main Prediction Card */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 dark:from-green-700 dark:to-blue-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Predicted Yield</h2>
            <p className="text-green-100 dark:text-green-200">
              For {inputData?.cropType} crop in {inputData?.fieldSize} acres
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
            <TrendingUp size={32} />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">Expected Yield</h3>
            <p className="text-3xl font-bold">
              {predictionData.predictedYield?.toLocaleString() || 'N/A'}
            </p>
            <p className="text-sm opacity-90">{predictionData.unit || 'kg/ha'}</p>
          </div>
          
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">Confidence</h3>
            <p className="text-3xl font-bold">{predictionData.confidence || 85}%</p>
            <p className="text-sm opacity-90">Prediction accuracy</p>
          </div>
          
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">Variance</h3>
            <p className="text-3xl font-bold">±{predictionData.variance || 300}</p>
            <p className="text-sm opacity-90">{predictionData.unit || 'kg/ha'}</p>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Positive Factors */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <CheckCircle className="text-green-600 mr-2" size={20} />
            Positive Factors
          </h3>
          <ul className="space-y-2">
            {predictionData.factors?.positive?.map((factor, index) => (
              <li key={index} className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700 dark:text-gray-300">{factor}</span>
              </li>
            )) || <li className="text-gray-500">No positive factors identified</li>}
          </ul>
        </div>

        {/* Challenges */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <AlertTriangle className="text-orange-600 mr-2" size={20} />
            Challenges to Address
          </h3>
          <ul className="space-y-2">
            {predictionData.factors?.negative?.map((factor, index) => (
              <li key={index} className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700 dark:text-gray-300">{factor}</span>
              </li>
            )) || <li className="text-gray-500">No significant challenges identified</li>}
          </ul>
        </div>
      </div>

      {/* Explanation */}
      {predictionData.explanation && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">AI Analysis</h3>
          <p className="text-blue-700 dark:text-blue-300">{predictionData.explanation}</p>
        </div>
      )}
    </div>
  );

  const renderRecommendations = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AI Recommendations</h2>
        <p className="text-gray-600 dark:text-gray-400">Actionable insights to optimize your yield</p>
      </div>

      <div className="grid gap-4">
        {predictionData.recommendations?.map((rec, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{rec.icon || '📋'}</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white capitalize">
                    {rec.category?.replace('_', ' ') || 'General'}
                  </h3>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(rec.priority)}`}>
                    {rec.priority || 'Medium'} Priority
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Clock size={14} className="mr-1" />
                  {rec.timing || 'As needed'}
                </div>
              </div>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 mb-3">{rec.action}</p>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Expected Impact:</strong> {rec.expectedImpact}
              </p>
            </div>
          </div>
        )) || (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No specific recommendations available</p>
          </div>
        )}
      </div>

      {/* Seasonal Advice */}
      {predictionData.seasonalAdvice && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Calendar className="text-purple-600 mr-2" size={20} />
            Seasonal Advice
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Current Stage</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {predictionData.seasonalAdvice.currentStage}
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Next Steps</h4>
              <ul className="text-gray-600 dark:text-gray-400 text-sm space-y-1">
                {predictionData.seasonalAdvice.nextSteps?.map((step, index) => (
                  <li key={index}>• {step}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Critical Periods</h4>
              <ul className="text-gray-600 dark:text-gray-400 text-sm space-y-1">
                {predictionData.seasonalAdvice.criticalPeriods?.map((period, index) => (
                  <li key={index}>• {period}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderRiskAnalysis = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <AlertTriangle className="w-12 h-12 text-orange-600 mx-auto mb-2" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Risk Assessment</h2>
        <p className="text-gray-600 dark:text-gray-400">Potential risks and mitigation strategies</p>
      </div>

      {/* Overall Risk */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Overall Risk Level</h3>
          <span className={`inline-block px-4 py-2 rounded-full text-lg font-medium ${getRiskColor(predictionData.riskAssessment?.overallRisk)}`}>
            {predictionData.riskAssessment?.overallRisk?.toUpperCase() || 'MEDIUM'} RISK
          </span>
        </div>
      </div>

      {/* Risk Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {predictionData.riskAssessment && Object.entries(predictionData.riskAssessment)
          .filter(([key]) => key !== 'overallRisk')
          .map(([key, value]) => (
            <div key={key} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900 dark:text-white capitalize">
                  {key.replace('Risk', ' Risk')}
                </h4>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(value)}`}>
                  {value?.toUpperCase() || 'UNKNOWN'}
                </span>
              </div>
            </div>
          ))}
      </div>

      {/* Sustainability Assessment */}
      {predictionData.sustainability && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <CheckCircle className="text-green-600 mr-2" size={20} />
            Sustainability Assessment
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Water Efficiency</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                {predictionData.sustainability.waterEfficiency}
              </p>
              
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Soil Health</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {predictionData.sustainability.soilHealth}
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Sustainability Suggestions</h4>
              <ul className="text-gray-600 dark:text-gray-400 text-sm space-y-1">
                {predictionData.sustainability.suggestions?.map((suggestion, index) => (
                  <li key={index}>• {suggestion}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderWeatherData = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Cloud className="w-12 h-12 text-blue-600 mx-auto mb-2" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Weather Analysis</h2>
        <p className="text-gray-600 dark:text-gray-400">Current conditions and 7-day forecast</p>
      </div>

      {prediction.weatherData ? (
        <>
          {/* Current Weather */}
          {prediction.weatherData.current && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Current Conditions</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <Thermometer className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Math.round(prediction.weatherData.current.temperature)}°C
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Temperature</p>
                </div>
                
                <div className="text-center">
                  <Droplets className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {prediction.weatherData.current.humidity}%
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Humidity</p>
                </div>
                
                <div className="text-center">
                  <Wind className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {prediction.weatherData.current.windSpeed} m/s
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Wind Speed</p>
                </div>
                
                <div className="text-center">
                  <Cloud className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {prediction.weatherData.current.rainfall || 0}mm
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Rainfall</p>
                </div>
              </div>
              
              <div className="mt-4 text-center">
                <p className="text-gray-600 dark:text-gray-400 capitalize">
                  {prediction.weatherData.current.description}
                </p>
              </div>
            </div>
          )}

          {/* 7-Day Forecast */}
          {prediction.weatherData.forecast && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">7-Day Forecast</h3>
              
              <div className="grid grid-cols-1 gap-3">
                {prediction.weatherData.forecast.map((day, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                        {day.description}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {Math.round(day.temperature.max)}°/{Math.round(day.temperature.min)}°
                      </div>
                      <div className="text-sm text-blue-600 dark:text-blue-400">
                        {day.rainfall}mm
                      </div>
                      <div className="text-sm text-gray-500">
                        {day.humidity}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">Weather data not available</p>
        </div>
      )}
    </div>
  );

  const renderDetails = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <BarChart3 className="w-12 h-12 text-purple-600 mx-auto mb-2" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Prediction Details</h2>
        <p className="text-gray-600 dark:text-gray-400">Input data and analysis metadata</p>
      </div>

      {/* Input Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Input Data Summary</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Crop Type:</span>
              <span className="font-medium text-gray-900 dark:text-white capitalize">{inputData?.cropType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Field Size:</span>
              <span className="font-medium text-gray-900 dark:text-white">{inputData?.fieldSize} acres</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Location:</span>
              <span className="font-medium text-gray-900 dark:text-white">{inputData?.location}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Soil Type:</span>
              <span className="font-medium text-gray-900 dark:text-white capitalize">{inputData?.soilType}</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Irrigation:</span>
              <span className="font-medium text-gray-900 dark:text-white capitalize">{inputData?.irrigationType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Planting Date:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {inputData?.plantingDate ? new Date(inputData.plantingDate).toLocaleDateString() : 'Not specified'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Previous Yield:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {inputData?.previousYield ? `${inputData.previousYield} tons/acre` : 'Not specified'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Fertilizer:</span>
              <span className="font-medium text-gray-900 dark:text-white capitalize">
                {inputData?.fertilizer || 'Not specified'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Metadata */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Analysis Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Generated:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {new Date(prediction.createdAt).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Processing Time:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {prediction.processingTime ? `${Math.round(prediction.processingTime / 1000)}s` : 'N/A'}
              </span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">AI Model:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {predictionData.aiGenerated ? 'Gemini AI' : 'Statistical Model'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Prediction ID:</span>
              <span className="font-medium text-gray-900 dark:text-white font-mono text-sm">{predictionId}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Notes */}
      {inputData?.notes && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Additional Notes</h3>
          <p className="text-gray-600 dark:text-gray-400">{inputData.notes}</p>
        </div>
      )}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'recommendations':
        return renderRecommendations();
      case 'risks':
        return renderRiskAnalysis();
      case 'weather':
        return renderWeatherData();
      case 'details':
        return renderDetails();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/prediction')}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Prediction</span>
          </button>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              <Share2 size={16} />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              <Download size={16} />
            </button>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Yield Prediction Results
            </h1>
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <MapPin size={14} />
                <span>{inputData?.location}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar size={14} />
                <span>{new Date(prediction.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
              Analysis Complete
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600 dark:text-green-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
        
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>

      {/* Feedback Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Was this prediction helpful?</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 px-4 py-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors">
              <ThumbsUp size={16} />
              <span>Yes, helpful</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
              <ThumbsDown size={16} />
              <span>Needs improvement</span>
            </button>
          </div>
          
          <button
            onClick={() => navigate('/prediction')}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            <RefreshCw size={16} />
            <span>New Prediction</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PredictionResults;