import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAppStore } from '@/store/main';
import { Link, useSearchParams } from 'react-router-dom';
import { Experience } from '@/DB/zodschemas';

const UV_Experience: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  
  // Get sort order from URL params or default to 'desc'
  const sortOrder = searchParams.get('sort_order') || 'desc';
  
  // Global state access
  const currentUser = useAppStore(state => state.authentication_state.current_user);
  const authToken = useAppStore(state => state.authentication_state.auth_token);
  
  // Toggle sort order
  const toggleSortOrder = () => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSearchParams({ sort_order: newOrder });
  };
  
  // Toggle expanded state for an item
  const toggleExpand = (id: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Fetch experiences
  const { data, isLoading, error } = useQuery({
    queryKey: ['experiences', currentUser?.user_id, sortOrder],
    queryFn: async () => {
      if (!currentUser?.user_id) throw new Error('User not authenticated');
      
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/users/${currentUser.user_id}/experiences`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`
          },
          params: {
            sort_by: 'start_date',
            sort_order: sortOrder
          }
        }
      );
      
      return response.data as Experience[];
    },
    enabled: !!currentUser?.user_id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
  
  // Render loading state
  if (isLoading) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-48 mx-auto animate-pulse"></div>
            </div>
            
            <div className="flex justify-center mb-8">
              <div className="h-10 w-48 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
            
            <div className="space-y-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-6">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse"></div>
                    <div className="h-full w-1 bg-gray-200 mt-2 animate-pulse"></div>
                  </div>
                  <div className="flex-1 pb-8">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <h3 className="text-lg font-medium text-red-800 mb-2">Error loading experiences</h3>
              <p className="text-red-700 mb-4">
                {error instanceof Error ? error.message : 'An unknown error occurred'}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }
  
  // Render empty state
  if (!data || data.length === 0) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Experience Timeline</h2>
              <p className="text-gray-600 mb-8">No experience entries found</p>
              
              <div className="bg-white border border-gray-200 rounded-lg p-8 max-w-md mx-auto">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No experiences yet</h3>
                <p className="text-gray-500 mb-4">
                  When you add your professional experiences, they'll appear here.
                </p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
  
  return (
    <>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Experience Timeline</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              My professional journey and career milestones
            </p>
          </div>
          
          {/* Sort Controls */}
          <div className="flex justify-center mb-10">
            <button
              onClick={toggleSortOrder}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 rounded-full shadow-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <svg 
                className={`w-5 h-5 transition-transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
              </svg>
              <span>
                {sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}
              </span>
            </button>
          </div>
          
          {/* Timeline */}
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 transform translate-x-1/2 z-0"></div>
            
            {/* Timeline items */}
            <div className="space-y-8 relative z-10">
              {data.map((experience) => {
                const isExpanded = expandedItems[experience.experience_id] || false;
                
                return (
                  <div 
                    key={experience.experience_id} 
                    className="relative flex gap-6 group"
                  >
                    {/* Timeline marker */}
                    <div className="flex flex-col items-center z-10">
                      <div className="w-12 h-12 rounded-full bg-white border-4 border-blue-600 flex items-center justify-center shadow-sm">
                        {experience.company_logo_url ? (
                          <img 
                            src={experience.company_logo_url} 
                            alt={experience.company_name} 
                            className="w-8 h-8 rounded-full object-contain"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="h-full w-0.5 bg-gray-200 mt-2 group-last:hidden"></div>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 pb-8">
                      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6">
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900">{experience.role_title}</h3>
                              <p className="text-lg text-blue-600 font-medium">{experience.company_name}</p>
                            </div>
                            <div className="flex-shrink-0">
                              <p className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                {formatDate(experience.start_date)} - {experience.is_current ? (
                                  <span className="text-green-600 font-medium">Present</span>
                                ) : (
                                  experience.end_date ? formatDate(experience.end_date) : 'Unknown'
                                )}
                              </p>
                            </div>
                          </div>
                          
                          {experience.location && (
                            <p className="text-gray-600 mb-4 flex items-center">
                              <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                              </svg>
                              {experience.location}
                            </p>
                          )}
                          
                          {experience.description && (
                            <div className={`prose prose-sm text-gray-700 mb-4 ${!isExpanded ? 'line-clamp-3' : ''}`}>
                              {experience.description}
                            </div>
                          )}
                          
                          <button
                            onClick={() => toggleExpand(experience.experience_id)}
                            className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
                          >
                            {isExpanded ? 'Show less' : 'Show more'}
                            <svg 
                              className={`w-4 h-4 ml-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                          </button>
                        </div>
                        
                        {isExpanded && (
                          <div className="border-t border-gray-100 bg-gray-50 p-6">
                            <h4 className="font-semibold text-gray-900 mb-3">Key Responsibilities:</h4>
                            <ul className="space-y-2">
                              <li className="flex items-start">
                                <span className="flex-shrink-0 w-2 h-2 mt-2 bg-blue-600 rounded-full mr-3"></span>
                                <span className="text-gray-700">
                                  Worked as {experience.role_title} at {experience.company_name}
                                </span>
                              </li>
                              <li className="flex items-start">
                                <span className="flex-shrink-0 w-2 h-2 mt-2 bg-blue-600 rounded-full mr-3"></span>
                                <span className="text-gray-700">
                                  Contributed to key projects and initiatives
                                </span>
                              </li>
                              <li className="flex items-start">
                                <span className="flex-shrink-0 w-2 h-2 mt-2 bg-blue-600 rounded-full mr-3"></span>
                                <span className="text-gray-700">
                                  Collaborated with cross-functional teams
                                </span>
                              </li>
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* CTA Section */}
          <div className="mt-16 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Interested in working together?</h3>
            <Link 
              to="/contact" 
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              Get in touch
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default UV_Experience;