import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/store/main';

const UV_Landing: React.FC = () => {
  // Zustand store selectors
  const currentUser = useAppStore(state => state.authentication_state.current_user);
  const featuredProjects = useAppStore(state => state.featured_projects);
  const skills = useAppStore(state => state.skills);
  const socialLinks = useAppStore(state => state.social_links);
  const isLoadingUser = useAppStore(state => state.is_loading.user);
  const isLoadingProjects = useAppStore(state => state.is_loading.projects);
  const isLoadingSkills = useAppStore(state => state.is_loading.skills);
  const isLoadingSocialLinks = useAppStore(state => state.is_loading.social_links);
  const fetchUserProfile = useAppStore(state => state.fetch_user_profile);
  const fetchFeaturedProjects = useAppStore(state => state.fetch_featured_projects);
  const fetchSkills = useAppStore(state => state.fetch_skills);
  const fetchSocialLinks = useAppStore(state => state.fetch_social_links);

  // Fetch data on component mount
  useEffect(() => {
    fetchUserProfile();
    fetchFeaturedProjects();
    fetchSkills();
    fetchSocialLinks();
  }, [fetchUserProfile, fetchFeaturedProjects, fetchSkills, fetchSocialLinks]);

  // Handle scroll to section
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Get social icon based on platform
  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'github':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
          </svg>
        );
      case 'linkedin':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
        );
      case 'twitter':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm0 22c-5.514 0-10-4.486-10-10s4.486-10 10-10 10 4.486 10 10-4.486 10-10 10zm-1-17h2v6h-2v-6zm0 8h2v2h-2v-2z" />
          </svg>
        );
    }
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 z-0 bg-gray-200 opacity-20"></div>
        <div className="relative z-10 max-w-7xl mx-auto text-center py-16 md:py-24">
          <div className="space-y-8">
            {isLoadingUser ? (
              <div className="space-y-4">
                <div className="h-12 bg-gray-200 rounded w-64 mx-auto animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded w-48 mx-auto animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-80 mx-auto animate-pulse"></div>
              </div>
            ) : (
              <>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight">
                  {currentUser?.name || 'Developer Name'}
                </h1>
                <p className="text-xl md:text-2xl text-gray-700 font-medium">
                  {currentUser?.professional_title || 'React Native Developer'}
                </p>
                <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                  {currentUser?.tagline || 'Crafting performant cross-platform applications with modern technologies'}
                </p>
              </>
            )}

            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6">
              <button
                onClick={() => scrollToSection('projects')}
                className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg shadow-lg hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-100"
              >
                View Projects
              </button>
              <button
                onClick={() => scrollToSection('contact')}
                className="px-8 py-3 bg-white text-blue-600 font-medium rounded-lg shadow-lg border border-blue-200 hover:bg-blue-50 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-100"
              >
                Contact Me
              </button>
            </div>

            {socialLinks.length > 0 && (
              <div className="flex justify-center space-x-6 pt-8">
                {socialLinks.map((link) => (
                  <a
                    key={link.link_id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-700 hover:text-blue-600 transition-colors duration-200"
                    aria-label={`Follow me on ${link.platform}`}
                  >
                    {getSocialIcon(link.platform)}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">About Me</h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
          </div>

          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="md:w-1/3 flex justify-center">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-64 h-64" />
            </div>
            <div className="md:w-2/3">
              <p className="text-lg text-gray-700 mb-6">
                {currentUser?.bio || 
                "I'm a passionate React Native developer with experience building cross-platform mobile applications. I specialize in creating performant, scalable, and user-friendly applications using modern technologies and best practices."}
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                    <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-gray-700">React Native</p>
                </div>
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                    <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-gray-700">TypeScript</p>
                </div>
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                    <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-gray-700">Mobile Optimization</p>
                </div>
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                    <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-gray-700">UI/UX Design</p>
                </div>
              </div>
              <div className="mt-8">
                <Link 
                  to="/about" 
                  className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-900 font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-gray-100"
                >
                  Learn More About Me
                  <svg className="ml-2 -mr-1 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Skills & Expertise</h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Technologies and tools I specialize in
            </p>
          </div>

          {isLoadingSkills ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-xl shadow-md animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {skills.map((skill) => (
                <div key={skill.skill_id} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200">
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      {skill.icon_name ? (
                        <span className="text-blue-600 font-bold">{skill.icon_name}</span>
                      ) : (
                        <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                      )}
                    </div>
                    <h3 className="ml-4 text-lg font-semibold text-gray-900">{skill.name}</h3>
                  </div>
                  <p className="text-gray-600">
                    {skill.description || `Proficiency in ${skill.name}`}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="mt-12 text-center">
            <Link 
              to="/skills" 
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-blue-100"
            >
              View All Skills
              <svg className="ml-2 -mr-1 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Featured Projects</h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Check out some of my recent work
            </p>
          </div>

          {isLoadingProjects ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-50 rounded-xl shadow-md overflow-hidden animate-pulse">
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProjects.map((project) => (
                <div key={project.project_id} className="bg-gray-50 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-200">
                  <div className="h-48 bg-gray-200 border-2 border-dashed rounded-t-xl"></div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{project.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{project.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.technologies_used?.split(',').map((tech, index) => (
                        <span 
                          key={index} 
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full"
                        >
                          {tech.trim()}
                        </span>
                      ))}
                    </div>
                    <Link 
                      to={`/projects/${project.project_id}`}
                      className="inline-flex items-center px-4 py-2 bg-white text-blue-600 font-medium rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-blue-100"
                    >
                      View Details
                      <svg className="ml-2 -mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-12 text-center">
            <Link 
              to="/projects" 
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-blue-100"
            >
              View All Projects
              <svg className="ml-2 -mr-1 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section id="experience" className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Work Experience</h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-blue-200 transform -translate-x-1/2 md:left-1/2"></div>
              
              {/* Experience items */}
              <div className="space-y-12">
                <div className="relative pl-12 md:pl-0 md:flex md:items-center">
                  <div className="absolute left-0 md:left-1/2 md:transform md:-translate-x-1/2 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="md:ml-16 md:mr-auto md:w-5/12 md:text-right">
                    <h3 className="text-xl font-bold text-gray-900">Senior React Native Developer</h3>
                    <p className="text-blue-600 font-medium">Tech Company Inc.</p>
                    <p className="text-gray-600 mt-1">Jan 2022 - Present</p>
                  </div>
                  <div className="mt-4 md:mt-0 md:ml-auto md:w-5/12">
                    <p className="text-gray-600">
                      Leading mobile development team, architecting scalable cross-platform solutions for enterprise clients.
                    </p>
                  </div>
                </div>

                <div className="relative pl-12 md:pl-0 md:flex md:items-center">
                  <div className="absolute left-0 md:left-1/2 md:transform md:-translate-x-1/2 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="md:ml-16 md:mr-auto md:w-5/12 md:text-right">
                    <h3 className="text-xl font-bold text-gray-900">Mobile App Developer</h3>
                    <p className="text-blue-600 font-medium">Digital Solutions Ltd.</p>
                    <p className="text-gray-600 mt-1">Mar 2020 - Dec 2021</p>
                  </div>
                  <div className="mt-4 md:mt-0 md:ml-auto md:w-5/12">
                    <p className="text-gray-600">
                      Developed and maintained multiple cross-platform mobile applications using React Native.
                    </p>
                  </div>
                </div>

                <div className="relative pl-12 md:pl-0 md:flex md:items-center">
                  <div className="absolute left-0 md:left-1/2 md:transform md:-translate-x-1/2 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="md:ml-16 md:mr-auto md:w-5/12 md:text-right">
                    <h3 className="text-xl font-bold text-gray-900">Frontend Developer</h3>
                    <p className="text-blue-600 font-medium">Web Innovations Co.</p>
                    <p className="text-gray-600 mt-1">Jun 2018 - Feb 2020</p>
                  </div>
                  <div className="mt-4 md:mt-0 md:ml-auto md:w-5/12">
                    <p className="text-gray-600">
                      Built responsive web applications with React and implemented mobile-first design principles.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link 
              to="/experience" 
              className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-medium rounded-lg shadow border border-blue-200 hover:bg-blue-50 transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-blue-100"
            >
              View Full Experience
              <svg className="ml-2 -mr-1 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Get In Touch</h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Have a project in mind or want to discuss potential opportunities? Let's connect!
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-50 rounded-2xl shadow-lg p-8 md:p-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h3>
                  <div className="space-y-6">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 bg-blue-100 p-3 rounded-lg">
                        <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h4 className="text-lg font-medium text-gray-900">Email</h4>
                        <p className="mt-1 text-gray-600">{currentUser?.email || 'user@example.com'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex-shrink-0 bg-blue-100 p-3 rounded-lg">
                        <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h4 className="text-lg font-medium text-gray-900">Phone</h4>
                        <p className="mt-1 text-gray-600">{currentUser?.phone_number || '+1 (555) 123-4567'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex-shrink-0 bg-blue-100 p-3 rounded-lg">
                        <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h4 className="text-lg font-medium text-gray-900">Location</h4>
                        <p className="mt-1 text-gray-600">{currentUser?.location || 'San Francisco, CA'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-10">
                    <Link 
                      to="/contact" 
                      className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-blue-100"
                    >
                      View Full Contact Page
                      <svg className="ml-2 -mr-1 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Quick Message</h3>
                  <form className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                      <input
                        type="text"
                        id="name"
                        className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Your name"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        id="email"
                        className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="your.email@example.com"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
                      <textarea
                        id="message"
                        rows={4}
                        className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Hi, I noticed your portfolio and would love to discuss..."
                      ></textarea>
                    </div>
                    
                    <div>
                      <button
                        type="submit"
                        className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-blue-100"
                      >
                        Send Message
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default UV_Landing;