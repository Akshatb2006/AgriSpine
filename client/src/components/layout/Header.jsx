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
    <header className="bg-white dark:bg-black border-b border-black dark:border-white sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8 dark:px-6 dark:sm:px-8">
        {/* Light mode: Left-aligned, Dark mode: Centered */}
        <div className="flex justify-between items-center h-16 dark:justify-center dark:relative">
          {/* Left section - Light mode only */}
          <div className="flex items-center space-x-4 dark:hidden">
            <button
              onClick={onMenuToggle}
              className="md:hidden p-2 rounded-md text-black hover:bg-gray-100 transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <div className="flex items-center space-x-3">
              <div className="bg-black text-white p-2 rounded-lg">
                <Sprout size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-black">
                  FARMER'S DESK
                </h1>
                <div className="hidden sm:block text-xs text-black opacity-70">
                  Smart Agriculture Platform
                </div>
              </div>
            </div>
          </div>

          {/* Dark mode: Centered logo */}
          <div className="hidden dark:flex items-center space-x-3">
            <div className="bg-white text-black p-2 rounded-lg">
              <Sprout size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                FARMER'S DESK
              </h1>
              <div className="hidden sm:block text-xs text-white opacity-70">
                Smart Agriculture Platform
              </div>
            </div>
          </div>

          {/* Center section - Field Selector (only show if user has fields) - Light mode only */}
          {hasFields && (
            <div className="hidden lg:flex flex-1 max-w-md mx-8 dark:hidden">
              <FieldSelector variant="compact" className="w-full" />
            </div>
          )}

          {/* Right section - Light mode: Right-aligned, Dark mode: Absolute positioned */}
          <div className="flex items-center space-x-3 dark:absolute dark:right-4">
            {/* Field info for mobile/tablet */}
            {hasFields && selectedField && (
              <div className="lg:hidden flex items-center space-x-2 text-sm dark:hidden">
                <div className="bg-black text-white p-1.5 rounded">
                  <Sprout size={14} />
                </div>
                <span className="font-medium text-black truncate max-w-24">
                  {selectedField.name}
                </span>
              </div>
            )}

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg bg-black dark:bg-white text-white dark:text-black hover:opacity-80 transition-opacity relative"
              >
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 bg-white dark:bg-black text-black dark:text-white text-xs rounded-full h-5 w-5 flex items-center justify-center border border-black dark:border-white">
                  3
                </span>
              </button>

              {/* Notifications dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-black border border-black dark:border-white rounded-lg shadow-lg z-50">
                  <div className="p-4 border-b border-black dark:border-white">
                    <h3 className="font-semibold text-black dark:text-white">Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    <div className="p-3 border-b border-black dark:border-white hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer">
                      <div className="flex items-start space-x-3">
                        <div className="bg-black dark:bg-white text-white dark:text-black p-2 rounded-lg">
                          <Bell size={16} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-black dark:text-white">
                            Pest Alert: Field 1
                          </p>
                          <p className="text-xs text-black dark:text-white opacity-70">
                            Early signs of aphid infestation detected
                          </p>
                          <p className="text-xs text-black dark:text-white opacity-50 mt-1">2 hours ago</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-3 border-b border-black dark:border-white hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer">
                      <div className="flex items-start space-x-3">
                        <div className="bg-black dark:bg-white text-white dark:text-black p-2 rounded-lg">
                          <Settings size={16} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-black dark:text-white">
                            Irrigation Scheduled
                          </p>
                          <p className="text-xs text-black dark:text-white opacity-70">
                            Auto-irrigation starts at 6 AM tomorrow
                          </p>
                          <p className="text-xs text-black dark:text-white opacity-50 mt-1">1 day ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 border-t border-black dark:border-white">
                    <button className="w-full text-center text-sm text-black dark:text-white hover:opacity-70 font-medium">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-black dark:bg-white text-white dark:text-black hover:opacity-80 transition-opacity"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile field selector - Light mode only */}
        {hasFields && (
          <div className="lg:hidden pb-3 border-t border-black dark:hidden pt-3">
            <FieldSelector variant="compact" className="w-full" />
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;