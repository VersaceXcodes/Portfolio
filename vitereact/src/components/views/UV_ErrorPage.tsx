import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAppStore } from '@/store/main';

const UV_ErrorPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const errorCode = searchParams.get('error_code') || '404';
  const errorMessage = searchParams.get('error_message') || '';
  
  // Get site settings for consistent branding
  const siteSettings = useAppStore(state => state.site_settings);
  const appName = siteSettings?.seo_meta_title || 'Devfolio';

  // Define error messages based on common HTTP status codes
  const getErrorMessage = () => {
    switch (errorCode) {
      case '401':
        return 'Unauthorized Access';
      case '403':
        return 'Forbidden Resource';
      case '404':
        return 'Page Not Found';
      case '500':
        return 'Internal Server Error';
      case '502':
        return 'Bad Gateway';
      case '503':
        return 'Service Unavailable';
      default:
        return 'Something Went Wrong';
    }
  };

  const getErrorDescription = () => {
    switch (errorCode) {
      case '401':
        return 'Sorry, you are not authorized to access this page. Please check your credentials.';
      case '403':
        return 'Access to this resource is forbidden. You might not have the necessary permissions.';
      case '404':
        return `The page you're looking for might have been removed, had its name changed, or is temporarily unavailable.`;
      case '500':
        return 'An unexpected error occurred on our server. Our team has been notified and is working to fix it.';
      case '502':
        return 'The server received an invalid response from an upstream server.';
      case '503':
        return 'The server is temporarily unable to service your request due to maintenance or overload.';
      default:
        return errorMessage || 'An unexpected error occurred. Please try again later.';
    }
  };

  const getErrorAction = () => {
    switch (errorCode) {
      case '401':
        return 'Return to Home';
      case '403':
        return 'Return to Home';
      case '404':
        return 'Return to Home';
      default:
        return 'Try Again';
    }
  };

  return (
    <>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
        <main className="flex-grow flex items-center justify-center p-4">
          <div className="max-w-2xl w-full text-center">
            {/* Error illustration */}
            <div className="mb-8">
              <div className="inline-block p-4 rounded-full bg-white shadow-lg">
                <div className="text-6xl font-bold text-blue-600 bg-clip-text">
                  {errorCode}
                </div>
              </div>
            </div>

            {/* Error content */}
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {getErrorMessage()}
              </h1>
              
              <p className="text-gray-600 text-lg mb-8">
                {getErrorDescription()}
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
                <Link 
                  to="/"
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  ← {getErrorAction()}
                </Link>
                
                <a 
                  href="mailto:contact@devfolio.com"
                  className="px-6 py-3 bg-gray-100 text-gray-800 font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200 border border-gray-300"
                >
                  Report Issue
                </a>
              </div>
              
              <div className="border-t border-gray-200 pt-6">
                <p className="text-gray-500 text-sm">
                  Need help? <a href="mailto:contact@devfolio.com" className="text-blue-600 hover:underline">Contact support</a>
                </p>
              </div>
            </div>

            {/* Humorous but helpful note */}
            <div className="mt-8 text-gray-500 text-sm">
              <p>Don't worry, this happens to the best of us. Even developers make mistakes sometimes!</p>
            </div>
          </div>
        </main>
        
        {/* Footer */}
        <footer className="py-6 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} {appName}. All rights reserved.</p>
        </footer>
      </div>
    </>
  );
};

export default UV_ErrorPage;