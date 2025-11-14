// client/src/components/layout/Header.jsx (Enhanced)
import React, { useState } from 'react';
import { Menu, Sun, Moon, X, Sprout, Bell, Settings } from 'lucide-react';
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
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left section */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onMenuToggle}
              className="md:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <div className="flex items-center space-x-3">
              <div className="bg-green-600 text-white p-2 rounded-lg">
                <Sprout size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  FARMER'S DESK
                </h1>
                <div className="hidden sm:block text-xs text-gray-500 dark:text-gray-400">
                  Smart Agriculture Platform
                </div>
              </div>
            </div>
          </div>

          {/* Center section - Field Selector (only show if user has fields) */}
          {hasFields && (
            <div className="hidden lg:flex flex-1 max-w-md mx-8">
              <FieldSelector variant="compact" className="w-full" />
            </div>
          )}

          {/* Right section */}
          <div className="flex items-center space-x-3">
            {/* Field info for mobile/tablet */}
            {hasFields && selectedField && (
              <div className="lg:hidden flex items-center space-x-2 text-sm">
                <div className="bg-green-100 dark:bg-green-900/20 p-1.5 rounded">
                  <Sprout size={14} className="text-green-600 dark:text-green-400" />
                </div>
                <span className="font-medium text-gray-900 dark:text-white truncate max-w-24">
                  {selectedField.name}
                </span>
              </div>
            )}

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors relative"
              >
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  3
                </span>
              </button>

              {/* Notifications dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    <div className="p-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                      <div className="flex items-start space-x-3">
                        <div className="bg-red-100 dark:bg-red-900/20 p-2 rounded-lg">
                          <Bell size={16} className="text-red-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            Pest Alert: Field 1
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Early signs of aphid infestation detected
                          </p>
                          <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                      <div className="flex items-start space-x-3">
                        <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-lg">
                          <Settings size={16} className="text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            Irrigation Scheduled
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Auto-irrigation starts at 6 AM tomorrow
                          </p>
                          <p className="text-xs text-gray-400 mt-1">1 day ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                    <button className="w-full text-center text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile field selector */}
        {hasFields && (
          <div className="lg:hidden pb-3 border-t border-gray-200 dark:border-gray-700 pt-3">
            <FieldSelector variant="compact" className="w-full" />
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;