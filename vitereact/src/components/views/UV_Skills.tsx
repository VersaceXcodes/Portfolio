import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAppStore } from '@/store/main';
import type { Skill } from '@/store/main';

const UV_Skills: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const currentUser = useAppStore(state => state.authentication_state.current_user);
  const authToken = useAppStore(state => state.authentication_state.auth_token);
  
  // Fetch all skills
  const { data, isLoading, error } = useQuery({
    queryKey: ['skills', currentUser?.user_id],
    queryFn: async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/skills`,
        {
          params: { user_id: currentUser?.user_id },
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
        }
      );
      return response.data.skills as Skill[];
    },
    enabled: !!currentUser?.user_id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 1
  });

  // Group skills by category
  const groupedSkills = data?.reduce((acc: Record<string, Skill[]>, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {}) || {};

  // Get all categories
  const categories = Object.keys(groupedSkills);
  
  // Add "All" category at the beginning
  const allCategories = ['All', ...categories];

  // Filter skills based on active category
  const filteredSkills = activeCategory === 'All' 
    ? data 
    : groupedSkills[activeCategory] || [];

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Technical Skills & Expertise</h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              My proficiency across various technologies and tools, organized by category for easy navigation
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    Error loading skills. Please try again later.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Category Tabs */}
              <div className="mb-12">
                <div className="flex flex-wrap justify-center gap-2 md:gap-4">
                  {allCategories.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleCategoryChange(category)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                        activeCategory === category
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                      }`}
                      aria-pressed={activeCategory === category}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Skills Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredSkills && filteredSkills.length > 0 ? (
                  filteredSkills.map((skill) => (
                    <div 
                      key={skill.skill_id}
                      className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-xl"
                    >
                      <div className="p-6">
                        <div className="flex items-start">
                          {skill.icon_name && (
                            <div className="flex-shrink-0 bg-blue-100 p-3 rounded-lg mr-4">
                              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10" />
                            </div>
                          )}
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900">{skill.name}</h3>
                            {skill.description && (
                              <p className="mt-2 text-gray-600 text-sm">{skill.description}</p>
                            )}
                          </div>
                        </div>
                        
                        {skill.proficiency_level !== null && (
                          <div className="mt-6">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium text-gray-700">Proficiency</span>
                              <span className="text-sm font-medium text-gray-700">{skill.proficiency_level}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out" 
                                style={{ width: `${skill.proficiency_level}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No skills found</h3>
                    <p className="mt-1 text-gray-500">No skills available in this category</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default UV_Skills;