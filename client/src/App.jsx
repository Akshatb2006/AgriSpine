import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { FieldProvider } from './contexts/FieldContext';
import Layout from './components/layout/Layout';
import Login from './components/auth/Login';
import Onboarding from './components/onboarding/Onboarding';
import DashboardInitialization from './components/intitialization/DashboardInitialization';
import Dashboard from './components/pages/Dashboard';
import MyFields from './components/pages/MyFields';
import PlanningDashboard from './components/pages/PlanningDashboard';
import CreatePlan from './components/pages/CreatePlan';
import Account from './components/pages/Account';
import CropPrediction from './components/pages/CropPrediction';
import PredictionResults from './components/pages/PredictionResults';
import PlanDetails from './components/pages/PlanDetails';
import PredictionsDashboard from './components/pages/PredictionsDashboard';
import { authAPI } from './services/api';

function App() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Onboarding state
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  
  // Initialization state
  const [needsInitialization, setNeedsInitialization] = useState(false);
  const [onboardingData, setOnboardingData] = useState(null);
  
  // Loading state
  const [loading, setLoading] = useState(true);

  // Check authentication and user status on mount
  useEffect(() => {
    checkAuthAndStatus();
  }, []);

  /**
   * Check if user is authenticated and determine their status
   */
  const checkAuthAndStatus = async () => {
    try {
      const authStatus = localStorage.getItem('farmer-auth');
      const token = localStorage.getItem('farmer-token');
      
      if (authStatus === 'true' && token) {
        // User has auth credentials, fetch their profile
        try {
          const response = await authAPI.getProfile();
          const user = response.data.data;
          
          console.log('User profile loaded:', {
            onboardingCompleted: user.onboardingCompleted,
            initializationStatus: user.initializationStatus
          });
          
          setIsAuthenticated(true);
          
          // Determine what screen to show
          if (!user.onboardingCompleted) {
            // User needs to complete onboarding
            console.log('User needs onboarding');
            setNeedsOnboarding(true);
            setNeedsInitialization(false);
          } 
          else if (user.initializationStatus === 'pending' || user.initializationStatus === 'processing') {
            // User completed onboarding but initialization is not done
            console.log('User needs initialization');
            setNeedsOnboarding(false);
            setNeedsInitialization(true);
          } 
          else {
            // User is fully set up
            console.log('User is fully set up');
            setNeedsOnboarding(false);
            setNeedsInitialization(false);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          // Clear invalid auth credentials
          localStorage.removeItem('farmer-auth');
          localStorage.removeItem('farmer-token');
          setIsAuthenticated(false);
          setNeedsOnboarding(false);
          setNeedsInitialization(false);
        }
      } else {
        // No auth credentials
        setIsAuthenticated(false);
        setNeedsOnboarding(false);
        setNeedsInitialization(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
      setNeedsOnboarding(false);
      setNeedsInitialization(false);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle successful login
   */
  const handleLogin = async (token) => {
    console.log('Login successful, saving token');
    
    localStorage.setItem('farmer-auth', 'true');
    localStorage.setItem('farmer-token', token);
    setIsAuthenticated(true);
    
    // Check user's onboarding status
    try {
      const response = await authAPI.getProfile();
      const user = response.data.data;
      
      console.log('User status after login:', {
        onboardingCompleted: user.onboardingCompleted,
        initializationStatus: user.initializationStatus
      });
      
      if (!user.onboardingCompleted) {
        setNeedsOnboarding(true);
        setNeedsInitialization(false);
      } else if (user.initializationStatus === 'pending' || user.initializationStatus === 'processing') {
        setNeedsOnboarding(false);
        setNeedsInitialization(true);
      } else {
        setNeedsOnboarding(false);
        setNeedsInitialization(false);
      }
    } catch (error) {
      console.error('Error fetching user profile after login:', error);
      // Assume new user needs onboarding
      setNeedsOnboarding(true);
      setNeedsInitialization(false);
    }
  };

  /**
   * Handle logout
   */
  const handleLogout = () => {
    console.log('Logging out...');
    
    // Clear all local storage
    localStorage.removeItem('farmer-auth');
    localStorage.removeItem('farmer-token');
    localStorage.removeItem('farmer-selected-field');
    
    // Reset all state
    setIsAuthenticated(false);
    setNeedsOnboarding(false);
    setNeedsInitialization(false);
    setOnboardingData(null);
  };

  /**
   * Handle onboarding completion
   * This is called when user clicks "Complete Setup" in onboarding
   */
  const handleOnboardingComplete = (data) => {
    console.log('✅ Onboarding completed!');
    console.log('Onboarding data:', data);
    console.log('Transitioning to initialization screen...');
    
    // Store the onboarding data for initialization
    setOnboardingData(data);
    
    // Mark onboarding as complete
    setNeedsOnboarding(false);
    
    // Show initialization screen
    setNeedsInitialization(true);
  };

  /**
   * Handle initialization completion
   * This is called when AI initialization finishes or is skipped
   */
  const handleInitializationComplete = (skipped = false) => {
    console.log('✅ Initialization completed!');
    console.log('Was skipped:', skipped);
    
    // Clear initialization state
    setNeedsInitialization(false);
    setOnboardingData(null);
    
    if (skipped) {
      console.log('⚠️ User skipped initialization - using basic setup');
    } else {
      console.log('✨ AI initialization completed successfully');
    }
    
    // Force reload to fetch fresh data from database
    console.log('Reloading to fetch fresh data...');
    window.location.reload();
  };

  // Show loading screen while checking auth status
  if (loading) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  return (
  <ThemeProvider>
    <Router>
      {!isAuthenticated ? (
        <Login onLogin={handleLogin} />
      ) : needsOnboarding ? (
        <Onboarding onComplete={handleOnboardingComplete} />
      ) : needsInitialization ? (
        <DashboardInitialization 
          onComplete={handleInitializationComplete}
          onboardingData={onboardingData}
        />
      ) : (
        <FieldProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/fields" element={<MyFields />} />
              <Route path="/planning" element={<Navigate to="/plans" replace />} />
              <Route path="/plans" element={<PlanningDashboard />} />
              <Route path="/plans/new" element={<CreatePlan />} />
              <Route path="/plans/:planId" element={<PlanDetails />} />
              <Route path="/prediction" element={<PredictionsDashboard />} />
              <Route path="/predictions" element={<Navigate to="/prediction" replace />} />
              <Route path="/predictions/new" element={<CropPrediction />} />
              <Route path="/prediction-results/:predictionId" element={<PredictionResults />} />
              <Route path="/account" element={<Account onLogout={handleLogout} />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Layout>
        </FieldProvider>
      )}
    </Router>
  </ThemeProvider>
);
}

export default App;
