// client/src/components/layout/Sidebar.jsx (Enhanced with better navigation)
import React from 'react';
import { NavLink } from 'react-router-dom';
import { X, Home, Map, Brain, Calendar, User, Sprout, TrendingUp, Plus } from 'lucide-react';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'My Fields', href: '/fields', icon: Map },
    { 
      name: 'AI Predictions', 
      href: '/prediction', 
      icon: Brain,
      description: 'View & create predictions'
    },
    { name: 'Planning', href: '/planning', icon: Calendar },
    { name: 'Account', href: '/account', icon: User },
  ];

  const quickActions = [
    { 
      name: 'New Prediction', 
      href: '/predictions/new', 
      icon: Plus,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-100 dark:bg-purple-900/20'
    },
    { 
      name: 'View Results', 
      href: '/prediction', 
      icon: TrendingUp,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-100 dark:bg-green-900/20'
    }
  ];

  return (
    <>
      {/* Mobile sidebar overlay */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'pointer-events-none'}`}>
        <div
          className={`fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity ease-linear duration-300 ${
            sidebarOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setSidebarOpen(false)}
        />

        <div
          className={`relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-black border-r border-black dark:border-white transform transition ease-in-out duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>

          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center px-4 mb-8 dark:justify-center">
              <div className="flex items-center space-x-3">
                <div className="bg-black dark:bg-white text-white dark:text-black p-2 rounded-xl">
                  <Sprout size={24} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-black dark:text-white">
                    FARMER'S DESK
                  </h1>
                  <p className="text-xs text-black dark:text-white opacity-70">
                    Smart Agriculture
                  </p>
                </div>
              </div>
            </div>

            {/* Main Navigation */}
            <nav className="px-2 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'bg-black dark:bg-white text-white dark:text-black border-l-4 border-black dark:border-white'
                          : 'text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900'
                      }`
                    }
                  >
                    <Icon className="mr-3 flex-shrink-0 h-5 w-5" />
                    <div className="flex-1">
                      <div>{item.name}</div>
                      {item.description && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {item.description}
                        </div>
                      )}
                    </div>
                  </NavLink>
                );
              })}
            </nav>

            {/* Quick Actions Section */}
            <div className="mt-8 px-2">
              <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Quick Actions
              </h3>
              <div className="space-y-2">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <NavLink
                      key={action.name}
                      to={action.href}
                      onClick={() => setSidebarOpen(false)}
                      className="group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-900"
                    >
                      <div className="p-1.5 rounded-lg mr-3 bg-black dark:bg-white">
                        <Icon className="h-4 w-4 text-white dark:text-black" />
                      </div>
                      <span className="text-black dark:text-white">
                        {action.name}
                      </span>
                    </NavLink>
                  );
                })}
              </div>
            </div>

            {/* AI Status Indicator */}
            <div className="mt-8 mx-2 p-4 bg-black dark:bg-white rounded-xl border border-black dark:border-white">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-white dark:bg-black rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-white dark:text-black">AI Status</span>
              </div>
              <p className="text-xs text-white dark:text-black opacity-70">
                All systems operational
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 border-r border-black dark:border-white bg-white dark:bg-black">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              {/* Logo - Light mode: Left, Dark mode: Centered */}
              <div className="flex items-center flex-shrink-0 px-4 mb-8 dark:justify-center">
                <div className="flex items-center space-x-3">
                  <div className="bg-black dark:bg-white text-white dark:text-black p-2 rounded-xl">
                    <Sprout size={24} />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-black dark:text-white">
                      FARMER'S DESK
                    </h1>
                    <p className="text-xs text-black dark:text-white opacity-70">
                      Smart Agriculture
                    </p>
                  </div>
                </div>
              </div>

              {/* Main Navigation */}
              <nav className="px-2 space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      className={({ isActive }) =>
                        `group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                          isActive
                            ? 'bg-black dark:bg-white text-white dark:text-black border-l-4 border-black dark:border-white'
                            : 'text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900'
                        }`
                      }
                    >
                      <Icon className="mr-3 flex-shrink-0 h-5 w-5" />
                      <div className="flex-1">
                        <div>{item.name}</div>
                        {item.description && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {item.description}
                          </div>
                        )}
                      </div>
                    </NavLink>
                  );
                })}
              </nav>

              {/* Quick Actions Section */}
              <div className="mt-8 px-2">
                <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  {quickActions.map((action) => {
                    const Icon = action.icon;
                    return (
                    <NavLink
                      key={action.name}
                      to={action.href}
                      className="group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-900"
                    >
                      <div className="p-1.5 rounded-lg mr-3 bg-black dark:bg-white">
                        <Icon className="h-4 w-4 text-white dark:text-black" />
                      </div>
                      <span className="text-black dark:text-white">
                        {action.name}
                      </span>
                    </NavLink>
                    );
                  })}
                </div>
              </div>

              {/* AI Status Indicator */}
              <div className="mt-8 mx-2 p-4 bg-black dark:bg-white rounded-xl border border-black dark:border-white">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-white dark:bg-black rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-white dark:text-black">AI Status</span>
                </div>
                <p className="text-xs text-white dark:text-black opacity-70">
                  All systems operational
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;