import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/store/main';
import { Project } from '@/db/zodschemas';

const UV_Projects: React.FC = () => {
  // Global state
  const currentUser = useAppStore(state => state.authentication_state.current_user);
  const authToken = useAppStore(state => state.authentication_state.auth_token);

  // Local state
  const [queryTerm, setQueryTerm] = useState('');
  const [debouncedQueryTerm, setDebouncedQueryTerm] = useState('');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQueryTerm(queryTerm);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [queryTerm]);

  // API calls
  const {
    data: projectsData,
    isLoading: isLoadingProjects,
    error: projectsError,
    refetch: refetchProjects
  } = useQuery<Project[], Error>({
    queryKey: ['projects', currentUser?.user_id],
    queryFn: async () => {
      if (!currentUser?.user_id) return [];
      
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/users/${currentUser.user_id}/projects`,
        {
          params: {
            limit: 100,
            sort_by: 'display_order',
            sort_order: 'asc'
          },
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
        }
      );
      
      return response.data;
    },
    enabled: !!currentUser?.user_id,
    staleTime: 60000,
    refetchOnWindowFocus: false,
    retry: 1
  });

  const {
    data: searchResults,
    isLoading: isLoadingSearch,
    error: searchError
  } = useQuery<Project[], Error>({
    queryKey: ['projects-search', currentUser?.user_id, debouncedQueryTerm],
    queryFn: async () => {
      if (!currentUser?.user_id || !debouncedQueryTerm.trim()) return [];
      
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/users/${currentUser.user_id}/projects`,
        {
          params: {
            search: debouncedQueryTerm,
            limit: 100
          },
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
        }
      );
      
      return response.data;
    },
    enabled: !!currentUser?.user_id && !!debouncedQueryTerm.trim(),
    staleTime: 30000,
    refetchOnWindowFocus: false,
    retry: 1
  });

  // Determine which data to display
  const displayProjects = useMemo(() => {
    if (debouncedQueryTerm.trim()) {
      return searchResults || [];
    }
    return projectsData || [];
  }, [projectsData, searchResults, debouncedQueryTerm]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQueryTerm(e.target.value);
  };

  // Handle project card actions
  const handleProjectAction = (url: string | null) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // Render project card
  const renderProjectCard = (project: Project) => (
    <div 
      key={project.project_id}
      className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden flex flex-col h-full transition-all duration-200 hover:shadow-xl"
    >
      <div className="relative h-48 overflow-hidden">
        {project.thumbnail_url ? (
          <img 
            src={project.thumbnail_url} 
            alt={project.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500">No Image</span>
          </div>
        )}
      </div>
      
      <div className="p-6 flex-grow flex flex-col">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{project.title}</h3>
        <p className="text-gray-600 mb-4 flex-grow">
          {project.short_description || 'No description available'}
        </p>
        
        {project.tech_stack && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {project.tech_stack.split(',').map((tech, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
                >
                  {tech.trim()}
                </span>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex gap-2 mt-auto">
          {project.project_url && (
            <button
              onClick={() => handleProjectAction(project.project_url)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              View Project
            </button>
          )}
          
          {project.source_code_url && (
            <button
              onClick={() => handleProjectAction(project.source_code_url)}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900 transition-colors"
            >
              Source Code
            </button>
          )}
          
          <Link
            to={`/project/${project.project_id}`}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Details
          </Link>
        </div>
      </div>
    </div>
  );

  // Loading state
  if (isLoadingProjects || isLoadingSearch) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Featured Projects Portfolio
              </h1>
              
              <div className="max-w-2xl mx-auto">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search projects..."
                    className="w-full px-6 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                    value={queryTerm}
                    onChange={handleSearchChange}
                  />
                  <div className="absolute right-3 top-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  // Error state
  if (projectsError || searchError) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Featured Projects Portfolio
              </h1>
              
              <div className="max-w-2xl mx-auto mb-8">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search projects..."
                    className="w-full px-6 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                    value={queryTerm}
                    onChange={handleSearchChange}
                  />
                </div>
              </div>
              
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-6 rounded-xl max-w-2xl mx-auto">
                <h3 className="font-bold text-lg mb-2">Error Loading Projects</h3>
                <p className="mb-4">
                  {projectsError?.message || searchError?.message || 'Failed to load projects. Please try again later.'}
                </p>
                <button
                  onClick={() => refetchProjects()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Main content
  return (
    <>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Projects Portfolio
            </h1>
            <p className="text-gray-600 max-w-3xl mx-auto mb-8">
              Explore my featured work showcasing technical skills and problem-solving approaches
            </p>
            
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search projects by keyword..."
                  className="w-full px-6 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                  value={queryTerm}
                  onChange={handleSearchChange}
                />
                {debouncedQueryTerm && (
                  <button 
                    onClick={() => setQueryTerm('')}
                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
              
              {debouncedQueryTerm && (
                <p className="text-sm text-gray-500 mt-2">
                  Showing {displayProjects.length} result{displayProjects.length !== 1 ? 's' : ''} for "{debouncedQueryTerm}"
                </p>
              )}
            </div>
          </div>
          
          {displayProjects.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No projects found</h3>
              <p className="text-gray-500">
                {debouncedQueryTerm 
                  ? 'Try adjusting your search terms' 
                  : 'No projects available at the moment'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayProjects.map(renderProjectCard)}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UV_Projects;