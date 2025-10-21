import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAppStore } from '@/store/main';
import { User } from '@/db/zodSchemas';

const UV_AboutMe: React.FC = () => {
  // Global state access
  const currentUser = useAppStore(state => state.authentication_state.current_user);
  const authToken = useAppStore(state => state.authentication_state.auth_token);

  // API base URL
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

  // Fetch user bio
  const {
    data: userBio,
    isLoading: isUserBioLoading,
    isError: isUserBioError,
    error: userBioError
  } = useQuery({
    queryKey: ['userBio', currentUser?.user_id],
    queryFn: async () => {
      const response = await axios.get(`${apiBaseUrl}/api/users/${currentUser?.user_id}`, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
      });
      return response.data as User;
    },
    enabled: !!currentUser?.user_id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 1
  });

  // Fetch key facts
  const {
    data: keyFacts,
    isLoading: isKeyFactsLoading,
    isError: isKeyFactsError,
    error: keyFactsError
  } = useQuery({
    queryKey: ['keyFacts', currentUser?.user_id],
    queryFn: async () => {
      const response = await axios.get(`${apiBaseUrl}/api/users/${currentUser?.user_id}/key-facts`, {
        params: {
          sort_by: 'display_order',
          sort_order: 'asc'
        },
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
      });
      return response.data;
    },
    enabled: !!currentUser?.user_id,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1
  });

  // Fetch social links
  const {
    data: socialLinks,
    isLoading: isSocialLinksLoading,
    isError: isSocialLinksError,
    error: socialLinksError
  } = useQuery({
    queryKey: ['socialLinks', currentUser?.user_id],
    queryFn: async () => {
      const response = await axios.get(`${apiBaseUrl}/api/users/${currentUser?.user_id}/social-media-links`, {
        params: {
          sort_by: 'display_order',
          sort_order: 'asc'
        },
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
      });
      return response.data;
    },
    enabled: !!currentUser?.user_id,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1
  });

  // Render bio content with basic formatting
  const renderBioContent = (content: string | null) => {
    if (!content) return null;
    
    return content.split('\n').map((paragraph, index) => (
      <p key={index} className="mb-4 text-gray-700 leading-relaxed">
        {paragraph}
      </p>
    ));
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">About Me</h1>
            <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
          </div>

          {/* Bio Section */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-12">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/3 flex justify-center">
                {userBio?.avatar_url ? (
                  <img 
                    src={userBio.avatar_url} 
                    alt={userBio.name || "Profile"} 
                    className="rounded-full w-48 h-48 object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-48 h-48" />
                )}
              </div>
              
              <div className="md:w-2/3">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{userBio?.name}</h2>
                {userBio?.tagline && (
                  <p className="text-xl text-blue-600 mb-6">{userBio.tagline}</p>
                )}
                
                <div className="prose max-w-none">
                  {isUserBioLoading ? (
                    <div className="space-y-4">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                      <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                    </div>
                  ) : isUserBioError ? (
                    <div className="bg-red-50 text-red-700 p-4 rounded-lg">
                      Error loading bio: {userBioError instanceof Error ? userBioError.message : 'Unknown error'}
                    </div>
                  ) : (
                    renderBioContent(userBio?.bio_text)
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Video Embed */}
          {userBio?.video_embed_url && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">My Story</h3>
              <div className="relative pt-[56.25%]"> {/* 16:9 Aspect Ratio */}
                <div className="absolute inset-0 bg-gray-200 border-2 border-dashed rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto bg-gray-300 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-gray-600">Video Presentation</p>
                    <a 
                      href={userBio.video_embed_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Watch on external platform
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Key Facts */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Key Achievements</h3>
            
            {isKeyFactsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="p-4 border border-gray-200 rounded-lg">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : isKeyFactsError ? (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg">
                Error loading key facts: {keyFactsError instanceof Error ? keyFactsError.message : 'Unknown error'}
              </div>
            ) : keyFacts && keyFacts.length > 0 ? (
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {keyFacts.map((fact: any) => (
                  <li 
                    key={fact.fact_id} 
                    className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded-lg flex items-start"
                  >
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-5 h-5 rounded-full bg-blue-500"></div>
                    </div>
                    <p className="ml-3 text-gray-700">{fact.content}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No key achievements to display
              </div>
            )}
          </div>

          {/* Social Links */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Connect With Me</h3>
            
            {isSocialLinksLoading ? (
              <div className="flex flex-wrap gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-12 h-12 bg-gray-200 rounded-full"></div>
                ))}
              </div>
            ) : isSocialLinksError ? (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg">
                Error loading social links: {socialLinksError instanceof Error ? socialLinksError.message : 'Unknown error'}
              </div>
            ) : socialLinks && socialLinks.length > 0 ? (
              <div className="flex flex-wrap gap-6">
                {socialLinks.map((link: any) => (
                  <a
                    key={link.link_id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-gray-100 hover:bg-blue-100 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                    aria-label={`Visit ${link.platform}`}
                  >
                    <div className="bg-gray-300 border-2 border-dashed rounded-xl w-8 h-8" />
                  </a>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No social links to display
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default UV_AboutMe;