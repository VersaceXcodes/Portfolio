import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAppStore } from '@/store/main';
import { AppSetting } from '@/zodschemas';

const UV_Settings: React.FC = () => {
  // Global state selectors
  const currentUser = useAppStore(state => state.authentication_state.current_user);
  const authToken = useAppStore(state => state.authentication_state.auth_token);
  const globalThemeMode = useAppStore(state => state.theme_mode.mode);
  const setGlobalThemeMode = useAppStore(state => state.set_theme_mode);
  const globalFontScale = useAppStore(state => state.font_scale.scale);
  const setGlobalFontScale = useAppStore(state => state.set_font_scale);

  // Local state
  const [appSettings, setAppSettings] = useState<AppSetting | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const queryClient = useQueryClient();

  // API base URL
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

  // Fetch app settings
  const { data: settingsData, isLoading: isSettingsLoading, error: settingsError } = useQuery({
    queryKey: ['appSettings', currentUser?.user_id],
    queryFn: async () => {
      if (!currentUser?.user_id || !authToken) return null;
      
      const response = await axios.get(
        `${API_BASE_URL}/api/users/${currentUser.user_id}/app-settings`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );
      
      if (response.data && response.data.length > 0) {
        return response.data[0] as AppSetting;
      }
      return null;
    },
    enabled: !!currentUser?.user_id && !!authToken,
    staleTime: 60000,
    refetchOnWindowFocus: false,
    retry: 1
  });

  // Update theme mode mutation
  const updateThemeModeMutation = useMutation({
    mutationFn: async (newThemeMode: 'light' | 'dark') => {
      if (!currentUser?.user_id || !authToken || !appSettings?.setting_id) return;
      
      const response = await axios.patch(
        `${API_BASE_URL}/api/users/${currentUser.user_id}/app-settings/${appSettings.setting_id}`,
        {
          theme_mode: newThemeMode,
          updated_at: new Date().toISOString()
        },
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data as AppSetting;
    },
    onSuccess: (updatedSettings) => {
      if (updatedSettings) {
        setAppSettings(updatedSettings);
        setGlobalThemeMode(updatedSettings.theme_mode as 'light' | 'dark');
        queryClient.setQueryData(['appSettings', currentUser?.user_id], updatedSettings);
      }
    }
  });

  // Update font scale mutation
  const updateFontScaleMutation = useMutation({
    mutationFn: async (newFontScale: number) => {
      if (!currentUser?.user_id || !authToken || !appSettings?.setting_id) return;
      
      const response = await axios.patch(
        `${API_BASE_URL}/api/users/${currentUser.user_id}/app-settings/${appSettings.setting_id}`,
        {
          font_scale: newFontScale,
          updated_at: new Date().toISOString()
        },
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data as AppSetting;
    },
    onSuccess: (updatedSettings) => {
      if (updatedSettings) {
        setAppSettings(updatedSettings);
        setGlobalFontScale(updatedSettings.font_scale);
        queryClient.setQueryData(['appSettings', currentUser?.user_id], updatedSettings);
      }
    }
  });

  // Update local state when data loads
  useEffect(() => {
    if (settingsData) {
      setAppSettings(settingsData);
      setIsLoading(false);
    } else if (!isSettingsLoading) {
      setIsLoading(false);
    }
  }, [settingsData, isSettingsLoading]);

  // Handle theme toggle
  const handleThemeToggle = () => {
    const newTheme = globalThemeMode === 'light' ? 'dark' : 'light';
    updateThemeModeMutation.mutate(newTheme);
  };

  // Handle font scale change
  const handleFontScaleChange = (increment: number) => {
    const newScale = Math.max(0.8, Math.min(1.5, globalFontScale + increment));
    updateFontScaleMutation.mutate(newScale);
  };

  // Loading state
  if (isLoading || isSettingsLoading) {
    return (
      <>
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-xl transform transition-transform duration-300 ease-in-out translate-x-0">
            <div className="h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Error state
  if (settingsError) {
    return (
      <>
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-xl transform transition-transform duration-300 ease-in-out translate-x-0 p-6">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-red-500 mb-4">Failed to load settings</div>
                  <button 
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-50">
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-xl transform transition-transform duration-300 ease-in-out translate-x-0">
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
              <button 
                onClick={() => window.history.back()}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-8">
                {/* Theme Settings */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Appearance</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Dark Mode</span>
                      <button
                        onClick={handleThemeToggle}
                        disabled={updateThemeModeMutation.isPending}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                          globalThemeMode === 'dark' ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            globalThemeMode === 'dark' ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Font Scaling */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Text Size</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Adjust font size</span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleFontScaleChange(-0.1)}
                          disabled={updateFontScaleMutation.isPending || globalFontScale <= 0.8}
                          className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <span className="text-gray-900 font-medium min-w-[40px] text-center">
                          {globalFontScale.toFixed(1)}x
                        </span>
                        <button
                          onClick={() => handleFontScaleChange(0.1)}
                          disabled={updateFontScaleMutation.isPending || globalFontScale >= 1.5}
                          className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Help & Support */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Help & Support</h3>
                  <div className="space-y-3">
                    <a 
                      href="https://example.com/help" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center">
                        <svg className="h-5 w-5 text-gray-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-gray-700">Help Center</span>
                      </div>
                    </a>
                    <a 
                      href="mailto:support@example.com" 
                      className="block bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center">
                        <svg className="h-5 w-5 text-gray-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="text-gray-700">Contact Us</span>
                      </div>
                    </a>
                  </div>
                </div>

                {/* Legal */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Legal</h3>
                  <div className="space-y-3">
                    <a 
                      href="https://example.com/privacy" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center">
                        <svg className="h-5 w-5 text-gray-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-gray-700">Privacy Policy</span>
                      </div>
                    </a>
                    <a 
                      href="https://example.com/terms" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center">
                        <svg className="h-5 w-5 text-gray-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <span className="text-gray-700">Terms of Service</span>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200">
              <div className="text-center text-sm text-gray-500">
                PortfolioPro v1.0
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UV_Settings;