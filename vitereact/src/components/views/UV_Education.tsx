import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAppStore } from '@/store/main';
import { Education, Certification } from '@/store/main';

const UV_Education: React.FC = () => {
  // Get current user from global state
  const currentUser = useAppStore(state => state.authentication_state.current_user);
  
  // API base URL
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

  // Fetch education data
  const {
    data: educationData,
    isLoading: educationLoading,
    error: educationError
  } = useQuery({
    queryKey: ['educations', currentUser?.user_id],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE_URL}/api/educations`, {
        params: {
          user_id: currentUser?.user_id,
          sort_by: 'start_date',
          sort_order: 'desc'
        }
      });
      return response.data.educations as Education[];
    },
    enabled: !!currentUser?.user_id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  // Fetch certification data
  const {
    data: certificationData,
    isLoading: certificationLoading,
    error: certificationError
  } = useQuery({
    queryKey: ['certifications', currentUser?.user_id],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE_URL}/api/certifications`, {
        params: {
          user_id: currentUser?.user_id,
          sort_by: 'issue_date',
          sort_order: 'desc'
        }
      });
      return response.data.certifications as Certification[];
    },
    enabled: !!currentUser?.user_id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Present';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Education & Certifications</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Detailed registry of formal educational achievements and professional certifications
            </p>
          </div>

          {/* Education Section */}
          <section className="mb-16">
            <div className="flex items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 border-l-4 border-blue-600 pl-4">Education</h2>
            </div>

            {educationLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              </div>
            ) : educationError ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <p>Error loading education data. Please try again later.</p>
              </div>
            ) : educationData && educationData.length > 0 ? (
              <div className="space-y-6">
                {educationData.map((edu) => (
                  <div 
                    key={edu.education_id} 
                    className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-xl"
                  >
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{edu.institution_name}</h3>
                          <p className="text-lg text-blue-600 font-medium mt-1">{edu.degree}</p>
                          {edu.field_of_study && (
                            <p className="text-gray-600 mt-2">Field of Study: {edu.field_of_study}</p>
                          )}
                          {edu.description && (
                            <p className="text-gray-600 mt-2">{edu.description}</p>
                          )}
                        </div>
                        <div className="flex-shrink-0">
                          <p className="text-gray-700 font-medium bg-gray-100 px-3 py-1 rounded-full">
                            {formatDate(edu.start_date)} - {formatDate(edu.end_date)}
                          </p>
                          {edu.grade && (
                            <p className="text-center text-gray-700 mt-2 font-medium">
                              Grade: {edu.grade}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {edu.institution_website_url && (
                        <div className="mt-4">
                          <a 
                            href={edu.institution_website_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Institution Website
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                            </svg>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <p className="text-gray-500">No education data available</p>
              </div>
            )}
          </section>

          {/* Certifications Section */}
          <section>
            <div className="flex items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 border-l-4 border-blue-600 pl-4">Certifications</h2>
            </div>

            {certificationLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              </div>
            ) : certificationError ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <p>Error loading certification data. Please try again later.</p>
              </div>
            ) : certificationData && certificationData.length > 0 ? (
              <div className="space-y-6">
                {certificationData.map((cert) => (
                  <div 
                    key={cert.certification_id} 
                    className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-xl"
                  >
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{cert.name}</h3>
                          <p className="text-lg text-blue-600 font-medium mt-1">{cert.issuing_organization}</p>
                          {cert.credential_id && (
                            <p className="text-gray-600 mt-2">Credential ID: {cert.credential_id}</p>
                          )}
                        </div>
                        <div className="flex-shrink-0">
                          <p className="text-gray-700 font-medium bg-gray-100 px-3 py-1 rounded-full">
                            Issued: {formatDate(cert.issue_date)}
                          </p>
                          {cert.expiration_date && (
                            <p className="text-center text-gray-700 mt-2 font-medium">
                              Expires: {formatDate(cert.expiration_date)}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {cert.credential_url && (
                        <div className="mt-4">
                          <a 
                            href={cert.credential_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                          >
                            View Credential
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                            </svg>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <p className="text-gray-500">No certification data available</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
};

export default UV_Education;