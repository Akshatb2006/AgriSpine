// client/src/components/pages/Dashboard.jsx - REPLACE ENTIRE FILE
import React, { useState, useEffect } from 'react';
import { useField } from '../../contexts/FieldContext';
import { useNavigate } from 'react-router-dom';
import { dashboardAPI, tasksAPI, alertsAPI, predictionsAPI } from '../../services/api';
import WelcomeSection from '../dashboard/WelcomeSection';
// No icon imports - using emojis instead

const Dashboard = () => {
  const { selectedField, hasFields, loading: fieldsLoading } = useField();
  const navigate = useNavigate();
  
  const [dashboardData, setDashboardData] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAIWelcome, setShowAIWelcome] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [selectedField]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const [overviewRes, tasksRes, alertsRes, predictionsRes] = await Promise.all([
        dashboardAPI.getOverview().catch(err => {
          console.error('Overview error:', err);
          return { data: { success: false } };
        }),
        tasksAPI.getAllTasks().catch(err => {
          console.error('Tasks error:', err);
          return { data: { success: false, data: [] } };
        }),
        alertsAPI.getAllAlerts().catch(err => {
          console.error('Alerts error:', err);
          return { data: { success: false, data: [] } };
        }),
        predictionsAPI.getAllPredictions({ 
          limit: 10,
          fieldId: selectedField?.id 
        }).catch(err => {
          console.error('Predictions error:', err);
          return { data: { success: false, data: [] } };
        })
      ]);

      if (overviewRes.data.success) {
        setDashboardData(overviewRes.data.data);
      }

      if (tasksRes.data.success) {
        setTasks(tasksRes.data.data);
        
        const hasAITasks = tasksRes.data.data.some(task => task.aiGenerated || task.initialSetup);
        if (hasAITasks && !localStorage.getItem('ai-welcome-shown')) {
          setShowAIWelcome(true);
          localStorage.setItem('ai-welcome-shown', 'true');
        }
      }

      if (alertsRes.data.success) {
        setAlerts(alertsRes.data.data);
      }

      if (predictionsRes.data.success) {
        setPredictions(predictionsRes.data.data);
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const dismissAIWelcome = () => {
    setShowAIWelcome(false);
  };

  if (fieldsLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-4xl animate-pulse">⏳</div>
      </div>
    );
  }

  if (!hasFields) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <span className="text-4xl">➕</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-4">
            Welcome to Farmer's Desk!
          </h2>
          <p className="text-gray-600 dark:text-slate-400 mb-6">
            To get started, you'll need to add your first field.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/fields')}
              className="w-full bg-black dark:bg-white hover:opacity-90 text-white dark:text-black px-6 py-3 rounded font-medium transition-opacity"
            >
              Add Your First Field
            </button>
            <button
              onClick={() => navigate('/predictions/new')}
              className="w-full bg-black dark:bg-white hover:opacity-90 text-white dark:text-black px-6 py-3 rounded font-medium transition-opacity"
            >
              Try AI Prediction Demo
            </button>
          </div>
        </div>
      </div>
    );
  }

  const aiTasks = tasks.filter(task => task.aiGenerated || task.initialSetup);
  const pendingTasks = tasks.filter(task => task.status === 'pending').slice(0, 6);
  const urgentAlerts = alerts.filter(alert => alert.severity === 'high' || alert.severity === 'critical').slice(0, 3);
  
  // Filter predictions
  const completedPredictions = predictions.filter(p => p.status === 'completed').slice(0, 3);
  const pendingPredictions = predictions.filter(p => p.status === 'pending' || p.status === 'processing').slice(0, 2);

  return (
    <div className="space-y-6">
      {/* AI Welcome Banner */}
      {showAIWelcome && aiTasks.length > 0 && (
        <div className="bg-gray-100 dark:bg-gray-800 border-2 border-black dark:border-white rounded p-6 relative">
          <div className="relative flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="bg-black dark:bg-white text-white dark:text-black p-3 rounded">
                <span className="text-2xl">✨</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-2">
                  Your Farm is AI-Powered! 🎉
                </h3>
                <p className="text-gray-700 dark:text-slate-300 mb-3">
                  We've analyzed your farm and created {aiTasks.length} personalized tasks and {alerts.length} smart alerts based on your crops, soil type, and location.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-3 py-1 bg-black dark:bg-white text-white dark:text-black rounded text-sm">
                    <span className="mr-1">✓</span>
                    {aiTasks.length} AI Tasks
                  </span>
                  <span className="inline-flex items-center px-3 py-1 bg-black dark:bg-white text-white dark:text-black rounded text-sm">
                    <span className="mr-1">✓</span>
                    Smart Monitoring
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={dismissAIWelcome}
              className="text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 text-2xl leading-none"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Welcome Section */}
      <WelcomeSection selectedField={selectedField} />

      {/* Quick Actions */}
      {selectedField && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/predictions/new')}
            className="flex items-center space-x-3 p-4 bg-gray-100 dark:bg-gray-800 border border-black dark:border-white rounded hover:opacity-90 transition-opacity"
          >
            <div className="bg-black dark:bg-white text-white dark:text-black p-2 rounded">
              <span className="text-lg">📈</span>
            </div>
            <div className="text-left">
              <h3 className="font-medium text-gray-900 dark:text-slate-100">
                Create Prediction
              </h3>
              <p className="text-sm text-gray-700 dark:text-slate-300">
                AI-powered yield forecast
              </p>
            </div>
          </button>

          <button
            onClick={() => navigate('/plans/new')}
            className="flex items-center space-x-3 p-4 bg-gray-100 dark:bg-gray-800 border border-black dark:border-white rounded hover:opacity-90 transition-opacity"
          >
            <div className="bg-black dark:bg-white text-white dark:text-black p-2 rounded">
              <span className="text-lg">📅</span>
            </div>
            <div className="text-left">
              <h3 className="font-medium text-gray-900 dark:text-slate-100">
                Generate Plan
              </h3>
              <p className="text-sm text-gray-700 dark:text-slate-300">
                Smart farming schedule
              </p>
            </div>
          </button>

          <button
            onClick={() => navigate('/fields')}
            className="flex items-center space-x-3 p-4 bg-gray-100 dark:bg-gray-800 border border-black dark:border-white rounded hover:opacity-90 transition-opacity"
          >
            <div className="bg-black dark:bg-white text-white dark:text-black p-2 rounded">
              <span className="text-lg">🎯</span>
            </div>
            <div className="text-left">
              <h3 className="font-medium text-gray-900 dark:text-slate-100">
                Manage Fields
              </h3>
              <p className="text-sm text-gray-700 dark:text-slate-300">
                View all fields
              </p>
            </div>
          </button>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Tasks & Predictions */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Predictions Section */}
          {predictions.length > 0 && (
            <div className="bg-white dark:bg-black rounded border border-black dark:border-white border-opacity-20 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">🤖</span>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                    AI Predictions
                  </h2>
                  <span className="px-2 py-1 bg-black dark:bg-white text-white dark:text-black text-xs rounded">
                    {predictions.length}
                  </span>
                </div>
                <button
                  onClick={() => navigate('/predictions')}
                  className="text-sm text-black dark:text-white hover:opacity-80 flex items-center"
                >
                  View All →
                </button>
              </div>

              <div className="space-y-3">
                {/* Completed Predictions */}
                {completedPredictions.map((prediction) => (
                  <PredictionCard key={prediction.id} prediction={prediction} onClick={() => navigate(`/prediction-results/${prediction.id}`)} />
                ))}
                
                {/* Pending/Processing Predictions */}
                {pendingPredictions.map((prediction) => (
                  <PredictionCard key={prediction.id} prediction={prediction} />
                ))}
              </div>

              {predictions.length === 0 && (
                <div className="text-center py-8">
                  <span className="text-5xl mx-auto mb-3 block">🤖</span>
                  <p className="text-gray-600 dark:text-slate-400">No predictions yet</p>
                  <button
                    onClick={() => navigate('/predictions/new')}
                    className="mt-4 text-sm text-black dark:text-white hover:opacity-80"
                  >
                    Create your first prediction
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Tasks Section */}
          <div className="bg-white dark:bg-slate-900 rounded border border-purple-600 dark:border-purple-400 border-opacity-20 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-xl">📅</span>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                  Your Tasks
                </h2>
                <span className="px-2 py-1 bg-purple-600 dark:bg-purple-400 text-white text-xs rounded">
                  {pendingTasks.length}
                </span>
              </div>
              <button
                onClick={() => navigate('/plans')}
                className="text-sm text-purple-600 dark:text-purple-400 hover:opacity-80 flex items-center"
              >
                View All →
              </button>
            </div>

            {pendingTasks.length === 0 ? (
              <div className="text-center py-8">
                <span className="text-5xl mx-auto mb-3 block">✓</span>
                <p className="text-gray-600 dark:text-slate-400">No pending tasks</p>
                <button
                  onClick={() => navigate('/plans/new')}
                  className="mt-4 text-sm text-purple-600 dark:text-purple-400 hover:opacity-80"
                >
                  Create a new plan
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingTasks.map((task) => (
                  <TaskCard key={task._id} task={task} onRefresh={loadDashboardData} />
                ))}
              </div>
            )}
          </div>

          {/* Alerts Section */}
          {urgentAlerts.length > 0 && (
            <div className="bg-white dark:bg-black rounded border border-black dark:border-white border-opacity-20 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">⚠️</span>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                    Urgent Alerts
                  </h2>
                </div>
                <button
                  onClick={() => navigate('/alerts')}
                  className="text-sm text-black dark:text-white hover:opacity-80 flex items-center"
                >
                  View All →
                </button>
              </div>

              <div className="space-y-3">
                {urgentAlerts.map((alert) => (
                  <AlertCard key={alert._id} alert={alert} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Stats & Info */}
        <div className="space-y-6">
          {/* Farm Stats */}
          <div className="bg-white dark:bg-slate-900 rounded border border-purple-600 dark:border-purple-400 border-opacity-20 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-4 flex items-center">
              <span className="text-lg mr-2">📊</span>
              Farm Overview
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded">
                <div>
                  <p className="text-sm text-gray-600 dark:text-slate-400">Total Area</p>
                  <p className="text-2xl font-bold text-black dark:text-white">
                    {dashboardData?.totalArea || 0} <span className="text-sm">acres</span>
                  </p>
                </div>
                <span className="text-3xl opacity-50">🎯</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded">
                <div>
                  <p className="text-sm text-gray-600 dark:text-slate-400">Active Fields</p>
                  <p className="text-2xl font-bold text-black dark:text-white">
                    {dashboardData?.activeFields || 0}
                  </p>
                </div>
                <span className="text-3xl opacity-50">🗺️</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded">
                <div>
                  <p className="text-sm text-gray-600 dark:text-slate-400">Pending Tasks</p>
                  <p className="text-2xl font-bold text-black dark:text-white">
                    {pendingTasks.length}
                  </p>
                </div>
                <span className="text-3xl opacity-50">⏰</span>
              </div>

              {predictions.length > 0 && (
                <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-slate-400">AI Predictions</p>
                    <p className="text-2xl font-bold text-black dark:text-white">
                      {predictions.length}
                    </p>
                  </div>
                  <span className="text-3xl opacity-50">🤖</span>
                </div>
              )}
            </div>
          </div>

          {/* Field Info */}
          {selectedField && (
            <div className="bg-white dark:bg-black rounded border border-black dark:border-white border-opacity-20 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-4 flex items-center">
                <span className="text-lg mr-2">📍</span>
                {selectedField.name}
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-slate-400">Crop:</span>
                  <span className="font-medium text-gray-900 dark:text-slate-100">
                    {selectedField.crop || 'Not planted'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-slate-400">Area:</span>
                  <span className="font-medium text-gray-900 dark:text-slate-100">
                    {selectedField.area} acres
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-slate-400">Soil Type:</span>
                  <span className="font-medium text-gray-900 dark:text-slate-100">
                    {selectedField.soilType || 'Unknown'}
                  </span>
                </div>
                
                <button
                  onClick={() => navigate(`/fields/${selectedField.id}`)}
                  className="w-full mt-4 bg-black dark:bg-white hover:opacity-90 text-white dark:text-black px-4 py-2 rounded text-sm font-medium transition-opacity flex items-center justify-center"
                >
                  <span className="mr-2">👁️</span>
                  View Details
                </button>
              </div>
            </div>
          )}

          {/* AI Assistant */}
          <div className="bg-gray-100 dark:bg-gray-800 rounded border border-black dark:border-white p-6">
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-lg">⚡</span>
              <h3 className="font-semibold text-gray-900 dark:text-slate-100 flex items-center">
                AI Assistant
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
              Your farm is being monitored 24/7. Get instant predictions and recommendations.
            </p>
            <button
              onClick={() => navigate('/predictions/new')}
              className="w-full bg-black dark:bg-white hover:opacity-90 text-white dark:text-black px-4 py-2 rounded text-sm font-medium transition-opacity"
            >
              Get New Insights
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Prediction Card Component
const PredictionCard = ({ prediction, onClick }) => {
  const getStatusColor = (status) => {
    return 'border-black dark:border-white bg-gray-100 dark:bg-gray-800';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return '✓';
      case 'processing': return '⏳';
      case 'pending': return '⏰';
      case 'failed': return '❌';
      default: return '⏰';
    }
  };

  const getCropIcon = (cropType) => {
    const icons = {
      wheat: '🌾', corn: '🌽', rice: '🌾', soybeans: '🫘',
      cotton: '🌱', tomatoes: '🍅', potatoes: '🥔'
    };
    return icons[cropType?.toLowerCase()] || '🌱';
  };

  return (
    <div className={`p-4 border-l-4 rounded ${getStatusColor(prediction.status)} ${onClick ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}`} onClick={onClick}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-2xl">{getCropIcon(prediction.cropType)}</span>
            <h4 className="font-medium text-gray-900 dark:text-slate-100 capitalize">
              {prediction.cropType} Prediction
            </h4>
            <span className="flex items-center space-x-1 px-2 py-0.5 bg-white dark:bg-slate-900 rounded text-xs">
              <span>{getStatusIcon(prediction.status)}</span>
              <span className="capitalize">{prediction.status}</span>
            </span>
          </div>
          
          {prediction.fieldName && (
            <p className="text-sm text-gray-600 dark:text-slate-400 mb-2">
              Field: {prediction.fieldName}
            </p>
          )}
          
          <div className="flex items-center space-x-4 text-xs text-gray-600 dark:text-slate-400">
            {prediction.status === 'completed' && prediction.predictedYield && (
              <>
                <span>Yield: {prediction.predictedYield.toLocaleString()} kg/ha</span>
                <span>•</span>
                <span>Confidence: {prediction.confidence}%</span>
              </>
            )}
            {(prediction.status === 'pending' || prediction.status === 'processing') && (
              <span>{prediction.status === 'processing' ? 'AI analyzing...' : 'Scheduled'}</span>
            )}
          </div>

          {prediction.tags && prediction.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {prediction.tags.slice(0, 2).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-black dark:bg-white text-white dark:text-black rounded text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        
        {prediction.status === 'completed' && onClick && (
          <button className="ml-2 p-2 text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors">
            <span>→</span>
          </button>
        )}
      </div>
    </div>
  );
};

// Task Card Component
const TaskCard = ({ task, onRefresh }) => {
  const [updating, setUpdating] = useState(false);

  const handleStatusUpdate = async (newStatus) => {
    try {
      setUpdating(true);
      await tasksAPI.updateTaskStatus(task._id, newStatus);
      onRefresh();
    } catch (error) {
      console.error('Error updating task:', error);
    } finally {
      setUpdating(false);
    }
  };

  const typeEmojis = {
    irrigation: '💧',
    fertilizer: '🌱',
    pesticide: '🐛',
    harvest: '🌾',
    planting: '🌰',
    monitoring: '👀'
  };

  const typeEmoji = typeEmojis[task.type] || '📋';

  return (
    <div className="p-4 border-l-4 border-black dark:border-white bg-gray-100 dark:bg-gray-800 rounded">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-lg">{typeEmoji}</span>
            <h4 className="font-medium text-gray-900 dark:text-slate-100">
              {task.title}
            </h4>
            {(task.aiGenerated || task.initialSetup) && (
              <span className="inline-flex items-center px-2 py-0.5 bg-black dark:bg-white text-white dark:text-black text-xs rounded">
                <span className="mr-1">🤖</span>
                AI
              </span>
            )}
          </div>
          {task.description && (
            <p className="text-sm text-gray-600 dark:text-slate-400 mb-2">
              {task.description}
            </p>
          )}
          <div className="flex items-center space-x-3 text-xs text-gray-600 dark:text-slate-400">
            <span className="capitalize">{task.type}</span>
            <span>•</span>
            <span className="capitalize">{task.priority} priority</span>
            {task.scheduledDate && (
              <>
                <span>•</span>
                <span>{new Date(task.scheduledDate).toLocaleDateString()}</span>
              </>
            )}
          </div>
        </div>
        
        {task.status === 'pending' && (
          <button
            onClick={() => handleStatusUpdate('completed')}
            disabled={updating}
            className="ml-4 p-2 text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-50"
          >
            {updating ? <span className="animate-pulse">⏳</span> : <span>✓</span>}
          </button>
        )}
      </div>
    </div>
  );
};

// Alert Card Component
const AlertCard = ({ alert }) => {
  return (
    <div className="p-4 border-l-4 border-black dark:border-white bg-gray-100 dark:bg-gray-800 rounded">
      <div className="flex items-start space-x-3">
        <span className="text-xl flex-shrink-0 mt-0.5">⚠️</span>
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 dark:text-slate-100 mb-1">
            {alert.title}
          </h4>
          <p className="text-sm text-gray-600 dark:text-slate-400">
            {alert.description}
          </p>
          {alert.recommendations && alert.recommendations.length > 0 && (
            <div className="mt-2">
              <p className="text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">
                Recommended Action:
              </p>
              <p className="text-xs text-gray-600 dark:text-slate-400">
                • {alert.recommendations[0]}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;