import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useField } from '../../contexts/FieldContext';
import FieldSelector from '../common/FieldSelector';

const Header = ({ setSidebarOpen }) => {
  const { isDark, toggleTheme } = useTheme();
  const { hasFields, selectedField } = useField();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const onMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (setSidebarOpen) setSidebarOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-white dark:bg-black border-b border-black dark:border-white border-opacity-20 sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <button
              onClick={onMenuToggle}
              className="md:hidden p-2 rounded text-gray-900 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <span className="text-2xl">{isMobileMenuOpen ? '✕' : '☰'}</span>
            </button>

            <div className="flex items-center space-x-3">
              <div className="bg-black dark:bg-white text-white dark:text-black p-2 rounded">
                <span className="text-xl">🚜</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">
                  FARMER'S DESK
                </h1>
                <div className="hidden sm:block text-xs text-gray-600 dark:text-slate-400">
                  Smart Agriculture Platform
                </div>
              </div>
            </div>
          </div>

          {hasFields && (
            <div className="hidden lg:flex flex-1 max-w-md mx-8">
              <FieldSelector variant="compact" className="w-full" />
            </div>
          )}

          <div className="flex items-center space-x-3">
            {hasFields && selectedField && (
              <div className="lg:hidden flex items-center space-x-2 text-sm">
                <span className="text-lg">🌾</span>
                <span className="font-medium text-gray-900 dark:text-slate-100 truncate max-w-24">
                  {selectedField.name}
                </span>
              </div>
            )}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-slate-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors relative"
              >
                <span className="text-lg">🔔</span>
                <span className="absolute -top-1 -right-1 bg-black dark:bg-white text-white dark:text-black text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  3
                </span>
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-black border border-black dark:border-white border-opacity-30 rounded shadow-lg z-50">
                  <div className="p-4 border-b border-black dark:border-white border-opacity-20">
                    <h3 className="font-semibold text-gray-900 dark:text-slate-100">Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    <div className="p-3 border-b border-black dark:border-white border-opacity-10 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
                      <div className="flex items-start space-x-3">
                        <span className="text-xl">⚠️</span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                            Pest Alert: Field 1
                          </p>
                          <p className="text-xs text-gray-600 dark:text-slate-400">
                            Early signs of aphid infestation detected
                          </p>
                          <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">2 hours ago</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-3 border-b border-black dark:border-white border-opacity-10 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
                      <div className="flex items-start space-x-3">
                        <span className="text-xl">💧</span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                            Irrigation Scheduled
                          </p>
                          <p className="text-xs text-gray-600 dark:text-slate-400">
                            Auto-irrigation starts at 6 AM tomorrow
                          </p>
                          <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">1 day ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 border-t border-black dark:border-white border-opacity-20">
                    <button className="w-full text-center text-sm text-black dark:text-white hover:opacity-80 font-medium">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-slate-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <span className="text-lg">{isDark ? '☀️' : '🌙'}</span>
            </button>
          </div>
        </div>
        {hasFields && (
          <div className="lg:hidden pb-3 border-t border-black dark:border-white border-opacity-20 pt-3">
            <FieldSelector variant="compact" className="w-full" />
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;