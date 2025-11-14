// client/src/components/pages/PlanDetails.jsx
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  CheckCircle, 
  Circle,
  AlertCircle,
  Edit3,
  Trash2,
  Play,
  Pause,
  RotateCcw,
  Download,
  Share2,
  Plus,
  Target,
  TrendingUp,
  Users,
  DollarSign,
  Loader2
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { plansAPI } from '../../services/api';

const PlanDetails = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingTask, setUpdatingTask] = useState(null);
  const [showTaskNotes, setShowTaskNotes] = useState({});

  useEffect(() => {
    if (planId) {
      loadPlanDetails();
    }
  }, [planId]);

  const loadPlanDetails = async () => {
    try {
      setLoading(true);
      const response = await plansAPI.getPlan(planId);
      if (response.data.success) {
        setPlan(response.data.data);
      } else {
        setError('Plan not found');
      }
    } catch (err) {
      console.error('Error loading plan:', err);
      setError('Failed to load plan details');
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId, newStatus, notes = '') => {
    try {
      setUpdatingTask(taskId);
      const response = await plansAPI.updateTaskStatus(planId, taskId, {
        status: newStatus,
        notes: notes,
        actualDuration: null // Could be added later
      });
      
      if (response.data.success) {
        // Update local state
        setPlan(prev => ({
          ...prev,
          tasks: prev.tasks.map(task => 
            task.id === taskId ? { ...task, status: newStatus, notes } : task
          ),
          progress: response.data.data.progress
        }));
      }
    } catch (err) {
      console.error('Error updating task:', err);
      alert('Failed to update task status');
    } finally {
      setUpdatingTask(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'in-progress':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'skipped':
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'low':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getTaskIcon = (type) => {
    const icons = {
      irrigation: '💧',
      fertilizer: '🌱',
      pesticide: '🐛',
      planting: '🌾',
      harvesting: '🚜',
      monitoring: '👁️',
      maintenance: '🔧'
    };
    return icons[type] || '📋';
  };

  const isTaskOverdue = (task) => {
    const now = new Date();
    const scheduledDate = new Date(task.scheduledDate);
    return task.status !== 'completed' && task.status !== 'skipped' && scheduledDate < now;
  };

  const toggleTaskNotes = (taskId) => {
    setShowTaskNotes(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 size={32} className="text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading plan details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {error}
          </h2>
          <button
            onClick={() => navigate('/plans')}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Back to Plans
          </button>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Plan not found
          </h2>
          <button
            onClick={() => navigate('/plans')}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Back to Plans
          </button>
        </div>
      </div>
    );
  }

  const completedTasks = plan.tasks.filter(task => task.status === 'completed').length;
  const totalTasks = plan.tasks.length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/plans')}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Plans</span>
          </button>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              <Share2 size={16} />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              <Download size={16} />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              <Edit3 size={16} />
            </button>
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="mb-4 lg:mb-0">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {plan.title}
              </h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(plan.status)}`}>
                {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(plan.priority)}`}>
                {plan.priority.charAt(0).toUpperCase() + plan.priority.slice(1)} Priority
              </span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <Calendar size={14} />
                <span>{new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Target size={14} />
                <span>{plan.field?.name || 'Unknown Field'}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock size={14} />
                <span>{plan.duration} days</span>
              </div>
            </div>
          </div>
          
          {/* Progress Circle */}
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="relative w-20 h-20">
                <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 80 80">
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-gray-200 dark:text-gray-700"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 36}`}
                    strokeDashoffset={`${2 * Math.PI * 36 * (1 - progressPercentage / 100)}`}
                    className="text-green-500 transition-all duration-300"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {progressPercentage}%
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Complete</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 dark:bg-blue-900/20 rounded-lg p-3">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tasks</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {completedTasks}/{totalTasks}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="bg-red-100 dark:bg-red-900/20 rounded-lg p-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overdue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {plan.overdueTasks?.length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="bg-yellow-100 dark:bg-yellow-900/20 rounded-lg p-3">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Upcoming</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {plan.upcomingTasks?.length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="bg-green-100 dark:bg-green-900/20 rounded-lg p-3">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Progress</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{progressPercentage}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tasks List */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Tasks ({plan.tasks.length})
                </h2>
                <button className="flex items-center space-x-2 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300">
                  <Plus size={16} />
                  <span>Add Task</span>
                </button>
              </div>
            </div>

            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {plan.tasks.map((task) => (
                <div key={task.id} className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      {task.status === 'completed' ? (
                        <button
                          onClick={() => updateTaskStatus(task.id, 'pending')}
                          disabled={updatingTask === task.id}
                          className="text-green-600 hover:text-green-700 disabled:opacity-50"
                        >
                          {updatingTask === task.id ? (
                            <Loader2 size={20} className="animate-spin" />
                          ) : (
                            <CheckCircle size={20} />
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={() => updateTaskStatus(task.id, 'completed')}
                          disabled={updatingTask === task.id}
                          className="text-gray-400 hover:text-green-600 disabled:opacity-50"
                        >
                          {updatingTask === task.id ? (
                            <Loader2 size={20} className="animate-spin" />
                          ) : (
                            <Circle size={20} />
                          )}
                        </button>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-xl">{getTaskIcon(task.type)}</span>
                        <h3 className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                          {task.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                        {task.priority !== 'medium' && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        )}
                        {isTaskOverdue(task) && (
                          <span className="px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-full text-xs font-medium">
                            Overdue
                          </span>
                        )}
                      </div>

                      {task.description && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-2">
                        <div className="flex items-center space-x-1">
                          <Calendar size={14} />
                          <span>{new Date(task.scheduledDate).toLocaleDateString()}</span>
                        </div>
                        {task.estimatedDuration && (
                          <div className="flex items-center space-x-1">
                            <Clock size={14} />
                            <span>{task.estimatedDuration}h estimated</span>
                          </div>
                        )}
                        {task.completedDate && (
                          <div className="flex items-center space-x-1">
                            <CheckCircle size={14} />
                            <span>Completed {new Date(task.completedDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                      {task.instructions && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-2">
                          <p className="text-blue-800 dark:text-blue-200 text-sm">
                            <strong>Instructions:</strong> {task.instructions}
                          </p>
                        </div>
                      )}

                      {task.resources && task.resources.length > 0 && (
                        <div className="mb-2">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Resources:</p>
                          <div className="flex flex-wrap gap-2">
                            {task.resources.map((resource, index) => (
                              <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                                {resource.quantity} {resource.unit} {resource.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {task.notes && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-2">
                          <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                            <strong>Notes:</strong> {task.notes}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => toggleTaskNotes(task.id)}
                          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm"
                        >
                          {showTaskNotes[task.id] ? 'Hide Notes' : 'Add Notes'}
                        </button>
                        
                        {task.status === 'pending' && (
                          <button
                            onClick={() => updateTaskStatus(task.id, 'in-progress')}
                            disabled={updatingTask === task.id}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm"
                          >
                            Start Task
                          </button>
                        )}
                        
                        {task.status === 'in-progress' && (
                          <button
                            onClick={() => updateTaskStatus(task.id, 'pending')}
                            disabled={updatingTask === task.id}
                            className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 text-sm"
                          >
                            Pause Task
                          </button>
                        )}
                      </div>

                      {showTaskNotes[task.id] && (
                        <div className="mt-3">
                          <textarea
                            placeholder="Add notes about this task..."
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                            rows={3}
                          />
                          <div className="flex justify-end space-x-2 mt-2">
                            <button
                              onClick={() => toggleTaskNotes(task.id)}
                              className="px-3 py-1 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm"
                            >
                              Cancel
                            </button>
                            <button className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded">
                              Save Notes
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Plan Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Plan Information</h3>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Field</p>
                <p className="font-medium text-gray-900 dark:text-white">{plan.field?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Plan Type</p>
                <p className="font-medium text-gray-900 dark:text-white capitalize">
                  {plan.planType.replace('_', ' ')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Duration</p>
                <p className="font-medium text-gray-900 dark:text-white">{plan.duration} days</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {new Date(plan.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Objectives */}
          {plan.objectives && plan.objectives.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Objectives</h3>
              <ul className="space-y-2">
                {plan.objectives.map((objective, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300 text-sm">{objective}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* AI Recommendations */}
          {plan.aiRecommendations && plan.aiRecommendations.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">AI Recommendations</h3>
              <div className="space-y-3">
                {plan.aiRecommendations.map((rec, index) => (
                  <div key={index} className="border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-900 dark:text-blue-100 capitalize">
                        {rec.category}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(rec.priority)}`}>
                        {rec.priority}
                      </span>
                    </div>
                    <p className="text-blue-800 dark:text-blue-200 text-sm mb-2">{rec.recommendation}</p>
                    {rec.reasoning && (
                      <p className="text-blue-600 dark:text-blue-400 text-xs">{rec.reasoning}</p>
                    )}
                    {rec.confidence && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs text-blue-600 dark:text-blue-400">
                          <span>Confidence</span>
                          <span>{rec.confidence}%</span>
                        </div>
                        <div className="w-full bg-blue-100 dark:bg-blue-900/20 rounded-full h-1 mt-1">
                          <div 
                            className="bg-blue-500 h-1 rounded-full"
                            style={{ width: `${rec.confidence}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resource Requirements */}
          {plan.resourceRequirements && plan.resourceRequirements.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Resource Requirements</h3>
              <div className="space-y-3">
                {plan.resourceRequirements.map((resource, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{resource.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {resource.totalQuantity} {resource.unit}
                      </p>
                    </div>
                    {resource.estimatedCost && (
                      <div className="text-right">
                        <p className="font-medium text-gray-900 dark:text-white">
                          ₹{resource.estimatedCost.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{resource.timing}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlanDetails;