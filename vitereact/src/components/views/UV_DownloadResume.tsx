import React, { useEffect } from 'react';
import { useAppStore } from '@/store/main';
import { Link } from 'react-router-dom';

const UV_DownloadResume: React.FC = () => {
  // Access global state
  const currentUser = useAppStore(state => state.authentication_state.current_user);
  const resumeDownload = useAppStore(state => state.resume_download);
  const isLoading = useAppStore(state => state.is_loading?.resume);
  const error = useAppStore(state => state.errors?.resume);
  const fetchResumeDownload = useAppStore(state => state.fetch_resume_download);

  // Fetch resume download link on component mount
  useEffect(() => {
    if (currentUser?.user_id) {
      fetchResumeDownload?.();
    }
  }, [currentUser?.user_id, fetchResumeDownload]);

  // Handle download button click
  const handleDownload = () => {
    if (resumeDownload?.download_url) {
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = resumeDownload.download_url;
      link.download = ''; // Let browser decide filename
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Professional Resume
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Download my comprehensive CV in universally-readable format
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 sm:p-8">
              <div className="flex flex-col md:flex-row items-center">
                <div className="flex-shrink-0 mb-6 md:mb-0 md:mr-8">
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Download My Resume
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Get a detailed overview of my professional experience, skills, and qualifications in PDF format
                  </p>
                  
                  {resumeDownload?.created_at && (
                    <div className="text-sm text-gray-500 mb-4">
                      Last updated: {new Date(resumeDownload.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  )}
                  
                  {isLoading ? (
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : error ? (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                      <p>Failed to load resume download link: {error}</p>
                      <button
                        onClick={fetchResumeDownload}
                        className="mt-2 text-sm font-medium text-red-800 hover:text-red-900"
                      >
                        Retry
                      </button>
                    </div>
                  ) : resumeDownload?.download_url ? (
                    <button
                      onClick={handleDownload}
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download Resume
                    </button>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
                      <p>Resume not available for download at this time</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row justify-between items-center">
                <div className="text-sm text-gray-500 mb-2 sm:mb-0">
                  File format: PDF
                </div>
                <div className="flex space-x-4">
                  <Link 
                    to="/contact" 
                    className="text-sm font-medium text-blue-600 hover:text-blue-500"
                  >
                    Contact me
                  </Link>
                  <Link 
                    to="/" 
                    className="text-sm font-medium text-gray-600 hover:text-gray-500"
                  >
                    Back to home
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>For best results, ensure you have a PDF reader installed on your device</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default UV_DownloadResume;