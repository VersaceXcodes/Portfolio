import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAppStore } from '@/store/main';
import { Skill } from '@/zodschemas';

const UV_Skills: React.FC = () => {
  // Global state selectors
  const currentUser = useAppStore(state => state.authentication_state.current_user);
  const authToken = useAppStore(state => state.authentication_state.auth_token);
  const isAuthenticated = useAppStore(state => state.authentication_state.authentication_status.is_authenticated);
  
  // Local state
  const [skillsList, setSkillsList] = useState<Skill[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [sortType, setSortType] = useState<'name' | 'category' | 'display_order'>('display_order');
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [newSkill, setNewSkill] = useState<Omit<Skill, 'skill_id' | 'user_id'>>({
    name: '',
    category: null,
    proficiency_level: null,
    icon_url: null,
    description: null,
    display_order: 0
  });
  
  const queryClient = useQueryClient();
  
  // Categories for filtering
  const categories = Array.from(new Set(skillsList.map(skill => skill.category).filter(Boolean))) as string[];
  
  // Fetch skills
  const { 
    data: skillsData, 
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ['skills', currentUser?.user_id],
    queryFn: async () => {
      if (!currentUser?.user_id) return [];
      
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/users/${currentUser.user_id}/skills`,
        {
          params: {
            limit: 50,
            sort_by: sortType,
            sort_order: 'asc'
          },
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
        }
      );
      return response.data as Skill[];
    },
    enabled: !!currentUser?.user_id,
    staleTime: 60000,
    refetchOnWindowFocus: false,
    retry: 1,
    select: (data) => {
      // Apply filtering
      if (activeFilter === 'all') return data;
      return data.filter(skill => skill.category === activeFilter);
    }
  });
  
  // Update local state when data changes
  useEffect(() => {
    if (skillsData) {
      setSkillsList(skillsData);
    }
  }, [skillsData]);
  
  // Filter skills based on active filter
  const filteredSkills = activeFilter === 'all' 
    ? skillsList 
    : skillsList.filter(skill => skill.category === activeFilter);
  
  // Sort skills
  const sortedSkills = [...filteredSkills].sort((a, b) => {
    if (sortType === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortType === 'category') {
      const catA = a.category || '';
      const catB = b.category || '';
      return catA.localeCompare(catB);
    }
    return (a.display_order || 0) - (b.display_order || 0);
  });
  
  // Handle skill update (admin mode)
  const handleUpdateSkill = async (updatedSkill: Skill) => {
    if (!currentUser?.user_id || !authToken) return;
    
    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/users/${currentUser.user_id}/skills/${updatedSkill.skill_id}`,
        updatedSkill,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`
          }
        }
      );
      
      // Update local state
      setSkillsList(prev => 
        prev.map(skill => 
          skill.skill_id === updatedSkill.skill_id ? response.data : skill
        )
      );
      
      setIsEditing(false);
      setEditingSkill(null);
      queryClient.invalidateQueries({ queryKey: ['skills', currentUser.user_id] });
    } catch (err) {
      console.error('Error updating skill:', err);
    }
  };
  
  // Handle skill deletion (admin mode)
  const handleDeleteSkill = async (skillId: string) => {
    if (!currentUser?.user_id || !authToken) return;
    
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/users/${currentUser.user_id}/skills/${skillId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );
      
      // Update local state
      setSkillsList(prev => prev.filter(skill => skill.skill_id !== skillId));
      queryClient.invalidateQueries({ queryKey: ['skills', currentUser.user_id] });
    } catch (err) {
      console.error('Error deleting skill:', err);
    }
  };
  
  // Handle new skill creation (admin mode)
  const handleCreateSkill = async () => {
    if (!currentUser?.user_id || !authToken) return;
    
    try {
      const skillToCreate = {
        ...newSkill,
        skill_id: `skill_${Date.now()}`,
        user_id: currentUser.user_id
      };
      
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/users/${currentUser.user_id}/skills`,
        skillToCreate,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`
          }
        }
      );
      
      // Update local state
      setSkillsList(prev => [...prev, response.data]);
      setNewSkill({
        name: '',
        category: null,
        proficiency_level: null,
        icon_url: null,
        description: null,
        display_order: 0
      });
      queryClient.invalidateQueries({ queryKey: ['skills', currentUser.user_id] });
    } catch (err) {
      console.error('Error creating skill:', err);
    }
  };
  
  // Get proficiency color
  const getProficiencyColor = (level: string | null) => {
    switch (level) {
      case 'beginner': return 'bg-red-500';
      case 'intermediate': return 'bg-orange-500';
      case 'expert': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };
  
  // Get proficiency label
  const getProficiencyLabel = (level: string | null) => {
    switch (level) {
      case 'beginner': return 'Beginner';
      case 'intermediate': return 'Intermediate';
      case 'expert': return 'Expert';
      default: return 'Unknown';
    }
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">My Skills</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Technical competencies showcased with proficiency indicators
          </p>
        </div>
        
        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex flex-wrap gap-4">
            {/* Category Filter */}
            <div className="w-full sm:w-auto">
              <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Category
              </label>
              <select
                id="category-filter"
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Sort Options */}
            <div className="w-full sm:w-auto">
              <label htmlFor="sort-options" className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                id="sort-options"
                value={sortType}
                onChange={(e) => setSortType(e.target.value as any)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
              >
                <option value="display_order">Manual Order</option>
                <option value="name">Alphabetical</option>
                <option value="category">By Category</option>
              </select>
            </div>
          </div>
          
          {/* Admin Mode Toggle */}
          {isAuthenticated && (
            <div className="flex items-center">
              <span className="mr-2 text-sm text-gray-700">Admin Mode</span>
              <button
                onClick={() => setIsAdminMode(!isAdminMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  isAdminMode ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isAdminMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          )}
        </div>
        
        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}
        
        {/* Error State */}
        {isError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            <p>Error loading skills: {(error as Error).message}</p>
          </div>
        )}
        
        {/* Admin Controls */}
        {isAdminMode && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-medium text-blue-800 mb-3">Add New Skill</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Skill Name</label>
                <input
                  type="text"
                  value={newSkill.name}
                  onChange={(e) => setNewSkill({...newSkill, name: e.target.value})}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                  placeholder="e.g., JavaScript"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  value={newSkill.category || ''}
                  onChange={(e) => setNewSkill({...newSkill, category: e.target.value || null})}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                  placeholder="e.g., Frontend"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Proficiency Level</label>
                <select
                  value={newSkill.proficiency_level || ''}
                  onChange={(e) => setNewSkill({...newSkill, proficiency_level: e.target.value || null})}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                >
                  <option value="">Select Level</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icon URL</label>
                <input
                  type="text"
                  value={newSkill.icon_url || ''}
                  onChange={(e) => setNewSkill({...newSkill, icon_url: e.target.value || null})}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                  placeholder="https://example.com/icon.png"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={newSkill.description || ''}
                onChange={(e) => setNewSkill({...newSkill, description: e.target.value || null})}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                rows={3}
                placeholder="Brief description of the skill"
              />
            </div>
            <button
              onClick={handleCreateSkill}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add Skill
            </button>
          </div>
        )}
        
        {/* Skills Grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedSkills.map((skill) => (
              <div 
                key={skill.skill_id} 
                className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                {/* Edit Mode */}
                {isAdminMode && isEditing && editingSkill?.skill_id === skill.skill_id ? (
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Edit Skill</h3>
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editingSkill.name}
                        onChange={(e) => setEditingSkill({...editingSkill, name: e.target.value})}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-2 py-1 border"
                      />
                      <input
                        type="text"
                        value={editingSkill.category || ''}
                        onChange={(e) => setEditingSkill({...editingSkill, category: e.target.value || null})}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-2 py-1 border"
                        placeholder="Category"
                      />
                      <select
                        value={editingSkill.proficiency_level || ''}
                        onChange={(e) => setEditingSkill({...editingSkill, proficiency_level: e.target.value || null})}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-2 py-1 border"
                      >
                        <option value="">Select Level</option>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="expert">Expert</option>
                      </select>
                      <div className="flex space-x-2">
                        <button
                  onClick={() => handleUpdateSkill(editingSkill)}
                  className="flex-1 px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditingSkill(null);
                  }}
                  className="flex-1 px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Display Mode */
          <div className="p-5">
            <div className="flex items-start mb-4">
              {skill.icon_url ? (
                <img 
                  src={skill.icon_url} 
                  alt={skill.name} 
                  className="w-12 h-12 rounded-lg object-contain mr-3"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center mr-3">
                  <span className="text-gray-500 font-bold text-xl">
                    {skill.name.charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{skill.name}</h3>
                {skill.category && (
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mt-1">
                    {skill.category}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full ${getProficiencyColor(skill.proficiency_level)} mr-2`}></div>
                <span className="text-sm text-gray-600">
                  {getProficiencyLabel(skill.proficiency_level)}
                </span>
              </div>
              
              {isAdminMode && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setEditingSkill(skill);
                      setIsEditing(true);
                    }}
                    className="text-blue-600 hover:text-blue-800"
                    aria-label="Edit skill"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteSkill(skill.skill_id)}
                    className="text-red-600 hover:text-red-800"
                    aria-label="Delete skill"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
            
            {skill.description && (
              <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                {skill.description}
              </p>
            )}
          </div>
        )}
      </div>
    ))}
  </div>
)}

{/* Empty State */}
{!isLoading && sortedSkills.length === 0 && (
  <div className="text-center py-12">
    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
    <h3 className="mt-2 text-lg font-medium text-gray-900">No skills found</h3>
    <p className="mt-1 text-gray-500">
      {activeFilter === 'all' 
        ? 'Get started by adding a new skill.' 
        : 'No skills match the current filter.'}
    </p>
  </div>
)}
      </div>
    </>
  );
};

export default UV_Skills;