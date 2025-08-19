import React from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Header from './Header';
import Sidebar from './Sidebar';

export const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const handleMenuClick = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-background transition-colors duration-300">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={handleCloseSidebar} />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden lg:ml-64">
        {/* Header */}
        <Header onMenuClick={handleMenuClick} />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-background via-background to-muted/30">
          <div className="h-full p-1">
            <div className="h-full rounded-2xl bg-background/60 backdrop-blur-sm">
              <Outlet />
            </div>
          </div>
        </main>
      </div>

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          className: 'backdrop-blur-md',
          style: {
            background: 'hsl(var(--card))',
            color: 'hsl(var(--card-foreground))',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid hsl(var(--border))',
            borderRadius: '12px',
          },
          success: {
            iconTheme: {
              primary: 'hsl(174 83% 39%)',
              secondary: 'hsl(var(--card))',
            },
            style: {
              background: 'linear-gradient(135deg, hsl(174 83% 97%) 0%, hsl(174 83% 95%) 100%)',
              color: 'hsl(174 83% 25%)',
              border: '1px solid hsl(174 83% 85%)',
            },
          },
          error: {
            iconTheme: {
              primary: 'hsl(0 72% 51%)',
              secondary: 'hsl(var(--card))',
            },
            style: {
              background: 'linear-gradient(135deg, hsl(0 72% 97%) 0%, hsl(0 72% 95%) 100%)',
              color: 'hsl(0 72% 25%)',
              border: '1px solid hsl(0 72% 85%)',
            },
          },
        }}
      />
    </div>
  );
};

export default MainLayout;
