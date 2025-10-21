import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAppStore } from '@/store/main';
import { User, SocialMediaLink } from '@/db/zodSchemas';

// Define types based on Zod schemas
type UserData = User;

// Social media platform icons mapping
const SocialIcon: React.FC<{ platform: string; url: string }> = ({ platform, url }) => {
  const getIcon = () => {
    switch (platform.toLowerCase()) {
      case 'github':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
        );
      case 'linkedin':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
          </svg>
        );
      case 'twitter':
      case 'x':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        );
      case 'email':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12.713l-11.985-9.713h23.97l-11.985 9.713zm0 2.574l-12-9.725v15.438h24v-15.438l-12 9.725z" />
          </svg>
        );
      case 'whatsapp':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm0 22c-5.514 0-10-4.486-10-10s4.486-10 10-10 10 4.486 10 10-4.486 10-10 10zm1-15h-2v10h2v-10zm-1 12.25c.69 0 1.25.56 1.25 1.25s-.56 1.25-1.25 1.25-1.25-.56-1.25-1.25.56-1.25 1.25-1.25z" />
          </svg>
        );
    }
  };

  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="text-white hover:text-gray-200 transition-colors duration-200"
      aria-label={`${platform} profile`}
    >
      {getIcon()}
    </a>
  );
};

const GV_HeaderWithAvatar: React.FC = () => {
  // Access global state
  const currentUser = useAppStore(state => state.authentication_state.current_user);
  const authToken = useAppStore(state => state.authentication_state.auth_token);
  
  // Fetch user data and social links
  const { data: userData, isLoading, error } = useQuery<UserData>({
    queryKey: ['user', currentUser?.user_id],
    queryFn: async () => {
      if (!currentUser?.user_id) throw new Error('User ID not available');
      
      const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/users/${currentUser.user_id}`,
        { headers }
      );
      
      return response.data;
    },
    enabled: !!currentUser?.user_id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
  
  // Fetch social media links
  const { data: socialLinks = [] } = useQuery<SocialMediaLink[]>({
    queryKey: ['socialLinks', currentUser?.user_id],
    queryFn: async () => {
      if (!currentUser?.user_id) return [];
      
      const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/users/${currentUser.user_id}/social-media-links`,
        { headers }
      );
      
      return response.data;
    },
    enabled: !!currentUser?.user_id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Handle CV download
  const handleDownloadCV = async () => {
    if (!userData?.user_id) return;
    
    try {
      const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
      const downloadId = `download_${Date.now()}`;
      
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/users/${userData.user_id}/resume-downloads`,
        {
          download_id: downloadId,
          file_format: 'pdf',
          download_url: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/users/${userData.user_id}/resume.pdf`,
          created_at: new Date().toISOString(),
        },
        { headers }
      );
      
      // In a real app, this would trigger a file download
      alert('CV download initiated! In a real app, this would download your resume.');
    } catch (err) {
      console.error('CV download failed:', err);
      alert('Failed to initiate CV download. Please try again.');
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <>
        <div className="relative h-screen bg-gray-200 animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/70"></div>
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-32 h-32 rounded-full bg-gray-300 mb-6"></div>
            <div className="h-8 w-64 bg-gray-300 rounded mb-4"></div>
            <div className="h-6 w-48 bg-gray-300 rounded mb-8"></div>
            <div className="flex space-x-6 mb-12">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-10 h-10 rounded-full bg-gray-300"></div>
              ))}
            </div>
            <div className="flex space-x-4">
              <div className="h-12 w-32 bg-gray-300 rounded"></div>
              <div className="h-12 w-32 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Show error state
  if (error) {
    return (
      <>
        <div className="relative h-screen bg-red-100 flex items-center justify-center">
          <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Profile</h2>
            <p className="text-gray-700 mb-6">
              We couldn't load your profile information. Please try again later.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </>
    );
  }

  // Show header content
  return (
    <>
      {/* Background image with overlay */}
      <div 
        className="relative h-screen bg-cover bg-center"
        style={{ 
          backgroundImage: userData?.header_image_url 
            ? `url(${userData.header_image_url})` 
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}
      >
        {/* Overlay that fades when avatar is present */}
        <div 
          className={`absolute inset-0 ${
            userData?.avatar_url 
              ? 'bg-gradient-to-b from-black/40 via-black/20 to-black/60' 
              : 'bg-gradient-to-b from-black/50 to-black/70'
          }`}
        ></div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          {/* Profile avatar */}
          {userData?.avatar_url ? (
            <img 
              src={userData.avatar_url} 
              alt={`${userData.name}'s profile`}
              className="w-32 h-32 rounded-full border-4 border-white shadow-xl mb-6 object-cover"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-200 border-4 border-white shadow-xl mb-6 flex items-center justify-center">
              <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
          )}
          
          {/* Name */}
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">
            {userData?.name || 'Your Name'}
          </h1>
          
          {/* Tagline */}
          {userData?.tagline && (
            <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl drop-shadow">
              {userData.tagline}
            </p>
          )}
          
          {/* Social media icons */}
          <div className="flex space-x-6 mb-12">
            {socialLinks.map((link) => (
              <SocialIcon 
                key={link.link_id} 
                platform={link.platform} 
                url={link.url} 
              />
            ))}
            
            {/* WhatsApp icon - only shown if user has a phone number in contact info */}
            {userData?.email && (
              <a 
                href={`mailto:${userData.email}`} 
                className="text-white hover:text-gray-200 transition-colors duration-200"
                aria-label="Email"
              >
                <SocialIcon platform="email" url={`mailto:${userData.email}`} />
              </a>
            )}
          </div>
          
          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              onClick={handleDownloadCV}
              className="px-8 py-3 bg-white text-gray-900 font-semibold rounded-lg shadow-lg hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
            >
              Download CV
            </button>
            
            <Link 
              to="/contact"
              className="px-8 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-lg shadow-lg hover:bg-white hover:text-gray-900 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
            >
              Contact Me
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default GV_HeaderWithAvatar;