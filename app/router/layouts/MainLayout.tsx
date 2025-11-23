import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import ActivityBar from './ActivityBar';
import Sidebar from './Sidebar';
import Header from './Header';
import { useResizable } from '../../../hooks/useResizable';
import { useUIStore } from '../../../stores/useUIStore';

const MainLayout: React.FC = () => {
  const location = useLocation();
  const { sidebarWidth, setSidebarWidth, isDarkMode, toggleTheme, setTheme } = useUIStore();
  
  // Resizable sidebar logic
  const { 
    width, 
    isResizing, 
    startResizing 
  } = useResizable({
    initialWidth: sidebarWidth,
    minWidth: 180,
    maxWidth: 480,
    edge: 'left',
    leftOffset: 56 // ActivityBar width
  });

  // Sync resize width to global store when resizing stops or updates
  useEffect(() => {
    setSidebarWidth(width);
  }, [width, setSidebarWidth]);

  // Initial Theme Setup
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const isHome = location.pathname === '/';

  return (
    <div className={`flex flex-col h-screen w-screen bg-background text-foreground overflow-hidden font-sans transition-colors duration-200 ${isResizing ? 'cursor-col-resize select-none' : ''}`}>
      
      <Header 
        isDarkMode={isDarkMode} 
        toggleTheme={toggleTheme} 
      />

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        <ActivityBar />
        
        {/* Sidebar - Hidden on Home View */}
        {!isHome && (
          <>
            <Sidebar width={width} />
            {/* Sidebar Resizer */}
            <div
                className="w-[1px] bg-border hover:bg-primary cursor-col-resize z-50 relative transition-colors"
                onMouseDown={startResizing}
            >
               {/* Invisible Hit Area */}
               <div className="absolute inset-y-0 -left-1 w-3 cursor-col-resize z-50" />
            </div>
          </>
        )}
        
        {/* Content Area */}
        <main className="flex-1 flex overflow-hidden relative bg-background min-w-0">
            <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;