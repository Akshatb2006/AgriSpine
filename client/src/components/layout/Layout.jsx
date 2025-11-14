import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex overflow-hidden bg-white dark:bg-black">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <Header setSidebarOpen={setSidebarOpen} />
        
        {/* Page content - Different layouts for light/dark */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          {/* Light mode: Centered, compact layout */}
          <div className="py-8 dark:py-4">
            <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-12 dark:max-w-full dark:px-4 dark:sm:px-6">
              <div className="space-y-6 dark:space-y-4">
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;