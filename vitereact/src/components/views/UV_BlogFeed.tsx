import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/store/main';
import axios from 'axios';

import { BlogPost } from '@/store/main';

const UV_BlogFeed: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const currentUser = useAppStore(state => state.authentication_state.current_user);
  const itemsPerPage = 10;

  const fetchBlogPosts = async (page: number) => {
    const offset = (page - 1) * itemsPerPage;
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/blog-posts`, {
      params: {
        user_id: currentUser?.user_id,
        is_published: true,
        limit: itemsPerPage,
        offset,
        sort_by: 'created_at',
        sort_order: 'desc'
      }
    });
    return response.data;
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['blogPosts', currentPage, currentUser?.user_id],
    queryFn: () => fetchBlogPosts(currentPage),
    placeholderData: (previousData) => previousData,
    staleTime: 60000,
    refetchOnWindowFocus: false,
    retry: 1
  });

  const blogPosts: BlogPost[] = (data && 'posts' in data ? data.posts : []) || [];
  const totalPosts = (data && 'total' in data ? data.total : 0) || 0;
  const totalPages = Math.ceil(totalPosts / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Blog & Articles</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Thoughts, tutorials, and insights on React Native development and mobile technologies
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : isError ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <h3 className="text-lg font-medium text-red-800 mb-2">Error loading blog posts</h3>
              <p className="text-red-600">{error instanceof Error ? error.message : 'An unknown error occurred'}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : blogPosts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <h3 className="text-xl font-medium text-gray-900 mb-2">No blog posts yet</h3>
              <p className="text-gray-600">Check back later for new articles and insights.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-8 mb-12">
                {blogPosts.map((post) => (
                  <article 
                    key={post.post_id} 
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                  >
                    <div className="p-6">
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                        <time dateTime={post.published_at || post.created_at}>
                          {formatDate(post.published_at || post.created_at)}
                        </time>
                        {post.read_time_minutes && (
                          <span>{post.read_time_minutes} min read</span>
                        )}
                      </div>
                      
                      <h2 className="text-2xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors">
                        <a 
                          href={post.slug} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="no-underline"
                        >
                          {post.title}
                        </a>
                      </h2>
                      
                      {post.excerpt && (
                        <p className="text-gray-600 mb-4 line-clamp-3">
                          {post.excerpt}
                        </p>
                      )}
                      
                      {post.tags && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {post.tags.split(',').map((tag, index) => (
                            <span 
                              key={index} 
                              className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full"
                            >
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center">
                        <a 
                          href={post.slug} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Read Article
                          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                          </svg>
                        </a>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav className="flex justify-center items-center mt-8 space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                  >
                    Previous
                  </button>
                  
                  {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;
                    const isCurrent = page === currentPage;
                    
                    // Show first, last, current, and nearby pages
                    if (
                      page === 1 || 
                      page === totalPages || 
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-4 py-2 rounded-lg ${
                            isCurrent
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    }
                    
                    // Show ellipsis for gaps
                    if (page === currentPage - 2 || page === currentPage + 2) {
                      return (
                        <span key={page} className="px-2 py-2 text-gray-500">
                          ...
                        </span>
                      );
                    }
                    
                    return null;
                  })}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                  >
                    Next
                  </button>
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default UV_BlogFeed;