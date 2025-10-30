import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';
import { useAppStore } from '@/store/main';
import { User, Project, KeyFact } from '@/db/zodSchemas';

// Define TypeScript interfaces
interface SocialMediaLink {
  platform: string;
  url: string;
}

const UV_Landing: React.FC = () => {
  // Zustand store access
  const currentUser = useAppStore(state => state.authentication_state.current_user);
  const authToken = useAppStore(state => state.authentication_state.auth_token);
  
  // State for scroll detection
  const [activeSection, setActiveSection] = useState('hero');
  const [searchParams] = useSearchParams();
  
  // Refs for scroll sections
  const heroRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const projectsRef = useRef<HTMLDivElement>(null);
  const factsRef = useRef<HTMLDivElement>(null);
  
  // Scroll to section if specified in URL
  useEffect(() => {
    const scrollTo = searchParams.get('scroll_to');
    if (scrollTo) {
      setTimeout(() => {
        const element = document.getElementById(scrollTo);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [searchParams]);
  
  // Scroll event listener for section detection
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      
      if (factsRef.current && scrollPosition >= factsRef.current.offsetTop) {
        setActiveSection('facts');
      } else if (projectsRef.current && scrollPosition >= projectsRef.current.offsetTop) {
        setActiveSection('projects');
      } else if (aboutRef.current && scrollPosition >= aboutRef.current.offsetTop) {
        setActiveSection('about');
      } else {
        setActiveSection('hero');
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Update active tab in store
  const setActiveTab = useAppStore(state => state.set_active_tab);
  useEffect(() => {
    setActiveTab(activeSection);
  }, [activeSection, setActiveTab]);
  
  // Fetch user data
  const {
    data: userData,
    isLoading: isUserLoading,
    isError: isUserError,
    error: userError
  } = useQuery<User>({
    queryKey: ['user', currentUser?.user_id],
    queryFn: async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/users/${currentUser?.user_id}`,
        {
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
        }
      );
      return response.data;
    },
    enabled: !!currentUser?.user_id
  });
  
  // Fetch featured projects
  const {
    data: projectsData,
    isLoading: isProjectsLoading,
    isError: isProjectsError,
    error: projectsError
  } = useQuery<Project[]>({
    queryKey: ['projects', currentUser?.user_id],
    queryFn: async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/users/${currentUser?.user_id}/projects`,
        {
          params: {
            limit: 3,
            sort_by: 'created_at',
            sort_order: 'desc'
          },
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
        }
      );
      return response.data;
    },
    enabled: !!currentUser?.user_id,
    select: (data) => data.slice(0, 3)
  });
  
  // Fetch key facts
  const {
    data: keyFactsData,
    isLoading: isKeyFactsLoading,
    isError: isKeyFactsError,
    error: keyFactsError
  } = useQuery<KeyFact[]>({
    queryKey: ['keyFacts', currentUser?.user_id],
    queryFn: async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/users/${currentUser?.user_id}/key-facts`,
        {
          params: {
            sort_by: 'display_order',
            sort_order: 'asc'
          },
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
        }
      );
      return response.data;
    },
    enabled: !!currentUser?.user_id
  });
  
  // Default social media links
  const socialLinks: SocialMediaLink[] = [
    { platform: 'github', url: '#' },
    { platform: 'linkedin', url: '#' },
    { platform: 'twitter', url: '#' },
    { platform: 'email', url: '#' }
  ];
  
  // Helper function to render social icons
  const renderSocialIcon = (platform: string) => {
    switch (platform) {
      case 'github':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
        );
      case 'linkedin':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
          </svg>
        );
      case 'twitter':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
          </svg>
        );
      case 'email':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12.713l-11.985-9.713h23.97l-11.985 9.713zm0 2.574l-12-9.725v15.438h24v-15.438l-12 9.725z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm0 22c-5.514 0-10-4.486-10-10s4.486-10 10-10 10 4.486 10 10-4.486 10-10 10zm-1-17h2v8h-2v-8zm0 10h2v2h-2v-2z" />
          </svg>
        );
    }
  };
  
  // Helper function to format tagline
  const formatTagline = (tagline: string | null | undefined) => {
    if (!tagline) return 'Professional Portfolio';
    return tagline;
  };
  
  // Loading state
  if (isUserLoading || isProjectsLoading || isKeyFactsLoading) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </>
    );
  }
  
  // Error state
  if (isUserError || isProjectsError || isKeyFactsError) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md max-w-md">
            <p className="font-medium">Error loading content</p>
            <p className="text-sm mt-1">
              {String(userError?.message || projectsError?.message || keyFactsError?.message || 'Unknown error')}
            </p>
          </div>
        </div>
      </>
    );
  }
  
  return (
    <>
      {/* Hero Section */}
      <div 
        ref={heroRef}
        id="hero"
        className="relative h-screen flex items-center justify-center"
        style={{
          backgroundImage: userData?.header_image_url 
            ? `url(${userData.header_image_url})` 
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8">
          {/* Avatar */}
          <div className="mb-6">
            <img 
              src={userData?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData?.name || 'User')}&size=128`}
              alt={userData?.name}
              className="w-32 h-32 rounded-full mx-auto border-4 border-white shadow-xl"
            />
          </div>
          
          {/* Name */}
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            {userData?.name || 'Your Name'}
          </h1>
          
          {/* Tagline */}
          <p className="text-xl md:text-2xl text-gray-200 mb-8">
            {formatTagline(userData?.tagline)}
          </p>
          
          {/* Social Media Icons */}
          <div className="flex justify-center space-x-6 mb-10">
            {socialLinks.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-gray-200 transition-colors duration-200"
                aria-label={link.platform}
              >
                <div className="bg-black bg-opacity-30 rounded-full p-3 hover:bg-opacity-50 transition-all duration-200">
                  {renderSocialIcon(link.platform)}
                </div>
              </a>
            ))}
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="px-6 py-3 bg-white text-blue-600 font-medium rounded-lg shadow-lg hover:bg-gray-100 transition-colors duration-200"
            >
              Contact Me
            </Link>
            <a
              href="#"
              className="px-6 py-3 bg-transparent border-2 border-white text-white font-medium rounded-lg hover:bg-white hover:text-gray-900 transition-colors duration-200"
            >
              Download CV
            </a>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 animate-bounce">
          <a href="#about" className="text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </a>
        </div>
      </div>
      
      {/* About Section */}
      <div 
        ref={aboutRef}
        id="about"
        className="py-16 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">About Me</h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
          </div>
          
          <div className="max-w-3xl mx-auto">
            {userData?.bio_text ? (
              <p className="text-lg text-gray-600 leading-relaxed">
                {userData.bio_text}
              </p>
            ) : (
              <p className="text-lg text-gray-600 leading-relaxed">
                Welcome to my professional portfolio. I'm passionate about creating innovative solutions and delivering exceptional results. With years of experience in my field, I strive to continuously learn and grow while contributing to meaningful projects.
              </p>
            )}
            
            {/* Key Facts */}
            {keyFactsData && keyFactsData.length > 0 && (
              <div className="mt-10">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Facts</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {keyFactsData.map((fact) => (
                    <li key={fact.fact_id} className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-5 h-5 rounded-full bg-blue-600"></div>
                      </div>
                      <p className="ml-3 text-gray-600">{fact.content}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Projects Section */}
      <div 
        ref={projectsRef}
        id="projects"
        className="py-16 bg-gray-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Projects</h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
          </div>
          
          {projectsData && projectsData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projectsData.map((project) => (
                <div 
                  key={project.project_id} 
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="h-48 bg-gray-200 relative">
                    {project.thumbnail_url ? (
                      <img 
                        src={project.thumbnail_url} 
                        alt={project.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{project.title}</h3>
                    <p className="text-gray-600 mb-4">
                      {project.short_description || 'Project description coming soon...'}
                    </p>
                    <div className="flex justify-between items-center">
                      <Link
                        to={`/project/${project.project_id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                      >
                        View Details
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                      {project.project_url && (
                        <a 
                          href={project.project_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-1 17l-5-5.299 1.399-1.43 3.574 3.736 6.572-7.007 1.457 1.403-8 8.597z" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No projects available</h3>
              <p className="mt-1 text-gray-500">Check back later for featured projects.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Key Facts Section */}
      <div 
        ref={factsRef}
        id="facts"
        className="py-16 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Quick Facts</h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
          </div>
          
          {keyFactsData && keyFactsData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {keyFactsData.map((fact, index) => (
                <div 
                  key={fact.fact_id} 
                  className="text-center p-6 bg-gray-50 rounded-lg"
                >
                  <div className="text-4xl font-bold text-blue-600 mb-2">0{index + 1}</div>
                  <p className="text-gray-700">{fact.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No facts available</h3>
              <p className="mt-1 text-gray-500">Check back later for interesting facts.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UV_Landing;