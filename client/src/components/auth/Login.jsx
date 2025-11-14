import React, { useState, useEffect, useRef } from 'react';
import { Mail, Lock, User, Phone, Sprout, Sun, Moon, X, AlertCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { authAPI } from '../../services/api';

const usePersistedError = () => {
  const [error, setError] = useState('');
  const [showError, setShowError] = useState(false);
  const timerRef = useRef(null);
  const errorIdRef = useRef(0);

  const showErrorMessage = (message) => {
    console.log('Showing error:', message);
    
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    errorIdRef.current += 1;
    const currentErrorId = errorIdRef.current;
    
    setError(message);
    setShowError(true);
    
    // Set new timer with error ID tracking
    timerRef.current = setTimeout(() => {
      // Only hide if this is still the current error
      if (currentErrorId === errorIdRef.current) {
        console.log('Auto-hiding error after timeout');
        setShowError(false);
        setTimeout(() => {
          if (currentErrorId === errorIdRef.current) {
            setError('');
          }
        }, 300);
      }
    }, 10000); // 10 seconds
  };

  const hideError = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setShowError(false);
    setTimeout(() => setError(''), 300);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return { error, showError, showErrorMessage, hideError };
};

const Login = ({ onLogin }) => {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(false);
  const { error, showError, showErrorMessage, hideError } = usePersistedError();
  const { isDark, toggleTheme } = useTheme();

  const handleModeSwitch = (newMode) => {
    setMode(newMode);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);
    
    try {
      const { data } = await authAPI.login({ email, password });
      localStorage.setItem('farmer-token', data.token);
      localStorage.setItem('farmer-auth', 'true');
      hideError();
      onLogin(data.token);
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.error || 'Invalid email or password. Please try again.';
      showErrorMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);
    
    try {
      await authAPI.signup({ name, email, password, phoneNumber, language });
      const { data } = await authAPI.login({ email, password });
      localStorage.setItem('farmer-token', data.token);
      localStorage.setItem('farmer-auth', 'true')
      hideError();
      onLogin(data.token);
    } catch (err) {
      console.error('Signup error:', err);
      const errorMessage = err.response?.data?.error || 'Failed to create account. Please check your information and try again.';
      showErrorMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 transition-colors">
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors z-40"
      >
        {isDark ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      {/* Toast Error Message */}
      {error && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ease-in-out ${
          showError ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-4 opacity-0 scale-95'
        }`}>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 shadow-lg max-w-md min-w-80">
            <div className="flex items-start space-x-3">
              <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-700 dark:text-red-300 text-sm font-medium">
                  {mode === 'login' ? 'Login Failed' : 'Registration Failed'}
                </p>
                <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                  {error}
                </p>
              </div>
              <button
                onClick={hideError}
                className="text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors flex-shrink-0"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-green-600 text-white p-4 rounded-full">
              <Sprout size={32} />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            FARMER'S DESK
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Smart farming at your fingertips
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
          <div className="flex mb-6 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <button
              className={`flex-1 py-2 transition-colors ${mode === 'login' ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
              onClick={() => handleModeSwitch('login')}
              disabled={loading}
            >
              Login
            </button>
            <button
              className={`flex-1 py-2 transition-colors ${mode === 'signup' ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
              onClick={() => handleModeSwitch('signup')}
              disabled={loading}
            >
              Sign Up
            </button>
          </div>

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    placeholder="you@example.com"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    placeholder="••••••••"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Logging in...</span>
                  </div>
                ) : (
                  'Login'
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    placeholder="Your name"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    placeholder="you@example.com"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    placeholder="••••••••"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number (optional)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    placeholder="Enter your phone number"
                    disabled={loading}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Language</label>
                <select
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full py-3 px-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  disabled={loading}
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="or">Odia</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={loading || !name || !email || !password}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating account...</span>
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;