import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAppStore } from '@/store/main';
import { Experience } from '@/store/main';

const UV_ExperienceTimeline: React.FC = () => {
  const currentUser = useAppStore(state => state.authentication_state.current_user);
  
  const fetchExperiences = async (): Promise<Experience[]> => {
    if (!currentUser?.user_id) {
      return [];
    }
    
    const response = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/experiences`,
      {
        params: {
          user_id: currentUser.user_id,
          sort_by: 'start_date',
          sort_order: 'desc'
        }
      }
    );
    
    return response.data.experiences;
  };
  
  const { data: experiences = [], isLoading, error } = useQuery({
    queryKey: ['experiences', currentUser?.user_id],
    queryFn: fetchExperiences,
    enabled: !!currentUser?.user_id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatDuration = (startDate: string, endDate: string | null): string => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    
    const diffMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    const years = Math.floor(diffMonths / 12);
    const months = diffMonths % 12;
    
    let result = '';
    if (years > 0) {
      result += `${years} yr${years > 1 ? 's' : ''}`;
    }
    if (months > 0) {
      if (result) result += ' ';
      result += `${months} mo${months > 1 ? 's' : ''}`;
    }
    
    return result || '1 mo';
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Professional Experience</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A timeline of my professional journey and key milestones in my career.
            </p>
          </div>

          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              <p>Failed to load experiences. Please try again later.</p>
            </div>
          )}

          {!isLoading && !error && experiences.length === 0 && (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No experiences found</h3>
              <p className="text-gray-600">There are no professional experiences to display at this time.</p>
            </div>
          )}

          {!isLoading && !error && experiences.length > 0 && (
            <div className="relative">
              {/* Vertical timeline line */}
              <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 transform md:translate-x-[-1px]"></div>
              
              <ol className="space-y-12">
                {experiences.map((exp, index) => {
                  const isEven = index % 2 === 0;
                  
                  return (
                    <li key={exp.experience_id} className="relative">
                      {/* Timeline dot */}
                      <div className="absolute left-0 md:left-1/2 top-6 w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow transform md:translate-x-[-8px]"></div>
                      
                      <div className={`ml-8 md:ml-0 ${isEven ? 'md:pr-8 md:pl-0 md:pt-0 md:text-right' : 'md:pl-8 md:pr-0 md:pt-0'}`}>
                        <div className={`bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 transition-all duration-200 hover:shadow-xl ${isEven ? 'md:float-right' : 'md:float-left'} w-full md:w-[48%]`}>
                          <div className="p-6">
                            {/* Company header */}
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                              <div>
                                {exp.company_logo_url ? (
                                  <img 
                                    src={exp.company_logo_url} 
                                    alt={`${exp.company_name} logo`}
                                    className="w-12 h-12 object-contain rounded"
                                  />
                                ) : (
                                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-12 h-12 flex items-center justify-center">
                                    <span className="text-gray-500 text-xs font-bold">
                                      {exp.company_name.charAt(0)}
                                    </span>
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex flex-wrap items-baseline justify-between gap-2">
                                  <h3 className="text-xl font-bold text-gray-900">{exp.company_name}</h3>
                                  {exp.company_website_url && (
                                    <a 
                                      href={exp.company_website_url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                    >
                                      Visit Website
                                    </a>
                                  )}
                                </div>
                                
                                 <p className="text-lg text-gray-700 mt-1">{exp.role_title}</p>
                              </div>
                            </div>
                            
                            {/* Date and location */}
                            <div className="flex flex-wrap items-center gap-3 mb-4 text-gray-600">
                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                                <span className="text-sm">
                                  {formatDate(exp.start_date)} - {exp.is_current ? 'Present' : formatDate(exp.end_date || '')}
                                </span>
                              </div>
                              
                              <span className="text-gray-300">•</span>
                              
                              <span className="text-sm">
                                {formatDuration(exp.start_date, exp.is_current ? null : exp.end_date)}
                              </span>
                              
                              {exp.location && (
                                <>
                                  <span className="text-gray-300">•</span>
                                  <div className="flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                    </svg>
                                    <span className="text-sm">
                                      {exp.location}
                                      {exp.is_current && ' (Remote)'}
                                    </span>
                                  </div>
                                </>
                              )}
                            </div>
                            
                            {/* Description */}
                            {exp.description && (
                              <p className="text-gray-700 mb-4 whitespace-pre-line">
                                {exp.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Clear floats for responsive layout */}
                      <div className="clear-both"></div>
                    </li>
                  );
                })}
              </ol>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UV_ExperienceTimeline;