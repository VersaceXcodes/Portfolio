import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAppStore } from '@/store/main';

// Import shared/global views
import GV_HeaderWithAvatar from '@/components/views/GV_HeaderWithAvatar.tsx';
import GV_BottomTabNavigation from '@/components/views/GV_BottomTabNavigation.tsx';
import GV_ScrollNavigationSidebar from '@/components/views/GV_ScrollNavigationSidebar.tsx';
import GV_MoreInfoModal from '@/components/views/GV_MoreInfoModal.tsx';

// Import unique views
import UV_Landing from '@/components/views/UV_Landing.tsx';
import UV_AboutMe from '@/components/views/UV_AboutMe.tsx';
import UV_Skills from '@/components/views/UV_Skills.tsx';
import UV_Projects from '@/components/views/UV_Projects.tsx';
import UV_Experience from '@/components/views/UV_Experience.tsx';
import UV_Education from '@/components/views/UV_Education.tsx';
import UV_ContactForm from '@/components/views/UV_ContactForm.tsx';
import UV_Settings from '@/components/views/UV_Settings.tsx';

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

// Protected Route Wrapper (currently not needed but included for future-proofing)
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAppStore(state => state.authentication_state.authentication_status.is_authenticated);
  const isLoading = useAppStore(state => state.authentication_state.authentication_status.is_loading);
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  // Currently all routes are public, so this just passes through
  // In a real app, this would redirect to login if not authenticated
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
          <Routes>
            {/* Main Landing Page with Header */}
            <Route 
              path="/" 
              element={
                <div className="flex flex-col min-h-screen">
                  <GV_HeaderWithAvatar />
                  <main className="flex-1">
                    <UV_Landing />
                  </main>
                  <GV_BottomTabNavigation />
                  <GV_ScrollNavigationSidebar />
                  <GV_MoreInfoModal />
                </div>
              } 
            />
            
            {/* About Me Section */}
            <Route 
              path="/about" 
              element={
                <div className="flex flex-col min-h-screen">
                  <main className="flex-1">
                    <UV_AboutMe />
                  </main>
                  <GV_BottomTabNavigation />
                  <GV_ScrollNavigationSidebar />
                  <GV_MoreInfoModal />
                </div>
              } 
            />
            
            {/* Skills Section */}
            <Route 
              path="/skills" 
              element={
                <div className="flex flex-col min-h-screen">
                  <main className="flex-1">
                    <UV_Skills />
                  </main>
                  <GV_BottomTabNavigation />
                  <GV_ScrollNavigationSidebar />
                  <GV_MoreInfoModal />
                </div>
              } 
            />
            
            {/* Projects Section */}
            <Route 
              path="/projects" 
              element={
                <div className="flex flex-col min-h-screen">
                  <main className="flex-1">
                    <UV_Projects />
                  </main>
                  <GV_BottomTabNavigation />
                  <GV_ScrollNavigationSidebar />
                  <GV_MoreInfoModal />
                </div>
              } 
            />
            
            {/* Experience Section */}
            <Route 
              path="/experience" 
              element={
                <div className="flex flex-col min-h-screen">
                  <main className="flex-1">
                    <UV_Experience />
                  </main>
                  <GV_BottomTabNavigation />
                  <GV_ScrollNavigationSidebar />
                  <GV_MoreInfoModal />
                </div>
              } 
            />
            
            {/* Education Section */}
            <Route 
              path="/education" 
              element={
                <div className="flex flex-col min-h-screen">
                  <main className="flex-1">
                    <UV_Education />
                  </main>
                  <GV_BottomTabNavigation />
                  <GV_ScrollNavigationSidebar />
                  <GV_MoreInfoModal />
                </div>
              } 
            />
            
            {/* Contact Form Modal */}
            <Route 
              path="/contact" 
              element={<UV_ContactForm />} 
            />
            
            {/* Settings Panel */}
            <Route 
              path="/settings" 
              element={<UV_Settings />} 
            />
            
            {/* Redirect unknown routes to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </QueryClientProvider>
    </Router>
  );
};

export default App;