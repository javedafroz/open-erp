import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import AuthProvider from './components/AuthProvider';
import MainLayout from './components/Layout/MainLayout';
import { useAuth } from './hooks/useAuth';
import { PageLoader } from './components/LoadingSpinner';
import { ThemeProvider } from './contexts/ThemeContext';

// Pages
import Dashboard from './pages/Dashboard';
import LeadsPage from './pages/Leads/LeadsPage';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
    mutations: {
      retry: 1,
    },
  },
});

// Protected route wrapper
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, login } = useAuth();

  if (isLoading) {
    return <PageLoader message="Authenticating..." />;
  }

  if (!isAuthenticated) {
    // Automatically trigger login
    React.useEffect(() => {
      login();
    }, [login]);

    return <PageLoader message="Redirecting to login..." />;
  }

  return <>{children}</>;
};

// App routes component
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard */}
        <Route index element={<Dashboard />} />

        {/* CRM Routes */}
        <Route path="crm">
          <Route path="leads" element={<LeadsPage />} />
          <Route path="accounts" element={<div className="p-6">Accounts - Coming Soon</div>} />
          <Route path="contacts" element={<div className="p-6">Contacts - Coming Soon</div>} />
          <Route path="opportunities" element={<div className="p-6">Opportunities - Coming Soon</div>} />
        </Route>

        {/* Sales Routes */}
        <Route path="sales">
          <Route path="products" element={<div className="p-6">Products - Coming Soon</div>} />
          <Route path="quotes" element={<div className="p-6">Quotes - Coming Soon</div>} />
          <Route path="orders" element={<div className="p-6">Orders - Coming Soon</div>} />
          <Route path="invoices" element={<div className="p-6">Invoices - Coming Soon</div>} />
        </Route>

        {/* Service Routes */}
        <Route path="service">
          <Route path="cases" element={<div className="p-6">Cases - Coming Soon</div>} />
          <Route path="knowledge" element={<div className="p-6">Knowledge Base - Coming Soon</div>} />
        </Route>

        {/* Marketing Routes */}
        <Route path="marketing">
          <Route path="campaigns" element={<div className="p-6">Campaigns - Coming Soon</div>} />
          <Route path="templates" element={<div className="p-6">Email Templates - Coming Soon</div>} />
        </Route>

        {/* Analytics */}
        <Route path="analytics" element={<div className="p-6">Analytics - Coming Soon</div>} />

        {/* Settings */}
        <Route path="settings" element={<div className="p-6">Settings - Coming Soon</div>} />

        {/* Catch all - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

// Main App component
const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router>
          <AuthProvider>
            <div className="App">
              <AppRoutes />
            </div>
          </AuthProvider>
        </Router>
        
        {/* React Query Devtools - only in development */}
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
