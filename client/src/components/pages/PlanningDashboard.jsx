// client/src/components/pages/PlanningDashboard.jsx (Updated for your API)
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Filter,
  Search,
  Download,
  Eye,
  Edit3,
  TrendingUp,
  Trash2,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useField } from '../../contexts/FieldContext';
import { plansAPI } from '../../services/api';
import FieldSelector from '../common/FieldSelector';

const PlanningDashboard = () => {
  const navigate = useNavigate();
  const { selectedField, hasFields } = useField();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    pending: 0,
    avgProgress: 0
  });

  useEffect(() => {
    if (hasFields) {
      loadPlans();
    }
  }, [hasFields, selectedField]);

  const loadPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {};
      if (selectedField) {
        params.fieldId = selectedField.id;
      }
      
      const response = await plansAPI.getAllPlans(params);
      
      // Handle the response structure from your API
      if (response.data.success) {
        const plansData = response.data.data || [];
        setPlans(plansData);
        
        // Calculate stats from the plans data
        const stats = {
          total: plansData.length,
          active: plansData.filter(p => p.status === 'active').length,
          completed: plansData.filter(p => p.status === 'completed').length,
          pending: plansData.filter(p => p.status === 'draft' || p.status === 'pending').length,
          avgProgress: plansData.length > 0 ? 
            Math.round(plansData.reduce((acc, p) => acc + (p.progress || 0), 0) / plansData.length) : 0
        };
        setStats(stats);
      } else {
        throw new Error(response.data.error || 'Failed to fetch plans');
      }
    } catch (err) {
      console.error('Error loading plans:', err);
      setError('Failed to load plans. Please check your connection and try again.');
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlan = async (planId) => {
    if (!window.confirm('Are you sure you want to delete this plan? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await plansAPI.deletePlan(planId);
      if (response.data.success) {
        loadPlans(); // Refresh the plans list
      } else {
        alert('Failed to delete plan');
      }
    } catch (err) {
      console.error('Error deleting plan:', err);
      alert('Failed to delete plan');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300';
      case 'completed':
        return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300';
      case 'pending':
      case 'draft':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300';
      case 'overdue':
        return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'complete_season':
        return '🌾';
      case 'irrigation':
        return '💧';
      case 'fertilizer':
        return '🌱';
      case 'pest_control':
        return '🐛';
      case 'soil_health':
        return '🌍';
      case 'harvest_prep':
        return '🚜';
      default:
        return '📋';
    }
  };

  const filteredPlans = plans.filter(plan => {
    const matchesStatus = filterStatus === 'all' || plan.status === filterStatus;
    const matchesSearch = plan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (plan.fieldName && plan.fieldName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  if (!hasFields) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
            <Calendar size={32} className="text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-black dark:text-white mb-2">
            No Fields Available
          </h2>
          <p className="text-black dark:text-white opacity-70 mb-6">
            You need to add fields before creating farming plans.
          </p>
          <button
            onClick={() => navigate('/fields')}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Add Fields
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black dark:text-white">
            Farm Planning Dashboard
          </h1>
          <p className="text-black dark:text-white opacity-70">
            Create and manage AI-powered farming plans for optimal yields
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={() => navigate('/plans/new')}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus size={16} />
            <span>Create New Plan</span>
          </button>
        </div>
      </div>

      {/* Field Selector */}
      <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-black dark:border-white p-6">
        <h2 className="text-lg font-semibold text-black dark:text-white mb-4">
          Planning for Field
        </h2>
        <FieldSelector className="max-w-md" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-black dark:border-white p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 dark:bg-blue-900/20 rounded-lg p-3">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-black dark:text-white opacity-70">Total Plans</p>
              <p className="text-2xl font-bold text-black dark:text-white">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-black dark:border-white p-6">
          <div className="flex items-center">
            <div className="bg-green-100 dark:bg-green-900/20 rounded-lg p-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-black dark:text-white opacity-70">Active Plans</p>
              <p className="text-2xl font-bold text-black dark:text-white">{stats.active}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-black dark:border-white p-6">
          <div className="flex items-center">
            <div className="bg-yellow-100 dark:bg-yellow-900/20 rounded-lg p-3">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-black dark:text-white opacity-70">Pending</p>
              <p className="text-2xl font-bold text-black dark:text-white">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-black dark:border-white p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-3">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-black dark:text-white opacity-70">Avg Progress</p>
              <p className="text-2xl font-bold text-black dark:text-white">{stats.avgProgress}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle size={16} className="text-red-500" />
            <span className="text-red-700 dark:text-red-300 text-sm">{error}</span>
            <button
              onClick={loadPlans}
              className="ml-auto text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-black dark:border-white p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter size={16} className="text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="draft">Draft</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search plans..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            <button 
              onClick={loadPlans}
              className="flex items-center space-x-2 text-black dark:text-white opacity-70 hover:text-gray-800 dark:hover:text-gray-200"
            >
              <Download size={16} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Plans List */}
      <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-black dark:border-white">
        <div className="p-6 border-b border-black dark:border-white">
          <h2 className="text-lg font-semibold text-black dark:text-white">
            Your Plans ({filteredPlans.length})
          </h2>
        </div>

        {loading ? (
          <div className="p-6">
            <div className="flex items-center justify-center py-8">
              <Loader2 size={32} className="text-green-600 animate-spin" />
              <span className="ml-2 text-black dark:text-white opacity-70">Loading plans...</span>
            </div>
          </div>
        ) : filteredPlans.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-black dark:text-white mb-2">
              No plans found
            </h3>
            <p className="text-black dark:text-white opacity-70 mb-6">
              {filterStatus === 'all' ? 
                "Create your first farming plan to get started." :
                `No plans with status "${filterStatus}" found.`
              }
            </p>
            <button
              onClick={() => navigate('/plans/new')}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Create New Plan
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredPlans.map((plan) => (
              <div key={plan.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="text-2xl">{getTypeIcon(plan.planType)}</div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-black dark:text-white">
                          {plan.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(plan.status)}`}>
                          {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-6 text-sm text-black dark:text-white opacity-60 mb-3">
                        <span>Field: {plan.fieldName || 'Unknown Field'}</span>
                        <span>{plan.tasksCompleted || 0}/{plan.tasksTotal || 0} tasks completed</span>
                        <span>{new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}</span>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-black dark:text-white opacity-70">Progress</span>
                          <span className="font-medium text-black dark:text-white">{plan.progress || 0}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${plan.progress || 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => navigate(`/plans/${plan.id}`)}
                      className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      title="View Plan"
                    >
                      <Eye size={16} />
                    </button>
                    <button 
                      className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                      title="Edit Plan"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeletePlan(plan.id)}
                      className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      title="Delete Plan"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanningDashboard;