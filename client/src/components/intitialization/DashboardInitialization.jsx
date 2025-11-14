// client/src/components/initialization/DashboardInitialization.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  Brain, 
  CheckCircle, 
  Loader2, 
  Sparkles,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  ChevronRight
} from 'lucide-react';
import { authAPI } from '../../services/api';

const DashboardInitialization = ({ onComplete, onboardingData }) => {
  const [status, setStatus] = useState('initializing'); // initializing, processing, completed, failed
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [jobId, setJobId] = useState(null);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const pollingIntervalRef = useRef(null);
  const timeoutRef = useRef(null);

  const steps = [
    {
      id: 'analyzing',
      title: 'Analyzing Your Farm',
      description: 'Processing field data and location information',
      icon: Brain,
      duration: 8000
    },
    {
      id: 'recommendations',
      title: 'Generating Recommendations',
      description: 'Creating personalized farming strategies',
      icon: Sparkles,
      duration: 12000
    },
    {
      id: 'tasks',
      title: 'Creating Task Schedule',
      description: 'Building your customized action plan',
      icon: TrendingUp,
      duration: 10000
    },
    {
      id: 'alerts',
      title: 'Setting Up Alerts',
      description: 'Configuring intelligent monitoring',
      icon: AlertTriangle,
      duration: 5000
    }
  ];

  useEffect(() => {
    startInitialization();
    
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const startInitialization = async () => {
    try {
      setStatus('processing');
      
      // Call the initialization API
      const response = await authAPI.initializeFarm(onboardingData);
      
      if (response.data.success) {
        setJobId(response.data.jobId);
        startPolling(response.data.jobId);
        animateProgress();
      } else {
        throw new Error('Failed to start initialization');
      }
    } catch (err) {
      console.error('Initialization error:', err);
      handleError(err);
    }
  };

  const startPolling = (id) => {
    // Poll every 2 seconds
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const response = await authAPI.getInitializationStatus(id);
        
        if (response.data.success) {
          const { status: jobStatus, currentStep: step, progress: prog } = response.data.data;
          
          // Update progress from server
          if (prog) {
            setProgress(prog);
          }
          
          // Update current step
          if (step) {
            const stepIndex = steps.findIndex(s => s.id === step);
            if (stepIndex !== -1) {
              setCurrentStep(stepIndex);
            }
          }
          
          // Check if completed
          if (jobStatus === 'completed') {
            handleCompletion();
          } else if (jobStatus === 'failed') {
            throw new Error('Initialization failed on server');
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
        // Don't fail immediately on polling errors, might be temporary network issue
      }
    }, 2000);

    // Set timeout for 90 seconds
    timeoutRef.current = setTimeout(() => {
      if (status !== 'completed') {
        handleTimeout();
      }
    }, 90000);
  };

  const animateProgress = () => {
    let currentProgress = 0;
    const totalDuration = steps.reduce((sum, step) => sum + step.duration, 0);
    const interval = 100; // Update every 100ms
    
    const progressInterval = setInterval(() => {
      currentProgress += (100 / (totalDuration / interval));
      
      if (currentProgress >= 100) {
        clearInterval(progressInterval);
        currentProgress = 100;
      }
      
      setProgress(Math.min(currentProgress, 100));
      
      // Update current step based on progress
      const stepIndex = Math.floor((currentProgress / 100) * steps.length);
      setCurrentStep(Math.min(stepIndex, steps.length - 1));
    }, interval);
  };

  const handleCompletion = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    setStatus('completed');
    setProgress(100);
    setCurrentStep(steps.length);
    
    // Wait a bit to show completion, then redirect
    setTimeout(() => {
      onComplete();
    }, 2000);
  };

  const handleError = (err) => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    setStatus('failed');
    setError(err.response?.data?.error || 'Failed to initialize your farm dashboard');
  };

  const handleTimeout = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    
    setStatus('failed');
    setError('Initialization is taking longer than expected. You can skip and complete this later.');
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setError(null);
    setStatus('initializing');
    setProgress(0);
    setCurrentStep(0);
    startInitialization();
  };

  const handleSkip = () => {
    // Complete with basic setup
    onComplete(true); // true indicates skipped
  };

  if (status === 'failed') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-8">
          <div className="text-center">
            <div className="bg-red-100 dark:bg-red-900/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <AlertTriangle size={32} className="text-red-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Initialization Issue
            </h2>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error}
            </p>
            
            <div className="space-y-3">
              {retryCount < 2 && (
                <button
                  onClick={handleRetry}
                  className="w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                >
                  <RefreshCw size={18} />
                  <span>Try Again</span>
                </button>
              )}
              
              <button
                onClick={handleSkip}
                className="w-full flex items-center justify-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
              >
                <ChevronRight size={18} />
                <span>Continue with Basic Setup</span>
              </button>
            </div>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
              Don't worry! You can always re-run AI analysis from your account settings.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'completed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-8">
          <div className="text-center">
            <div className="bg-green-100 dark:bg-green-900/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center animate-bounce">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              All Set! 🎉
            </h2>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your personalized farm dashboard is ready with AI-powered recommendations!
            </p>
            
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <p className="text-green-700 dark:text-green-300 text-sm">
                ✓ Field analysis complete<br />
                ✓ Task schedule created<br />
                ✓ Smart alerts configured<br />
                ✓ Yield predictions generated
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-8">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Brain size={32} className="text-white animate-pulse" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Setting Up Your Farm
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400">
            Our AI is analyzing your farm data and creating personalized recommendations...
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Progress
            </span>
            <span className="text-sm font-medium text-green-600 dark:text-green-400">
              {Math.round(progress)}%
            </span>
          </div>
          
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-green-600 to-blue-600 h-full rounded-full transition-all duration-500 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const isPending = index > currentStep;

            return (
              <div
                key={step.id}
                className={`flex items-start space-x-4 p-4 rounded-lg border-2 transition-all duration-300 ${
                  isCompleted
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : isCurrent
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50'
                }`}
              >
                <div className={`flex-shrink-0 rounded-full p-2 ${
                  isCompleted
                    ? 'bg-green-600 text-white'
                    : isCurrent
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                }`}>
                  {isCompleted ? (
                    <CheckCircle size={20} />
                  ) : isCurrent ? (
                    <Icon size={20} className="animate-pulse" />
                  ) : (
                    <Icon size={20} />
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className={`font-semibold ${
                    isCompleted || isCurrent
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {step.title}
                  </h3>
                  <p className={`text-sm ${
                    isCompleted || isCurrent
                      ? 'text-gray-600 dark:text-gray-300'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}>
                    {step.description}
                  </p>
                </div>

                {isCurrent && (
                  <Loader2 size={20} className="text-blue-600 animate-spin flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Sparkles size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                What's Happening?
              </h4>
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                Our AI is analyzing your {onboardingData.fields?.length || 0} field(s), 
                considering soil type, crop selection, location, and growth stage to create 
                a personalized farming plan with actionable tasks and predictions.
              </p>
            </div>
          </div>
        </div>

        {/* Estimated Time */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            This usually takes 30-45 seconds • Please don't close this window
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardInitialization;