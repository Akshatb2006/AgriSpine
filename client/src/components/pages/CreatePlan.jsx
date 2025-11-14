// client/src/components/pages/CreatePlan.jsx (Updated for your API)
import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Save, 
  Loader2,
  CheckCircle,
  AlertCircle,
  Clock,
  Target,
  Brain,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useField } from '../../contexts/FieldContext';
import { plansAPI } from '../../services/api';
import FieldSelector from '../common/FieldSelector';

const CreatePlan = () => {
  const navigate = useNavigate();
  const { selectedField, hasFields } = useField();
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [createdPlanId, setCreatedPlanId] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    planType: '',
    duration: '30',
    startDate: '',
    objectives: [],
    customObjective: '',
    priority: 'medium',
    notes: ''
  });
  const [errors, setErrors] = useState({});

  const planTypes = [
    {
      id: 'complete_season',
      name: 'Complete Season Plan',
      description: 'Comprehensive plan from planting to harvest',
      duration: '120-150 days',
      icon: '🌾'
    },
    {
      id: 'irrigation',
      name: 'Irrigation Schedule',
      description: 'Optimized watering schedule based on crop needs',
      duration: '30-90 days',
      icon: '💧'
    },
    {
      id: 'fertilizer',
      name: 'Fertilizer Program',
      description: 'Nutrient management plan for optimal growth',
      duration: '60-90 days',
      icon: '🌱'
    },
    {
      id: 'pest_control',
      name: 'Pest Management',
      description: 'Integrated pest control strategy',
      duration: '30-60 days',
      icon: '🐛'
    },
    {
      id: 'soil_health',
      name: 'Soil Improvement',
      description: 'Soil health enhancement program',
      duration: '90-120 days',
      icon: '🌍'
    },
    {
      id: 'harvest_prep',
      name: 'Harvest Preparation',
      description: 'Pre-harvest planning and scheduling',
      duration: '15-30 days',
      icon: '🚜'
    }
  ];

  const objectives = [
    'Maximize yield potential',
    'Optimize water usage',
    'Reduce pest damage',
    'Improve soil health',
    'Minimize input costs',
    'Enhance crop quality',
    'Sustainable practices',
    'Risk mitigation'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleObjectiveToggle = (objective) => {
    setFormData(prev => ({
      ...prev,
      objectives: prev.objectives.includes(objective)
        ? prev.objectives.filter(o => o !== objective)
        : [...prev.objectives, objective]
    }));
  };

  const addCustomObjective = () => {
    if (formData.customObjective.trim() && !formData.objectives.includes(formData.customObjective.trim())) {
      setFormData(prev => ({
        ...prev,
        objectives: [...prev.objectives, prev.customObjective.trim()],
        customObjective: ''
      }));
    }
  };

  const removeObjective = (objective) => {
    setFormData(prev => ({
      ...prev,
      objectives: prev.objectives.filter(o => o !== objective)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Plan title is required';
    }

    if (!formData.planType) {
      newErrors.planType = 'Please select a plan type';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (formData.objectives.length === 0) {
      newErrors.objectives = 'Please select at least one objective';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Fixed CreatePlan.jsx - handleSubmit function
const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateForm()) return;
  if (!selectedField) {
    setErrors({ submit: 'Please select a field first' });
    return;
  }

  setLoading(true);
  setLoadingStep('Validating plan data...');
  
  try {
    const planPayload = {
      title: formData.title,
      planType: formData.planType,
      fieldId: selectedField.id,
      startDate: formData.startDate,
      duration: parseInt(formData.duration),
      priority: formData.priority,
      objectives: formData.objectives,
      notes: formData.notes
    };

    // Step 1: Create plan
    setLoadingStep('Creating plan structure...');
    const response = await plansAPI.createPlan(planPayload);
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to create plan');
    }

    const planId = response.data.data.id;
    console.log('Plan created with ID:', planId);

    // Step 2: Poll for plan completion
    setLoadingStep('Generating AI recommendations...');
    const completedPlan = await pollForPlanCompletion(planId);
    
    if (completedPlan) {
      setLoadingStep('Plan created successfully!');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      navigate(`/plans/${planId}`, { 
        state: { 
          message: 'Plan created successfully!',
          isNew: true
        }
      });
    } else {
      // If polling timed out, still redirect but show a message
      setLoadingStep('Plan created - tasks are still being generated...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      navigate(`/plans/${planId}`, { 
        state: { 
          message: 'Plan created successfully! Tasks are being generated.',
          isNew: true,
          stillGenerating: true
        }
      });
    }

  } catch (error) {
    console.error('Plan creation error:', error);
    setErrors({ submit: error.message || 'Failed to create plan. Please try again.' });
  } finally {
    setLoading(false);
    setLoadingStep('');
  }
};

// Add this new function to poll for plan completion
const pollForPlanCompletion = async (planId, maxAttempts = 60) => { // Increased to 2 minutes
  console.log(`Starting to poll for plan ${planId} completion...`);
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // Use the lighter status endpoint instead of full plan data
      const response = await plansAPI.getPlanStatus(planId);
      
      if (response.data.success) {
        const planStatus = response.data.data;
        console.log(`Poll attempt ${attempt}: Status = ${planStatus.status}, Tasks = ${planStatus.taskCount}`);
        
        // Check if plan is ready - must have tasks AND not be processing
        if (planStatus.status === 'active' && planStatus.taskCount > 0) {
          console.log('Plan generation completed successfully');
          return planStatus;
        }
        
        // Check if plan failed
        if (planStatus.status === 'draft' && attempt > 5) {
          console.warn('Plan appears to have failed generation, checking tasks...');
          // Sometimes basic tasks are generated even if AI fails
          if (planStatus.taskCount > 0) {
            console.log('Plan has basic tasks, considering complete');
            return planStatus;
          }
        }
        
        // Update loading message based on plan status and progress
        if (planStatus.status === 'processing') {
          if (attempt < 10) {
            setLoadingStep('AI is analyzing your field and objectives...');
          } else if (attempt < 20) {
            setLoadingStep('Generating optimized task schedule...');
          } else if (attempt < 30) {
            setLoadingStep('Creating detailed recommendations...');
          } else {
            setLoadingStep('Finalizing your farming plan...');
          }
        } else if (planStatus.status === 'active' && planStatus.taskCount === 0) {
          setLoadingStep('Generating tasks for your plan...');
        }
      }
      
      // Wait before next poll - shorter intervals initially, then longer
      const waitTime = attempt < 10 ? 1000 : (attempt < 30 ? 2000 : 3000);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      
    } catch (error) {
      console.warn(`Plan polling attempt ${attempt} failed:`, error.message);
      
      // If status endpoint fails, try the full endpoint as fallback
      try {
        const fallbackResponse = await plansAPI.getPlan(planId);
        if (fallbackResponse.data.success) {
          const plan = fallbackResponse.data.data;
          console.log(`Fallback poll: Status = ${plan.status}, Tasks = ${plan.tasks?.length || 0}`);
          
          if ((plan.status === 'active' || plan.status === 'draft') && plan.tasks && plan.tasks.length > 0) {
            console.log('Plan generation completed (via fallback check)');
            return { 
              status: plan.status, 
              taskCount: plan.tasks.length,
              isReady: true 
            };
          }
        }
      } catch (fallbackError) {
        console.warn('Fallback plan check also failed:', fallbackError.message);
      }
      
      // Shorter wait time for failed attempts
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
  }
  
  // If we reach here, polling timed out
  console.warn('Plan generation polling timed out after 2 minutes');
  
  // Do one final check to see if we have any tasks
  try {
    const finalCheck = await plansAPI.getPlan(planId);
    if (finalCheck.data.success && finalCheck.data.data.tasks?.length > 0) {
      console.log('Final check found tasks, considering complete');
      return {
        status: finalCheck.data.data.status,
        taskCount: finalCheck.data.data.tasks.length,
        isReady: true
      };
    }
  } catch (error) {
    console.warn('Final check failed:', error.message);
  }
  
  return null; // Indicates timeout
};

  // Clean up polling on component unmount
  React.useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

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
    <div className="max-w-4xl mx-auto">
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-black rounded-lg p-8 max-w-md mx-4 text-center">
            <div className="bg-green-100 dark:bg-green-900/20 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <div className="relative">
                <Loader2 size={32} className="text-green-600 animate-spin" />
                <Brain size={16} className="text-green-700 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-black dark:text-white mb-2">
              Creating Your Plan
            </h3>
            <p className="text-black dark:text-white opacity-70 mb-4">
              {loadingStep}
            </p>
            
            {/* Progress Steps */}
            <div className="space-y-2">
              <div className="flex items-center space-x-3 text-sm">
                <CheckCircle size={16} className="text-green-600" />
                <span className="text-gray-700 dark:text-gray-300">Plan structure created</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <div className="relative">
                  {loadingStep.includes('analyzing') ? (
                    <Loader2 size={16} className="text-blue-600 animate-spin" />
                  ) : loadingStep.includes('generating') || loadingStep.includes('successfully') ? (
                    <CheckCircle size={16} className="text-green-600" />
                  ) : (
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                  )}
                </div>
                <span className="text-gray-700 dark:text-gray-300">Analyzing field data</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <div className="relative">
                  {loadingStep.includes('generating') ? (
                    <Loader2 size={16} className="text-blue-600 animate-spin" />
                  ) : loadingStep.includes('successfully') ? (
                    <CheckCircle size={16} className="text-green-600" />
                  ) : (
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                  )}
                </div>
                <span className="text-gray-700 dark:text-gray-300">Generating AI recommendations</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <div className="relative">
                  {loadingStep.includes('successfully') ? (
                    <CheckCircle size={16} className="text-green-600" />
                  ) : (
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                  )}
                </div>
                <span className="text-gray-700 dark:text-gray-300">Finalizing plan</span>
              </div>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mt-4">
              <div className="flex items-center space-x-2">
                <Sparkles size={16} className="text-blue-600" />
                <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                  AI is optimizing your plan for maximum efficiency
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/plans')}
          className="flex items-center space-x-2 text-black dark:text-white opacity-70 hover:text-gray-800 dark:hover:text-gray-200 transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          <span>Back to Plans</span>
        </button>
        
        <h1 className="text-2xl font-bold text-black dark:text-white mb-2">
          Create New Farming Plan
        </h1>
        <p className="text-black dark:text-white opacity-70">
          Generate an AI-powered farming plan tailored to your field and goals
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Field Selection */}
        <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-black dark:border-white p-6">
          <h2 className="text-lg font-semibold text-black dark:text-white mb-4">
            Select Field
          </h2>
          <FieldSelector />
          {selectedField && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle size={16} className="text-green-600" />
                <span className="text-green-800 dark:text-green-200 font-medium">
                  Creating plan for {selectedField.name}
                </span>
              </div>
              <p className="text-green-700 dark:text-green-300 text-sm mt-1">
                {selectedField.area} acres • {selectedField.crop || 'No crop set'} • {selectedField.soilType || 'Unknown soil'}
              </p>
            </div>
          )}
        </div>

        {/* Plan Type Selection */}
        <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-black dark:border-white p-6">
          <h2 className="text-lg font-semibold text-black dark:text-white mb-4">
            Choose Plan Type
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {planTypes.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => handleInputChange('planType', type.id)}
                className={`p-4 text-left border-2 rounded-lg transition-colors ${
                  formData.planType === type.id
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-black dark:border-white hover:border-green-300 dark:hover:border-green-600'
                }`}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-2xl">{type.icon}</span>
                  <h3 className="font-medium text-black dark:text-white">
                    {type.name}
                  </h3>
                </div>
                <p className="text-sm text-black dark:text-white opacity-70 mb-2">
                  {type.description}
                </p>
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-500">
                  <Clock size={12} className="mr-1" />
                  {type.duration}
                </div>
              </button>
            ))}
          </div>
          
          {errors.planType && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.planType}</p>
          )}
        </div>

        {/* Plan Details */}
        <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-black dark:border-white p-6">
          <h2 className="text-lg font-semibold text-black dark:text-white mb-4">
            Plan Details
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Plan Title */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Plan Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Spring Wheat Planting Plan 2024"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>
              )}
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.startDate}</p>
              )}
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Duration (days)
              </label>
              <select
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="15">15 days</option>
                <option value="30">30 days</option>
                <option value="60">60 days</option>
                <option value="90">90 days</option>
                <option value="120">120 days</option>
                <option value="150">150 days</option>
              </select>
            </div>

            {/* Priority */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Priority Level
              </label>
              <div className="flex space-x-4">
                {['low', 'medium', 'high'].map((priority) => (
                  <button
                    key={priority}
                    type="button"
                    onClick={() => handleInputChange('priority', priority)}
                    className={`flex items-center space-x-2 px-4 py-2 border-2 rounded-lg transition-colors ${
                      formData.priority === priority
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                        : 'border-black dark:border-white hover:border-green-300 dark:hover:border-green-600'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full ${
                      priority === 'low' ? 'bg-green-500' :
                      priority === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    <span className="capitalize font-medium">{priority}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Objectives */}
        <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-black dark:border-white p-6">
          <h2 className="text-lg font-semibold text-black dark:text-white mb-4">
            Plan Objectives *
          </h2>
          <p className="text-black dark:text-white opacity-70 text-sm mb-4">
            Select the main goals you want to achieve with this plan
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {objectives.map((objective) => (
              <button
                key={objective}
                type="button"
                onClick={() => handleObjectiveToggle(objective)}
                className={`flex items-center space-x-3 p-3 text-left border-2 rounded-lg transition-colors ${
                  formData.objectives.includes(objective)
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-black dark:border-white hover:border-green-300 dark:hover:border-green-600'
                }`}
              >
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  formData.objectives.includes(objective)
                    ? 'border-green-500 bg-green-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {formData.objectives.includes(objective) && (
                    <CheckCircle size={12} className="text-white" />
                  )}
                </div>
                <span className="font-medium text-black dark:text-white">
                  {objective}
                </span>
              </button>
            ))}
          </div>

          {/* Custom Objective */}
          <div className="flex space-x-3">
            <input
              type="text"
              value={formData.customObjective}
              onChange={(e) => handleInputChange('customObjective', e.target.value)}
              placeholder="Add custom objective..."
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCustomObjective();
                }
              }}
            />
            <button
              type="button"
              onClick={addCustomObjective}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Add
            </button>
          </div>

          {/* Selected Objectives */}
          {formData.objectives.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-black dark:text-white mb-2">
                Selected Objectives:
              </h4>
              <div className="flex flex-wrap gap-2">
                {formData.objectives.map((objective) => (
                  <span
                    key={objective}
                    className="flex items-center space-x-2 px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full text-sm"
                  >
                    <span>{objective}</span>
                    <button
                      type="button"
                      onClick={() => removeObjective(objective)}
                      className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {errors.objectives && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.objectives}</p>
          )}
        </div>

        {/* Additional Notes */}
        <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-black dark:border-white p-6">
          <h2 className="text-lg font-semibold text-black dark:text-white mb-4">
            Additional Notes
          </h2>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={4}
            placeholder="Any specific requirements, constraints, or additional information..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Error Display */}
        {errors.submit && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle size={16} className="text-red-500" />
              <span className="text-red-700 dark:text-red-300 text-sm">{errors.submit}</span>
            </div>
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex justify-between items-center pt-6 border-t border-black dark:border-white">
          <button
            type="button"
            onClick={() => navigate('/plans')}
            className="px-6 py-2 text-black dark:text-white opacity-70 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading || !selectedField}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Creating Plan...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Create Plan</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePlan;