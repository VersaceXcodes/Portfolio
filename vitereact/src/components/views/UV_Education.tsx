import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/store/main';
import axios from 'axios';
import { Education } from '@/DB/zodschemas';

const UV_Education: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const currentUser = useAppStore(state => state.authentication_state.current_user);
  const authToken = useAppStore(state => state.authentication_state.auth_token);
  
  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };
  
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };
  
  const {
    data: educationEntries = [],
    isLoading,
    error,
    refetch
  } = useQuery<Education[]>({
    queryKey: ['education', currentUser?.user_id, sortOrder],
    queryFn: async () => {
      if (!currentUser?.user_id) return [];
      
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/users/${currentUser.user_id}/education`,
        {
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
          params: {
            sort_by: 'start_date',
            sort_order: sortOrder
          }
        }
      );
      
      return response.data.map((item: any) => ({
        education_id: item.education_id,
        user_id: item.user_id,
        institution_name: item.institution_name,
        degree: item.degree,
        institution_logo_url: item.institution_logo_url,
        start_date: item.start_date,
        end_date: item.end_date,
        is_current: item.is_current,
        location: item.location,
        description: item.description,
        display_order: item.display_order
      }));
    },
    enabled: !!currentUser?.user_id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  };
  
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Education</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              My academic journey and qualifications
            </p>
          </div>
          
          {/* Sort Controls */}
          <div className="flex justify-end mb-6">
            <button
              onClick={toggleSortOrder}
              className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              <span className="mr-2">Sort: {sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}</span>
              <svg 
                className={`w-4 h-4 transition-transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
          </div>
          
          {/* Timeline */}
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 transform md:translate-x-1"></div>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-6 rounded-lg text-center">
                <p className="font-medium mb-2">Failed to load education data</p>
                <p className="text-sm mb-4">{(error as Error).message}</p>
                <button
                  onClick={() => refetch()}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  Retry
                </button>
              </div>
            ) : educationEntries.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
                <svg 
                  className="mx-auto h-12 w-12 text-gray-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">No education entries</h3>
                <p className="mt-2 text-gray-500">Education information will appear here when added.</p>
              </div>
            ) : (
              <ul className="space-y-8">
                {educationEntries.map((entry, index) => {
                  const isExpanded = expandedId === entry.education_id;
                  const startDate = formatDate(entry.start_date);
                  const endDate = entry.is_current 
                    ? 'Present' 
                    : entry.end_date 
                      ? formatDate(entry.end_date) 
                      : 'Unknown';
                  
                  return (
                    <li key={entry.education_id} className="relative">
                      {/* Timeline dot */}
                      <div className="absolute left-0 md:left-1/2 top-6 w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow transform md:-translate-x-2"></div>
                      
                      {/* Content card */}
                      <div 
                        className={`ml-8 md:ml-0 md:mr-auto md:pr-8 ${index % 2 === 0 ? 'md:pl-8 md:mr-0 md:ml-auto md:pl-16 md:text-right' : 'md:pr-16'}`}
                      >
                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-xl">
                          {/* Card header */}
                          <div className="p-6">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                              <div>
                                <h3 className="text-xl font-bold text-gray-900">{entry.institution_name}</h3>
                                {entry.degree && (
                                  <p className="text-blue-600 font-medium mt-1">{entry.degree}</p>
                                )}
                              </div>
                              
                              {entry.institution_logo_url ? (
                                <img 
                                  src={entry.institution_logo_url} 
                                  alt={`${entry.institution_name} logo`}
                                  className="h-12 w-12 object-contain mt-2 md:mt-0"
                                />
                              ) : (
                                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-12 h-12 mt-2 md:mt-0" />
                              )}
                            </div>
                            
                            <div className="mt-4 flex flex-wrap items-center text-sm text-gray-600">
                              <span className="font-medium">{startDate} - {endDate}</span>
                              {entry.location && (
                                <>
                                  <span className="mx-2">•</span>
                                  <span>{entry.location}</span>
                                </>
                              )}
                            </div>
                          </div>
                          
                          {/* Expandable content */}
                          {(entry.description || isExpanded) && (
                            <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-96' : 'max-h-0'}`}>
                              <div className="px-6 pb-6">
                                {entry.description && (
                                  <p className="text-gray-700 mt-4 whitespace-pre-line">{entry.description}</p>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {/* Expand button */}
                          <div className="px-6 py-4 border-t border-gray-100">
                            <button
                              onClick={() => toggleExpand(entry.education_id)}
                              className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              {isExpanded ? 'Show Less' : 'Show More'}
                              <svg 
                                className={`ml-2 w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default UV_Education;