import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAppStore } from '@/store/main';

// Types from Zod schemas
import type { Project, ProjectImage } from '@/store/main';

const UV_ProjectDetail: React.FC = () => {
  // Get project ID from URL params
  const { project_id } = useParams<{ project_id: string }>();
  
  // Get auth token from global state
  const authToken = useAppStore(state => state.authentication_state.auth_token);
  
  // API base URL
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  
  // Fetch project details
  const {
    data: project,
    isLoading: isProjectLoading,
    isError: isProjectError,
    error: projectError
  } = useQuery<Project>({
    queryKey: ['project', project_id],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE_URL}/api/projects/${project_id}`);
      return response.data;
    },
    enabled: !!project_id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1
  });
  
  // Fetch project images
  const {
    data: images,
    isLoading: isImagesLoading,
    isError: isImagesError,
    error: imagesError
  } = useQuery<ProjectImage[]>({
    queryKey: ['project-images', project_id],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE_URL}/api/project-images`, {
        params: { project_id }
      });
      return response.data.images;
    },
    enabled: !!project_id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1
  });

  // Loading state
  if (isProjectLoading || isImagesLoading) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </>
    );
  }

  // Error state
  if (isProjectError || isImagesError) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              <h3 className="text-lg font-medium">Error loading project</h3>
              <p className="mt-2 text-sm">
                {(projectError as Error)?.message || (imagesError as Error)?.message || 'An unexpected error occurred'}
              </p>
              <div className="mt-4">
                <Link 
                  to="/projects"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Back to Projects
                </Link>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Main render
  return (
    <>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Back to projects link */}
          <div className="mb-8">
            <Link 
              to="/projects"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to all projects
            </Link>
          </div>

          {project && (
            <article className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Project header */}
              <header className="p-6 border-b border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
                    {project.project_type && (
                      <span className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {project.project_type}
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-4 md:mt-0">
                    {project.status && (
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        project.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : project.status === 'in-progress'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}>
                        {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                      </span>
                    )}
                  </div>
                </div>
                
                {project.role_in_project && (
                  <p className="mt-4 text-gray-600">
                    <span className="font-medium">My Role:</span> {project.role_in_project}
                  </p>
                )}
              </header>

              {/* Project images gallery */}
              {images && images.length > 0 && (
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Gallery</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {images.map((image) => (
                      <div key={image.image_id} className="rounded-lg overflow-hidden shadow-md">
                        <img
                          src={image.image_url}
                          alt={image.alt_text || `${project.title} screenshot`}
                          className="w-full h-64 object-cover"
                        />
                        {image.caption && (
                          <p className="mt-2 text-sm text-gray-600 px-2">{image.caption}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Project description */}
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
                <div 
                  className="prose max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: project.description }}
                />
              </div>

              {/* Problem statement */}
              {project.problem_statement && (
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Problem Statement</h2>
                  <div 
                    className="prose max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{ __html: project.problem_statement }}
                  />
                </div>
              )}

              {/* Solution approach */}
              {project.solution_approach && (
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Solution Approach</h2>
                  <div 
                    className="prose max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{ __html: project.solution_approach }}
                  />
                </div>
              )}

              {/* Technical challenges */}
              {project.technical_challenges && (
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Technical Challenges</h2>
                  <div 
                    className="prose max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{ __html: project.technical_challenges }}
                  />
                </div>
              )}

              {/* Technologies used */}
              {project.technologies_used && (
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Technologies Used</h2>
                  <div 
                    className="prose max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{ __html: project.technologies_used }}
                  />
                </div>
              )}

              {/* Links section */}
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Links</h2>
                <div className="flex flex-wrap gap-3">
                  {project.live_demo_url && (
                    <a
                      href={project.live_demo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Live Demo
                    </a>
                  )}
                  
                  {project.github_repo_url && (
                    <a
                      href={project.github_repo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
                      </svg>
                      GitHub Repository
                    </a>
                  )}
                  
                  {project.app_store_url && (
                    <a
                      href={project.app_store_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      App Store
                    </a>
                  )}
                  
                  {project.play_store_url && (
                    <a
                      href={project.play_store_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Play Store
                    </a>
                  )}
                  
                  {project.case_study_url && (
                    <a
                      href={project.case_study_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Case Study
                    </a>
                  )}
                </div>
              </div>
            </article>
          )}
        </div>
      </div>
    </>
  );
};

export default UV_ProjectDetail;