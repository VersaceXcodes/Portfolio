import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAppStore } from '@/store/main';

const UV_PrivacyPolicy: React.FC = () => {
  // Get current user from global state
  const currentUser = useAppStore(state => state.authentication_state.current_user);
  
  // Extract user ID
  const userId = currentUser?.user_id;

  // Fetch privacy policy content
  const fetchPrivacyPolicy = async () => {
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/site-settings`, {
      params: {
        user_id: userId,
        limit: 1
      }
    });
    
    return response.data.settings?.[0]?.privacy_policy_content || '';
  };

  const { data: privacyPolicyContent, isLoading, error } = useQuery({
    queryKey: ['privacyPolicy', userId],
    queryFn: fetchPrivacyPolicy,
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1
  });

  // Handle loading state
  if (isLoading) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
                <div className="space-y-4">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Handle error state
  if (error) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Privacy Policy Unavailable</h2>
                <p className="text-gray-600 mb-6">
                  We're having trouble loading the privacy policy at the moment. Please try again later.
                </p>
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
                  <p className="text-sm">{(error as Error).message}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Render privacy policy content
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white shadow-xl rounded-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-8 sm:px-8">
              <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
              <p className="mt-2 text-blue-100">
                Your privacy is important to us. This policy explains how we collect, use, and protect your information.
              </p>
            </div>
            
            <div className="px-6 py-8 sm:px-8">
              {privacyPolicyContent ? (
                <div className="prose prose-blue max-w-none">
                  <div 
                    className="privacy-policy-content text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: privacyPolicyContent }}
                  />
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                    <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No Privacy Policy Content</h3>
                  <p className="mt-2 text-gray-600">
                    The site administrator has not yet configured a privacy policy.
                  </p>
                </div>
              )}
              
              <div className="mt-12 pt-8 border-t border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Us</h2>
                <p className="text-gray-600">
                  If you have any questions about this Privacy Policy, please contact us at:
                </p>
                <div className="mt-4 bg-blue-50 rounded-lg p-4">
                  <p className="text-blue-800 font-medium">
                    {currentUser?.email || 'admin@devfolio.com'}
                  </p>
                </div>
              </div>
              
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-500">
                  Last updated: {new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <a 
              href="/"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default UV_PrivacyPolicy;