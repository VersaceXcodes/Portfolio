import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppStore } from '@/store/main';
import { Menu, X, Download, User } from 'lucide-react';

const GV_TopNav: React.FC = () => {
  // Global state selectors
  const isAuthenticated = useAppStore(state => state.authentication_state.authentication_status.is_authenticated);
  const currentUser = useAppStore(state => state.authentication_state.current_user);
  const activeNavSection = useAppStore(state => state.active_nav_section);
  const isMobileMenuOpen = useAppStore(state => state.is_mobile_menu_open);
  const toggleMobileMenu = useAppStore(state => state.toggle_mobile_menu);
  const closeMobileMenu = useAppStore(state => state.close_mobile_menu);
  const setActiveNavSection = useAppStore(state => state.set_active_nav_section);
  const resumeDownload = useAppStore(state => state.resume_download);
  
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  // Navigation links
  const navLinks = [
    { label: 'Home', href: '/', is_external: false },
    { label: 'About', href: '/about', is_external: false },
    { label: 'Skills', href: '/skills', is_external: false },
    { label: 'Projects', href: '/projects', is_external: false },
    { label: 'Blog', href: '/blog', is_external: false },
    { label: 'Contact', href: '/contact', is_external: false },
  ];

  // Handle scroll for navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when location changes
  useEffect(() => {
    closeMobileMenu?.();
  }, [location, closeMobileMenu]);

  // Determine active section based on pathname
  useEffect(() => {
    const pathToSectionMap: Record<string, string> = {
      '/': 'home',
      '/about': 'about',
      '/skills': 'skills',
      '/projects': 'projects',
      '/blog': 'blog',
      '/contact': 'contact',
    };
    
    const section = pathToSectionMap[location.pathname] || 'home';
    setActiveNavSection?.(section);
  }, [location.pathname, setActiveNavSection]);

  // Handle escape key to close mobile menu
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        closeMobileMenu?.();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMobileMenuOpen, closeMobileMenu]);

  return (
    <>
      {/* Sticky top navigation */}
      <nav 
        className={`fixed w-full z-50 transition-all duration-300 ${
          scrolled 
            ? 'bg-white/90 backdrop-blur-sm shadow-md py-2' 
            : 'bg-white py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Brand/Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link 
                to="/" 
                className="text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                {currentUser?.name?.split(' ').map(n => n[0]).join('') || 'Dev'}
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`text-sm font-medium transition-colors ${
                    activeNavSection === link.href.replace('/', '') || 
                    (activeNavSection === 'home' && link.href === '/')
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Resume Download and User Profile */}
            <div className="hidden md:flex md:items-center md:space-x-4">
              {resumeDownload?.download_url && (
                <a
                  href={resumeDownload.download_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Resume
                </a>
              )}
              
              {isAuthenticated && currentUser && (
                <div className="flex items-center">
                  {currentUser.profile_image_url ? (
                    <img
                      src={currentUser.profile_image_url}
                      alt={currentUser.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={toggleMobileMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 focus:outline-none"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-lg">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    activeNavSection === link.href.replace('/', '') ||
                    (activeNavSection === 'home' && link.href === '/')
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              
              <div className="pt-4 pb-2 border-t border-gray-200">
                {resumeDownload?.download_url && (
                  <a
                    href={resumeDownload.download_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center px-3 py-2 rounded-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Download Resume
                  </a>
                )}
                
                {isAuthenticated && currentUser && (
                  <div className="mt-3 flex items-center px-3 py-2">
                    {currentUser.profile_image_url ? (
                      <img
                        src={currentUser.profile_image_url}
                        alt={currentUser.name}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                    )}
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      {currentUser.name}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
      
      {/* Spacer to account for fixed navbar */}
      <div className="h-16 md:h-20"></div>
    </>
  );
};

export default GV_TopNav;