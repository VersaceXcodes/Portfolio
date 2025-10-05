import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAppStore } from '@/store/main';

// Global shared views
import GV_TopNav from '@/components/views/GV_TopNav.tsx';
import GV_Footer from '@/components/views/GV_Footer.tsx';

// Unique views
import UV_Landing from '@/components/views/UV_Landing.tsx';
import UV_About from '@/components/views/UV_About.tsx';
import UV_Skills from '@/components/views/UV_Skills.tsx';
import UV_ProjectList from '@/components/views/UV_ProjectList.tsx';
import UV_ProjectDetail from '@/components/views/UV_ProjectDetail.tsx';
import UV_ExperienceTimeline from '@/components/views/UV_ExperienceTimeline.tsx';
import UV_Education from '@/components/views/UV_Education.tsx';
import UV_BlogFeed from '@/components/views/UV_BlogFeed.tsx';
import UV_Contact from '@/components/views/UV_Contact.tsx';
import UV_DownloadResume from '@/components/views/UV_DownloadResume.tsx';
import UV_ErrorPage from '@/components/views/UV_ErrorPage.tsx';
import UV_PrivacyPolicy from '@/components/views/UV_PrivacyPolicy.tsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

// Loading component
const LoadingSpinner: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

// Protected Route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAppStore(state => state.authentication_state.authentication_status.is_authenticated);
  const isLoading = useAppStore(state => state.authentication_state.authentication_status.is_loading);
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const App: React.FC = () => {
  const isLoading = useAppStore(state => state.authentication_state.authentication_status.is_loading);
  const initializeAuth = useAppStore(state => state.initialize_auth);
  
  useEffect(() => {
    // Initialize auth state when app loads
    initializeAuth();
  }, [initializeAuth]);
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <div className="App min-h-screen flex flex-col">
          <GV_TopNav />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<UV_Landing />} />
              <Route path="/about" element={<UV_About />} />
              <Route path="/skills" element={<UV_Skills />} />
              <Route path="/projects" element={<UV_ProjectList />} />
              <Route path="/projects/:project_id" element={<UV_ProjectDetail />} />
              <Route path="/experience" element={<UV_ExperienceTimeline />} />
              <Route path="/education" element={<UV_Education />} />
              <Route path="/blog" element={<UV_BlogFeed />} />
              <Route path="/contact" element={<UV_Contact />} />
              <Route path="/resume" element={<UV_DownloadResume />} />
              <Route path="/privacy" element={<UV_PrivacyPolicy />} />
              <Route path="/error" element={<UV_ErrorPage />} />
              
              {/* Default redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <GV_Footer />
        </div>
      </QueryClientProvider>
    </Router>
  );
};

export default App;