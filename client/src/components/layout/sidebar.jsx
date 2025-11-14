import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', emoji: '📊' },
    { name: 'My Fields', href: '/fields', emoji: '🌾' },
    { name: 'AI Predictions', href: '/prediction', emoji: '🤖' },
    { name: 'Planning', href: '/planning', emoji: '📅' },
    { name: 'Account', href: '/account', emoji: '👤' },
  ];

  const quickActions = [
    { name: 'New Prediction', href: '/predictions/new', emoji: '✨' },
    { name: 'View Results', href: '/prediction', emoji: '📈' }
  ];

  return (
    <>
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'pointer-events-none'}`}>
        <div
          className={`fixed inset-0 bg-black transition-opacity ease-linear duration-300 ${
            sidebarOpen ? 'opacity-50' : 'opacity-0'
          }`}
          onClick={() => setSidebarOpen(false)}
        />

        <div
          className={`relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-slate-900 transform transition ease-in-out duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="text-2xl">✕</span>
            </button>
          </div>

          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4 mb-8">
              <div className="flex items-center space-x-3">
                <div className="bg-black dark:bg-white text-white dark:text-black p-2 rounded">
                  <span className="text-2xl">🚜</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">
                    FARMER'S DESK
                  </h1>
                  <p className="text-xs text-gray-600 dark:text-slate-400">
                    Smart Agriculture
                  </p>
                </div>
              </div>
            </div>


            <nav className="px-2 space-y-2">
              {navigation.map((item) => {
                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `group flex items-center px-3 py-3 text-sm font-medium rounded transition-colors ${
                        isActive
                          ? 'bg-black dark:bg-white text-white dark:text-black'
                          : 'text-gray-900 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`
                    }
                  >
                    <span className="mr-3 text-xl">{item.emoji}</span>
                    <div>{item.name}</div>
                  </NavLink>
                );
              })}
            </nav>

            <div className="mt-8 px-2">
              <h3 className="px-3 text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider mb-3">
                Quick Actions
              </h3>
              <div className="space-y-2">
                {quickActions.map((action) => {
                  return (
                    <NavLink
                      key={action.name}
                      to={action.href}
                      onClick={() => setSidebarOpen(false)}
                      className="group flex items-center px-3 py-2 text-sm font-medium rounded transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <span className="mr-3 text-lg">{action.emoji}</span>
                      <span className="text-gray-900 dark:text-slate-200">
                        {action.name}
                      </span>
                    </NavLink>
                  );
                })}
              </div>
            </div>


            <div className="mt-8 mx-2 p-4 bg-gray-100 dark:bg-gray-800 rounded border border-black dark:border-white">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-lg">⚡</span>
                <span className="text-sm font-medium text-gray-900 dark:text-slate-100">AI Status</span>
              </div>
              <p className="text-xs text-gray-700 dark:text-slate-300">
                All systems operational
              </p>
            </div>
          </div>
        </div>
      </div>


      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 border-r border-black dark:border-white border-opacity-20 bg-white dark:bg-black">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">

              <div className="flex items-center flex-shrink-0 px-4 mb-8">
                <div className="flex items-center space-x-3">
                  <div className="bg-black dark:bg-white text-white dark:text-black p-2 rounded">
                    <span className="text-2xl">🚜</span>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">
                      FARMER'S DESK
                    </h1>
                    <p className="text-xs text-gray-600 dark:text-slate-400">
                      Smart Agriculture
                    </p>
                  </div>
                </div>
              </div>


              <nav className="px-2 space-y-2">
                {navigation.map((item) => {
                  return (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      className={({ isActive }) =>
                        `group flex items-center px-3 py-3 text-sm font-medium rounded transition-colors ${
                          isActive
                            ? 'bg-black dark:bg-white text-white dark:text-black'
                            : 'text-gray-900 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`
                      }
                    >
                      <span className="mr-3 text-xl">{item.emoji}</span>
                      <div>{item.name}</div>
                    </NavLink>
                  );
                })}
              </nav>


              <div className="mt-8 px-2">
                <h3 className="px-3 text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider mb-3">
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  {quickActions.map((action) => {
                    return (
                      <NavLink
                        key={action.name}
                        to={action.href}
                        className="group flex items-center px-3 py-2 text-sm font-medium rounded transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <span className="mr-3 text-lg">{action.emoji}</span>
                        <span className="text-gray-900 dark:text-slate-200">
                          {action.name}
                        </span>
                      </NavLink>
                    );
                  })}
                </div>
              </div>


              <div className="mt-8 mx-2 p-4 bg-gray-100 dark:bg-gray-800 rounded border border-black dark:border-white">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-lg">⚡</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-slate-100">AI Status</span>
                </div>
                <p className="text-xs text-gray-700 dark:text-slate-300">
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