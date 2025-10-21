import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/store/main';
import axios from 'axios';
import { User, KeyFact } from '@/db/zodSchemas';

const GV_MoreInfoModal: React.FC = () => {
  // Modal state
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Data state
  const [userData, setUserData] = useState<User | null>(null);
  const [keyFacts, setKeyFacts] = useState<KeyFact[]>([]);
  
  // Global state access
  const currentUser = useAppStore(state => state.authentication_state.current_user);
  const authToken = useAppStore(state => state.authentication_state.auth_token);
  const activeTab = useAppStore(state => state.active_tab.tab);
  
  // Handle modal open/close
  useEffect(() => {
    if (activeTab === 'more') {
      setIsOpen(true);
      fetchModalData();
    } else {
      setIsOpen(false);
    }
  }, [activeTab]);
  
  // Fetch data when modal opens
  const fetchModalData = async () => {
    if (!currentUser?.user_id || !authToken) return;
    
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      // Fetch user data
      const userResponse = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/users/${currentUser.user_id}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      
      setUserData(userResponse.data);
      
      // Fetch key facts
      const factsResponse = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/users/${currentUser.user_id}/key-facts`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      
      setKeyFacts(factsResponse.data || []);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to load data';
      setErrorMessage(errorMsg);
      console.error('Error fetching modal data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Close modal
  const closeModal = () => {
    useAppStore.getState().set_active_tab('home');
  };
  
  // Handle CV download
  const handleDownloadCV = async (format: 'pdf' | 'docx') => {
    if (!currentUser?.user_id || !authToken) return;
    
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/users/${currentUser.user_id}/resume-downloads`,
        {
          download_id: `download_${Date.now()}`,
          file_format: format,
          download_url: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/users/${currentUser.user_id}/resumes/${format}`,
          created_at: new Date().toISOString()
        },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      
      // In a real app, this would trigger the actual file download
      alert(`Your CV download in ${format.toUpperCase()} format has started!`);
    } catch (error) {
      console.error('Error initiating CV download:', error);
      alert('Failed to start CV download. Please try again.');
    }
  };
  
  // Don't render if not open
  if (!isOpen) return null;
  
  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
        onClick={closeModal}
      />
      
      {/* Modal */}
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div 
          className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col transform transition-all duration-300 scale-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 id="modal-title" className="text-xl font-bold text-gray-900">
              More Information
            </h2>
            <button
              onClick={closeModal}
              className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Modal Content */}
          <div className="overflow-y-auto flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : errorMessage ? (
              <div className="p-6">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                  <p>{errorMessage}</p>
                </div>
                <button
                  onClick={fetchModalData}
                  className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : (
              <div className="py-4">
                {/* User Info Section */}
                {userData && (
                  <div className="px-4 pb-4 border-b">
                    <div className="flex items-center space-x-3">
                      {userData.avatar_url ? (
                        <img 
                          src={userData.avatar_url} 
                          alt={userData.name} 
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-800 font-bold">
                            {userData.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900">{userData.name}</h3>
                        {userData.tagline && (
                          <p className="text-sm text-gray-600">{userData.tagline}</p>
                        )}
                      </div>
                    </div>
                    
                    {userData.bio_text && (
                      <p className="mt-3 text-gray-700 text-sm line-clamp-2">
                        {userData.bio_text}
                      </p>
                    )}
                  </div>
                )}
                
                {/* Key Facts */}
                {keyFacts.length > 0 && (
                  <div className="px-4 py-3 border-b">
                    <h3 className="font-medium text-gray-900 mb-2">Key Facts</h3>
                    <ul className="space-y-2">
                      {keyFacts.map((fact) => (
                        <li key={fact.fact_id} className="flex items-start">
                          <span className="text-blue-600 mr-2">•</span>
                          <span className="text-gray-700 text-sm">{fact.content}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Navigation Links */}
                <div className="px-4 py-3 border-b">
                  <h3 className="font-medium text-gray-900 mb-2">Sections</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link 
                        to="/about" 
                        className="flex items-center justify-between py-2 text-gray-700 hover:text-blue-600 transition-colors"
                        onClick={closeModal}
                      >
                        <span>About Me</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="/education" 
                        className="flex items-center justify-between py-2 text-gray-700 hover:text-blue-600 transition-colors"
                        onClick={closeModal}
                      >
                        <span>Education</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="/contact" 
                        className="flex items-center justify-between py-2 text-gray-700 hover:text-blue-600 transition-colors"
                        onClick={closeModal}
                      >
                        <span>Contact</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </li>
                  </ul>
                </div>
                
                {/* CV Download */}
                <div className="px-4 py-3">
                  <h3 className="font-medium text-gray-900 mb-2">Download CV</h3>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleDownloadCV('pdf')}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      PDF
                    </button>
                    <button
                      onClick={() => handleDownloadCV('docx')}
                      className="flex-1 bg-gray-100 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
                    >
                      DOCX
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default GV_MoreInfoModal;