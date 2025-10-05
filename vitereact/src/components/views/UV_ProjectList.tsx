import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/store/main';
import { Project } from '@/store/main';

// Define the response type for our API call
interface ProjectsResponse {
  projects: Project[];
  total: number;
}

const UV_ProjectList: React.FC = () => {
  // Get authentication state from global store
  const currentUser = useAppStore(state => state.authentication_state.current_user);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 12;

  // Fetch projects using React Query
  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery<ProjectsResponse, Error>({
    queryKey: ['projects', currentUser?.user_id, currentPage],
    queryFn: async () => {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/projects`, {
        params: {
          user_id: currentUser?.user_id,
          limit,
          offset: (currentPage - 1) * limit
        }
      });
      return response.data;
    },
    enabled: !!currentUser?.user_id,
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false,
    retry: 1
  });

  // Reset to first page when user changes
  useEffect(() => {
    setCurrentPage(1);
  }, [currentUser?.user_id]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Calculate pagination values
  const totalProjects = data?.total || 0;
  const totalPages = Math.ceil(totalProjects / limit);
  const projects = data?.projects || [];

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Project Portfolio</h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Explore my collection of React Native projects, showcasing technical skills and problem-solving abilities.
            </p>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                      <div className="h-6 bg-gray-200 rounded w-14"></div>
                    </div>
                    <div className="h-10 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error state */}
          {isError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-6 rounded-lg mb-8 text-center">
              <h3 className="font-bold text-lg mb-2">Error Loading Projects</h3>
              <p className="mb-4">{error?.message || 'An unexpected error occurred while fetching projects.'}</p>
              <button
                onClick={() => refetch()}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Projects grid */}
          {!isLoading && !isError && (
            <>
              {projects.length === 0 ? (
                <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No Projects Found</h3>
                  <p className="text-gray-600">There are currently no projects to display.</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                    {projects.map((project) => (
                      <div 
                        key={project.project_id} 
                        className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300 flex flex-col h-full"
                      >
                        {/* Project image placeholder */}
                        <div className="h-48 bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                          <div className="text-white text-center p-4">
                            <span className="text-5xl font-bold opacity-20">DEV</span>
                          </div>
                        </div>
                        
                        <div className="p-6 flex-grow flex flex-col">
                          <div className="flex-grow">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{project.title}</h3>
                            <p className="text-gray-600 mb-4 line-clamp-3">{project.description}</p>
                            
                            {/* Technologies tags */}
                            {project.technologies_used && (
                              <div className="flex flex-wrap gap-2 mb-4">
                                {project.technologies_used.split(',').map((tech, index) => (
                                  <span 
                                    key={index} 
                                    className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
                                  >
                                    {tech.trim()}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          {/* Status and CTA */}
                          <div className="mt-auto">
                            <div className="flex justify-between items-center mb-4">
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                project.status === 'Live' 
                                  ? 'bg-green-100 text-green-800' 
                                  : project.status === 'In Progress' 
                                    ? 'bg-yellow-100 text-yellow-800' 
                                    : 'bg-gray-100 text-gray-800'
                              }`}>
                                {project.status || 'Draft'}
                              </span>
                            </div>
                            
                            <Link
                              to={`/projects/${project.project_id}`}
                              className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            >
                              View Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-12">
                      <nav className="flex items-center space-x-2">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className={`px-4 py-2 rounded-md ${
                            currentPage === 1
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                          }`}
                        >
                          Previous
                        </button>
                        
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`px-4 py-2 rounded-md ${
                                currentPage === pageNum
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                        
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className={`px-4 py-2 rounded-md ${
                            currentPage === totalPages
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                          }`}
                        >
                          Next
                        </button>
                      </nav>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default UV_ProjectList;