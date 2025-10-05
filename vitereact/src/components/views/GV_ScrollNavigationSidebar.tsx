import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAppStore } from '@/store/main';
import { appSettingSchema, type AppSetting } from '@/db/zodschemas';

const GV_ScrollNavigationSidebar: React.FC = () => {
  // Zustand store state
  const currentUser = useAppStore(state => state.authentication_state.current_user);
  const authToken = useAppStore(state => state.authentication_state.auth_token);
  const themeMode = useAppStore(state => state.theme_mode.mode);
  const fontScale = useAppStore(state => state.font_scale.scale);
  const setThemeMode = useAppStore(state => state.set_theme_mode);
  const setFontScale = useAppStore(state => state.set_font_scale);

  // Component state
  const [isOpen, setIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Query client for cache invalidation
  const queryClient = useQueryClient();

  // Fetch app settings
  const fetchAppSettings = async () => {
    if (!currentUser?.user_id || !authToken) {
      throw new Error('User not authenticated');
    }

    const response = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/users/${currentUser.user_id}/app-settings`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    if (response.data && response.data.length > 0) {
      return appSettingSchema.parse(response.data[0]);
    } else {
      // Return default settings if none exist
      return appSettingSchema.parse({
        setting_id: "",
        user_id: currentUser.user_id,
        theme_mode: "light",
        font_scale: 1,
        hidden_sections: null,
        updated_at: new Date().toISOString()
      });
    }
  };

  // Update app settings
  const updateAppSettings = async (updatedSettings: Partial<AppSetting>) => {
    if (!currentUser?.user_id || !authToken) {
      throw new Error('User not authenticated');
    }

    const currentSettings = queryClient.getQueryData<AppSetting>(['app-settings', currentUser.user_id]);
    if (!currentSettings) {
      throw new Error('No current settings found');
    }

    const response = await axios.patch(
      `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/users/${currentUser.user_id}/app-settings/${currentSettings.setting_id}`,
      {
        ...updatedSettings,
        updated_at: new Date().toISOString()
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return appSettingSchema.parse(response.data);
  };

  // Queries and mutations
  const { data: appSettings, isLoading, isError, error } = useQuery({
    queryKey: ['app-settings', currentUser?.user_id],
    queryFn: fetchAppSettings,
    enabled: !!currentUser?.user_id && !!authToken && isOpen,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  const themeMutation = useMutation({
    mutationFn: (theme_mode: 'light' | 'dark') => updateAppSettings({ theme_mode }),
    onSuccess: (data) => {
      setThemeMode(data.theme_mode as 'light' | 'dark');
      queryClient.setQueryData(['app-settings', currentUser?.user_id], data);
    },
    onError: (error: any) => {
      setErrorMessage(error.message || 'Failed to update theme');
    }
  });

  const fontScaleMutation = useMutation({
    mutationFn: (font_scale: number) => updateAppSettings({ font_scale }),
    onSuccess: (data) => {
      setFontScale(data.font_scale);
      queryClient.setQueryData(['app-settings', currentUser?.user_id], data);
    },
    onError: (error: any) => {
      setErrorMessage(error.message || 'Failed to update font scale');
    }
  });

  // Sync with global state when settings are fetched
  useEffect(() => {
    if (appSettings) {
      setThemeMode(appSettings.theme_mode as 'light' | 'dark');
      setFontScale(appSettings.font_scale);
    }
  }, [appSettings, setThemeMode, setFontScale]);

  // Open sidebar handler
  const openSidebar = useCallback(() => {
    setIsOpen(true);
    setErrorMessage(null);
  }, []);

  // Close sidebar handler
  const closeSidebar = useCallback(() => {
    setIsOpen(false);
    setErrorMessage(null);
  }, []);

  // Toggle theme mode
  const toggleThemeMode = () => {
    const newTheme = themeMode === 'light' ? 'dark' : 'light';
    themeMutation.mutate(newTheme);
  };

  // Adjust font scale
  const adjustFontScale = (delta: number) => {
    const newScale = Math.max(0.8, Math.min(1.5, fontScale + delta));
    fontScaleMutation.mutate(newScale);
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeSidebar();
    }
  };

  // Handle escape key press
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeSidebar();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, closeSidebar]);

  // Set initial settings when sidebar opens
  useEffect(() => {
    if (isOpen && currentUser?.user_id) {
      queryClient.invalidateQueries({ queryKey: ['app-settings', currentUser.user_id] });
    }
  }, [isOpen, currentUser?.user_id, queryClient]);

  return (
    <>
      {/* Settings button - typically in header */}
      <button
        onClick={openSidebar}
        className="p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Open settings"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity"
          onClick={handleBackdropClick}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-md transform bg-white shadow-xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sidebar-title"
      >
        {/* Header */}
        <div className="border-b border-gray-200 px-4 py-6 sm:px-6">
          <div className="flex items-center justify-between">
            <h2 id="sidebar-title" className="text-lg font-medium text-gray-900">
              Settings
            </h2>
            <button
              type="button"
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
              onClick={closeSidebar}
              aria-label="Close panel"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="py-6 px-4 sm:px-6">
            {/* Error message */}
            {errorMessage && (
              <div className="mb-6 rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{errorMessage}</h3>
                  </div>
                </div>
              </div>
            )}

            {/* Loading state */}
            {isLoading && (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}

            {/* Theme settings */}
            <div className="mb-8">
              <h3 className="text-md font-medium text-gray-900 mb-4">Appearance</h3>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Dark mode</span>
                <button
                  type="button"
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    themeMode === 'dark' ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                  role="switch"
                  aria-checked={themeMode === 'dark'}
                  onClick={toggleThemeMode}
                  disabled={themeMutation.isPending}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      themeMode === 'dark' ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Font size settings */}
            <div className="mb-8">
              <h3 className="text-md font-medium text-gray-900 mb-4">Font Size</h3>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  onClick={() => adjustFontScale(-0.1)}
                  disabled={fontScaleMutation.isPending}
                >
                  <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                  Smaller
                </button>
                <span className="text-sm font-medium text-gray-900">
                  {fontScale.toFixed(1)}x
                </span>
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  onClick={() => adjustFontScale(0.1)}
                  disabled={fontScaleMutation.isPending}
                >
                  Larger
                  <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
              </div>
            </div>

            {/* External links */}
            <div className="mb-8">
              <h3 className="text-md font-medium text-gray-900 mb-4">Help & Support</h3>
              <ul className="space-y-3">
                <li>
                  <a 
                    href="https://example.com/help" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center text-sm text-gray-600 hover:text-blue-600"
                  >
                    <svg className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Help Center
                  </a>
                </li>
                <li>
                  <a 
                    href="mailto:support@example.com" 
                    className="flex items-center text-sm text-gray-600 hover:text-blue-600"
                  >
                    <svg className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal links */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-4">Legal</h3>
              <ul className="space-y-3">
                <li>
                  <a 
                    href="https://example.com/privacy" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-gray-600 hover:text-blue-600"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a 
                    href="https://example.com/terms" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-gray-600 hover:text-blue-600"
                  >
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GV_ScrollNavigationSidebar;