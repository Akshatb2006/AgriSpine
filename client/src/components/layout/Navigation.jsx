import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Map, Calendar, User, Brain } from 'lucide-react';

const Navigation = ({ isMobileMenuOpen, onMenuClose }) => {
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/fields', label: 'My Fields', icon: Map },
    { path: '/prediction', label: 'Crop Prediction', icon: Brain },
    { path: '/planning', label: 'Planning', icon: Calendar },
    { path: '/account', label: 'Account', icon: User }
  ];

  return (
    <>
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={onMenuClose}
        />
      )}

      <nav className={`
        fixed top-16 left-0 z-40 w-64 h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out overflow-y-auto
        md:translate-x-0 md:static md:z-auto
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-4">
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onMenuClose}
                  className={({ isActive }) =>
                    `w-full flex items-center space-x-3 px-3 py-3 rounded-lg font-medium transition-all duration-200 text-left ${
                      isActive
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-r-4 border-green-600'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    }`
                  }
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navigation;