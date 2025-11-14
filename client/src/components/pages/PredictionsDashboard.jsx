// client/src/components/pages/PredictionsDashboard.jsx - Enhanced Version
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Plus, 
  Calendar, 
  Target, 
  BarChart3,
  Filter,
  Search,
  Download,
  Eye,
  RefreshCw,
  Brain,
  CheckCircle,
  Clock,
  AlertCircle,
  Sparkles,
  MapPin,
  Layers,
  Activity,
  Zap,
  Star,
  TrendingDown,
  Award,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useField } from '../../contexts/FieldContext';
import { predictionsAPI } from '../../services/api';
import FieldSelector from '../common/FieldSelector';

const PredictionsDashboard = () => {
  const navigate = useNavigate();
  const { selectedField, hasFields } = useField();
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    if (hasFields) {
      loadPredictions();
    }
  }, [hasFields, selectedField]);

  const loadPredictions = async () => {
    try {
      setLoading(true);
      const response = await predictionsAPI.getPredictionHistory();
      if (response.data.success) {
        setPredictions(response.data.data);
      }
    } catch (error) {
      console.error('Error loading predictions:', error);
      // Enhanced mock data for demo
      setPredictions([
        {
          id: '1',
          predictionType: 'yield',
          cropType: 'wheat',
          fieldSize: 12.5,
          location: 'Pune, Maharashtra',
          predictedYield: 5200,
          confidence: 87,
          status: 'completed',
          createdAt: '2024-03-15T10:30:00Z',
          accuracy: 89,
          factors: { positive: ['Good soil quality', 'Favorable weather'], negative: ['Pest risk'] },
          tags: ['High Yield', 'AI Optimized']
        },
        {
          id: '2',
          predictionType: 'yield',
          cropType: 'corn',
          fieldSize: 8.3,
          location: 'Mumbai, Maharashtra',
          predictedYield: 4800,
          confidence: 82,
          status: 'completed',
          createdAt: '2024-03-10T14:20:00Z',
          accuracy: 91,
          factors: { positive: ['Optimal irrigation'], negative: ['Weather concerns'] },
          tags: ['Stable Yield']
        },
        {
          id: '3',
          predictionType: 'disease',
          cropType: 'rice',
          fieldSize: 15.2,
          location: 'Nashik, Maharashtra',
          diseaseRisk: 'Low',
          confidence: 94,
          status: 'completed',
          createdAt: '2024-03-18T09:15:00Z',
          accuracy: 96,
          tags: ['Disease Analysis', 'Preventive']
        },
        {
          id: '4',
          predictionType: 'yield',
          cropType: 'tomatoes',
          fieldSize: 6.8,
          location: 'Aurangabad, Maharashtra',
          predictedYield: 7200,
          confidence: 85,
          status: 'processing',
          createdAt: '2024-03-20T11:45:00Z',
          tags: ['Processing']
        },
        {
          id: '5',
          predictionType: 'pest',
          cropType: 'cotton',
          fieldSize: 20.0,
          location: 'Nagpur, Maharashtra',
          pestRisk: 'Medium',
          confidence: 88,
          status: 'completed',
          createdAt: '2024-03-12T16:00:00Z',
          accuracy: 85,
          tags: ['Pest Control', 'Monitoring Required']
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100/20 text-green-700 border-green-200';
      case 'processing':
        return 'bg-blue-100/20 text-blue-700 border-blue-200';
      case 'failed':
        return 'bg-red-100/20 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={14} className="text-green-600" />;
      case 'processing':
        return <Clock size={14} className="text-blue-600 animate-pulse" />;
      case 'failed':
        return <AlertCircle size={14} className="text-red-600" />;
      default:
        return <Clock size={14} className="text-gray-600" />;
    }
  };

  const getPredictionTypeColor = (type) => {
    switch (type) {
      case 'yield':
        return 'bg-purple-100/20 text-purple-700';
      case 'disease':
        return 'bg-orange-100/20 text-orange-700';
      case 'pest':
        return 'bg-red-100/20 text-red-700';
      default:
        return 'bg-blue-100/20 text-blue-700';
    }
  };

  const getCropIcon = (cropType) => {
    const icons = {
      wheat: '🌾',
      corn: '🌽',
      rice: '🌾',
      soybeans: '🫘',
      cotton: '🌱',
      tomatoes: '🍅',
      potatoes: '🥔'
    };
    return icons[cropType] || '🌱';
  };

  const filteredPredictions = predictions
    .filter(prediction => {
      const matchesStatus = filterStatus === 'all' || prediction.status === filterStatus;
      const matchesType = filterType === 'all' || prediction.predictionType === filterType;
      const matchesSearch = prediction.cropType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           prediction.location.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesType && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'accuracy':
          return (b.accuracy || 0) - (a.accuracy || 0);
        case 'confidence':
          return (b.confidence || 0) - (a.confidence || 0);
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

  const stats = {
    total: predictions.length,
    completed: predictions.filter(p => p.status === 'completed').length,
    processing: predictions.filter(p => p.status === 'processing').length,
    avgAccuracy: predictions.filter(p => p.accuracy).reduce((acc, p) => acc + p.accuracy, 0) / predictions.filter(p => p.accuracy).length || 0,
    avgYield: predictions.filter(p => p.predictedYield).reduce((acc, p) => acc + p.predictedYield, 0) / predictions.filter(p => p.predictedYield).length || 0,
    bestAccuracy: Math.max(...predictions.map(p => p.accuracy || 0), 0),
    yieldPredictions: predictions.filter(p => p.predictionType === 'yield').length,
    diseasePredictions: predictions.filter(p => p.predictionType === 'disease').length,
    pestPredictions: predictions.filter(p => p.predictionType === 'pest').length,
  };

  if (!hasFields) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="bg-gradient-to-br from-purple-100 to-blue-100/20/20 rounded-full p-8 w-32 h-32 mx-auto mb-6 flex items-center justify-center">
            <Brain size={48} className="text-purple-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            No Fields Available
          </h2>
          <p className="text-gray-600 mb-8 text-lg">
            You need to add fields before creating AI predictions for your crops.
          </p>
          <button
            onClick={() => navigate('/fields')}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Add Your First Field
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 rounded-2xl p-8 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                  <Sparkles size={32} className="text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold">AI Predictions Hub</h1>
                  <p className="text-xl text-white/90">
                    Powered by advanced machine learning and agricultural expertise
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-6 text-white/80">
                <div className="flex items-center space-x-2">
                  <Activity size={16} />
                  <span>Real-time Analysis</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap size={16} />
                  <span>Instant Results</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award size={16} />
                  <span>95% Accuracy</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <button
                onClick={loadPredictions}
                className="flex items-center justify-center space-x-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-3 rounded-xl transition-all duration-200 border border-white/20"
              >
                <RefreshCw size={18} />
                <span>Refresh</span>
              </button>
              <button
                onClick={() => navigate('/predictions/new')}
                className="flex items-center justify-center space-x-2 bg-white text-purple-600 hover:bg-gray-50 px-8 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <Plus size={18} />
                <span>New Prediction</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Field Selector */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-green-100/20 rounded-lg p-2">
            <Layers className="w-5 h-5 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            Select Field for Analysis
          </h2>
        </div>
        <FieldSelector className="max-w-md" />
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50/20/20 rounded-2xl p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100/30 rounded-xl p-3">
              <Brain className="w-8 h-8 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-blue-600">{stats.total}</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Total Predictions</h3>
          <p className="text-sm text-gray-600">Across all fields</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50/20/20 rounded-2xl p-6 border border-green-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100/30 rounded-xl p-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <span className="text-2xl font-bold text-green-600">{stats.completed}</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Completed</h3>
          <p className="text-sm text-gray-600">Analysis finished</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50/20/20 rounded-2xl p-6 border border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100/30 rounded-xl p-3">
              <Target className="w-8 h-8 text-purple-600" />
            </div>
            <span className="text-2xl font-bold text-purple-600">{Math.round(stats.avgAccuracy)}%</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Avg Accuracy</h3>
          <p className="text-sm text-gray-600">Prediction quality</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-red-50/20/20 rounded-2xl p-6 border border-orange-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-100/30 rounded-xl p-3">
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
            <span className="text-2xl font-bold text-orange-600">{Math.round(stats.avgYield)}</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Avg Yield</h3>
          <p className="text-sm text-gray-600">kg/ha predicted</p>
        </div>
      </div>

      {/* Prediction Type Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-purple-100/20 rounded-lg p-2">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Yield Predictions</h3>
              <p className="text-2xl font-bold text-purple-600">{stats.yieldPredictions}</p>
            </div>
          </div>
          <p className="text-sm text-gray-600">Crop yield analysis and forecasting</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-orange-100/20 rounded-lg p-2">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Disease Analysis</h3>
              <p className="text-2xl font-bold text-orange-600">{stats.diseasePredictions}</p>
            </div>
          </div>
          <p className="text-sm text-gray-600">Plant health and disease detection</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-red-100/20 rounded-lg p-2">
              <Target className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Pest Control</h3>
              <p className="text-2xl font-bold text-red-600">{stats.pestPredictions}</p>
            </div>
          </div>
          <p className="text-sm text-gray-600">Pest risk assessment and prevention</p>
        </div>
      </div>

      {/* Enhanced Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Filter size={18} className="text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="processing">Processing</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900"
            >
              <option value="all">All Types</option>
              <option value="yield">Yield Predictions</option>
              <option value="disease">Disease Analysis</option>
              <option value="pest">Pest Control</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="accuracy">Highest Accuracy</option>
              <option value="confidence">Highest Confidence</option>
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search predictions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 w-64"
              />
            </div>
            <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-800:text-gray-200 px-3 py-2 border border-gray-300 rounded-lg transition-colors">
              <Download size={16} />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Predictions List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Your AI Predictions ({filteredPredictions.length})
            </h2>
            {stats.bestAccuracy > 0 && (
              <div className="flex items-center space-x-2 bg-green-100/20 text-green-700 px-3 py-1 rounded-full">
                <Star size={14} />
                <span className="text-sm font-medium">Best: {stats.bestAccuracy}% accuracy</span>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="p-6">
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-32 bg-gray-200 rounded-xl"></div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredPredictions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="bg-gray-100 rounded-full p-8 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <Brain size={40} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              No predictions found
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {filterStatus === 'all' ? 
                "Create your first AI prediction to get intelligent insights about your crops." :
                `No predictions with status "${filterStatus}" found. Try adjusting your filters.`
              }
            </p>
            <button
              onClick={() => navigate('/predictions/new')}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Create Your First Prediction
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredPredictions.map((prediction) => (
              <div key={prediction.id} className="p-6 hover:bg-gray-50:bg-gray-700/50 transition-all duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="text-3xl">{getCropIcon(prediction.cropType)}</div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 capitalize">
                          {prediction.cropType} {prediction.predictionType === 'yield' ? 'Yield Prediction' : prediction.predictionType === 'disease' ? 'Disease Analysis' : 'Pest Assessment'}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPredictionTypeColor(prediction.predictionType)}`}>
                          {prediction.predictionType ? prediction.predictionType.charAt(0).toUpperCase() + prediction.predictionType.slice(1) : 'Unknown'}
                        </span>
                        <span className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(prediction.status)}`}>
                          {getStatusIcon(prediction.status)}
                          <span>{prediction.status ? prediction.status.charAt(0).toUpperCase() + prediction.status.slice(1) : 'Unknown'}</span>
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        {prediction.predictionType === 'yield' && (
                          <>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Predicted Yield</p>
                              <p className="font-semibold text-gray-900">
                                {prediction.predictedYield?.toLocaleString() || 'Processing...'} kg/ha
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Confidence</p>
                              <p className="font-semibold text-gray-900">
                                {prediction.confidence || '--'}%
                              </p>
                            </div>
                          </>
                        )}
                        
                        {prediction.predictionType === 'disease' && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Disease Risk</p>
                            <p className={`font-semibold ${prediction.diseaseRisk === 'Low' ? 'text-green-600' : prediction.diseaseRisk === 'Medium' ? 'text-yellow-600' : 'text-red-600'}`}>
                              {prediction.diseaseRisk || 'Analyzing...'}
                            </p>
                          </div>
                        )}
                        
                        {prediction.predictionType === 'pest' && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Pest Risk</p>
                            <p className={`font-semibold ${prediction.pestRisk === 'Low' ? 'text-green-600' : prediction.pestRisk === 'Medium' ? 'text-yellow-600' : 'text-red-600'}`}>
                              {prediction.pestRisk || 'Analyzing...'}
                            </p>
                          </div>
                        )}
                        
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Field Size</p>
                          <p className="font-semibold text-gray-900">
                            {prediction.fieldSize} acres
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Location</p>
                          <div className="flex items-center space-x-1">
                            <MapPin size={12} className="text-gray-400" />
                            <p className="font-medium text-gray-900 text-sm">
                              {prediction.location}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Tags */}
                      {prediction.tags && prediction.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {prediction.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Calendar size={14} />
                            <span>Created: {new Date(prediction.createdAt).toLocaleDateString()}</span>
                          </div>
                          {prediction.accuracy && (
                            <div className="flex items-center space-x-1">
                              <Target size={14} className="text-green-500" />
                              <span className="text-green-600 font-medium">
                                {prediction.accuracy}% accuracy
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {prediction.status === 'processing' && (
                          <div className="flex items-center space-x-1 text-blue-600">
                            <div className="animate-pulse w-2 h-2 bg-blue-600 rounded-full"></div>
                            <span>AI analyzing...</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {prediction.status === 'completed' && (
                      <button
                        onClick={() => navigate(`/prediction-results/${prediction.id}`)}
                        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-md"
                      >
                        <Eye size={16} />
                        <span>View Results</span>
                        <ArrowRight size={14} />
                      </button>
                    )}
                    
                    {prediction.status === 'processing' && (
                      <div className="flex items-center space-x-2 px-4 py-2 bg-blue-100/20 text-blue-700 rounded-lg">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                        <span className="text-sm font-medium">Processing...</span>
                      </div>
                    )}
                    
                    {prediction.status === 'failed' && (
                      <button
                        onClick={() => navigate('/predictions/new')}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-100/20 text-red-700 rounded-lg hover:bg-red-200:bg-red-900/40 transition-colors"
                      >
                        <RefreshCw size={16} />
                        <span>Retry</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Call to Action Section */}
      {selectedField && filteredPredictions.length > 0 && (
        <div className="bg-gradient-to-r from-green-50 via-blue-50 to-purple-50/10/10/10 rounded-2xl p-8 border-2 border-dashed border-gray-300">
          <div className="text-center">
            <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-4 rounded-2xl w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <Sparkles size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready for more AI insights?
            </h3>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto text-lg">
              Generate new predictions for {selectedField.name} using our advanced AI models. 
              Get yield forecasts, disease analysis, and pest control recommendations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/predictions/new')}
                className="flex items-center justify-center space-x-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <Brain size={20} />
                <span>Create New Prediction</span>
                <ArrowRight size={16} />
              </button>
              <button
                onClick={() => navigate('/fields')}
                className="flex items-center justify-center space-x-3 bg-white border-2 border-gray-300 hover:border-gray-400:border-gray-500 text-gray-700 px-8 py-4 rounded-xl font-semibold transition-all duration-200"
              >
                <Layers size={20} />
                <span>Manage Fields</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictionsDashboard;