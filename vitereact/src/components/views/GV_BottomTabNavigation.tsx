import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/store/main';
import axios from 'axios';

// Define types for our component
interface TabItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

interface NavigationPreferenceResponse {
  preference_id: string;
  user_id: string;
  hidden_tabs: string | null;
  updated_at: string;
}

interface UpdateNavigationPreferenceRequest {
  preference_id: string;
  user_id: string;
  hidden_tabs: string | null;
  updated_at: string;
}

const GV_BottomTabNavigation: React.FC = () => {
  // Get global state values
  const activeTab = useAppStore(state => state.active_tab.tab);
  const currentUser = useAppStore(state => state.authentication_state.current_user);
  const authToken = useAppStore(state => state.authentication_state.auth_token);
  const setActiveTab = useAppStore(state => state.set_active_tab);
  
  // Local state
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [hiddenTabs, setHiddenTabs] = useState<string[]>([]);
  const location = useLocation();
  const queryClient = useQueryClient();

  // Define our tabs
  const tabs: TabItem[] = [
    {
      id: 'home',
      label: 'Home',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
      ),
      path: '/',
    },
    {
      id: 'skills',
      label: 'Skills',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      ),
      path: '/skills',
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
        </svg>
      ),
      path: '/projects',
    },
    {
      id: 'experience',
      label: 'Experience',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
          <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
        </svg>
      ),
      path: '/experience',
    },
    {
      id: 'more-info',
      label: 'More Info',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
      ),
      path: '/more-info', // This will be handled differently as it opens a modal
    },
  ];

  // Fetch navigation preferences
  const {
    data: navigationPreferences,
    isLoading: isLoadingPreferences,
    isError: isPreferencesError,
  } = useQuery<NavigationPreferenceResponse[], Error>({
    queryKey: ['navigationPreferences', currentUser?.user_id],
    queryFn: async () => {
      if (!currentUser?.user_id || !authToken) return [];
      
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/users/${currentUser.user_id}/navigation-preferences`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      return response.data;
    },
    enabled: !!currentUser?.user_id && !!authToken,
  });

  // Update navigation preferences
  const updatePreferencesMutation = useMutation({
    mutationFn: async (updatedPreferences: UpdateNavigationPreferenceRequest) => {
      if (!authToken) throw new Error('No auth token');
      
      const response = await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/users/${updatedPreferences.user_id}/navigation-preferences/${updatedPreferences.preference_id}`,
        updatedPreferences,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['navigationPreferences', currentUser?.user_id] });
    },
  });

  // Update hidden tabs
  const updateHiddenTabs = (newHiddenTabs: string[]) => {
    setHiddenTabs(newHiddenTabs);
    
    // If we have preferences and auth, update them
    if (navigationPreferences && navigationPreferences.length > 0 && authToken) {
      const preference = navigationPreferences[0];
      updatePreferencesMutation.mutate({
        preference_id: preference.preference_id,
        user_id: preference.user_id,
        hidden_tabs: newHiddenTabs.length > 0 ? newHiddenTabs.join(',') : null,
        updated_at: new Date().toISOString(),
      });
    }
  };

  // Toggle tab visibility in admin mode
  const toggleTabVisibility = (tabId: string) => {
    if (!isAdminMode) return;
    
    if (hiddenTabs.includes(tabId)) {
      updateHiddenTabs(hiddenTabs.filter(id => id !== tabId));
    } else {
      updateHiddenTabs([...hiddenTabs, tabId]);
    }
  };

  // Toggle admin mode
  const handleToggleAdminMode = () => {
    // In a real app, this would check for development mode or admin privileges
    setIsAdminMode(!isAdminMode);
  };

  // Set active tab when location changes
  useEffect(() => {
    const pathToTabMap: Record<string, string> = {
      '/': 'home',
      '/skills': 'skills',
      '/projects': 'projects',
      '/experience': 'experience',
      '/education': 'experience', // Education is part of experience in the nav
    };
    
    const currentTab = pathToTabMap[location.pathname] || 'home';
    setActiveTab(currentTab);
  }, [location.pathname, setActiveTab]);

  // Update hidden tabs when preferences load
  useEffect(() => {
    if (navigationPreferences && navigationPreferences.length > 0) {
      const preference = navigationPreferences[0];
      if (preference.hidden_tabs) {
        setHiddenTabs(preference.hidden_tabs.split(','));
      } else {
        setHiddenTabs([]);
      }
    }
  }, [navigationPreferences]);

  // Handle "More Info" tab click (opens modal)
  const handleMoreInfoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // In a real app, this would dispatch an action to open the modal
    // For now, we'll just log it
    console.log('Open More Info modal');
  };

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav 
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10"
        onContextMenu={(e) => {
          // Enable admin mode on right-click in development
          if (import.meta.env.DEV) {
            e.preventDefault();
            handleToggleAdminMode();
          }
        }}
      >
        <div className="flex justify-around items-center h-16">
          {tabs
            .filter(tab => !hiddenTabs.includes(tab.id))
            .map((tab) => (
              <Link
                key={tab.id}
                to={tab.id === 'more-info' ? '#' : tab.path}
                onClick={(e) => {
                  if (tab.id === 'more-info') {
                    handleMoreInfoClick(e);
                  }
                }}
                className={`flex flex-col items-center justify-center w-full h-full transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                } ${isAdminMode ? 'cursor-pointer' : ''}`}
                aria-label={tab.label}
                aria-current={activeTab === tab.id ? 'page' : undefined}
              >
                <div 
                  className={`p-1 rounded-full ${
                    activeTab === tab.id 
                      ? 'bg-blue-100' 
                      : isAdminMode 
                        ? 'hover:bg-gray-100' 
                        : ''
                  }`}
                  onClick={(e) => {
                    if (isAdminMode) {
                      e.preventDefault();
                      toggleTabVisibility(tab.id);
                    }
                  }}
                >
                  {tab.icon}
                </div>
                <span 
                  className={`text-xs mt-1 ${
                    isAdminMode && hiddenTabs.includes(tab.id) 
                      ? 'line-through text-gray-400' 
                      : ''
                  }`}
                >
                  {tab.label}
                </span>
                
                {/* Admin mode indicator */}
                {isAdminMode && (
                  <div className="absolute top-1 right-1">
                    {hiddenTabs.includes(tab.id) ? (
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    ) : (
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    )}
                  </div>
                )}
              </Link>
            ))}
        </div>
        
        {/* Admin mode indicator */}
        {isAdminMode && (
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full bg-blue-500 text-white text-xs px-2 py-1 rounded-t-lg">
            Admin Mode
          </div>
        )}
      </nav>
      
      {/* Spacer to prevent content overlap */}
      <div className="h-16"></div>
    </>
  );
};

export default GV_BottomTabNavigation;