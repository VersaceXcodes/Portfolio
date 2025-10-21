import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

// Zod schemas for type safety (importing relevant types)


// Define TypeScript interfaces based on Zod schemas
interface Project {
  project_id: string;
  title: string;
  description: string;
  is_featured: boolean;
  project_type: string | null;
  technologies_used: string | null;
  image_url: string | null;
  status: string | null;
}

interface ProjectImage {
  image_url: string;
  alt_text: string | null;
}

// Define the props for the component
interface GV_ProjectCardProps {
  project: Project;
}

const GV_ProjectCard: React.FC<GV_ProjectCardProps> = ({ project }) => {
  // Fetch project image using react-query
  const { data: projectImage, isLoading, error } = useQuery<ProjectImage | null>({
    queryKey: ['projectImage', project.project_id],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/projects/${project.project_id}/images`,
          {
            params: {
              limit: 1
            }
          }
        );
        
        // Extract first image as primary image
        if (response.data.images && response.data.images.length > 0) {
          return {
            image_url: response.data.images[0].image_url,
            alt_text: response.data.images[0].alt_text || `${project.title} project image`
          };
        }
        
        return null;
      } catch (err) {
        // If there's an error fetching images, we'll just render without an image
        return null;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Format technologies for display
  const renderTechnologies = () => {
    if (!project.technologies_used) return null;
    
    const techs = project.technologies_used.split(',').map(tech => tech.trim());
    return (
      <div className="flex flex-wrap gap-2 mt-3">
        {techs.map((tech, index) => (
          <span 
            key={index} 
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
          >
            {tech}
          </span>
        ))}
      </div>
    );
  };

  // Render project status badge
  const renderStatus = () => {
    if (!project.status) return null;
    
    let statusStyle = "bg-gray-100 text-gray-800";
    if (project.status.toLowerCase() === "live") {
      statusStyle = "bg-green-100 text-green-800";
    } else if (project.status.toLowerCase() === "in progress") {
      statusStyle = "bg-yellow-100 text-yellow-800";
    } else if (project.status.toLowerCase() === "archived") {
      statusStyle = "bg-red-100 text-red-800";
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyle}`}>
        {project.status}
      </span>
    );
  };

  return (
    <>
      <Link 
        to={`/projects/${project.project_id}`}
        className="block h-full group"
        aria-label={`View details for ${project.title}`}
      >
        <div className="h-full flex flex-col rounded-xl bg-white shadow-lg border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-xl hover:-translate-y-1">
          {/* Project Image */}
          <div className="aspect-video w-full overflow-hidden bg-gray-100">
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : projectImage?.image_url ? (
              <img
                src={projectImage.image_url}
                alt={projectImage.alt_text || `${project.title} project image`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="text-gray-400">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
              </div>
            )}
          </div>
          
          {/* Project Content */}
          <div className="flex-1 p-6 flex flex-col">
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {project.title}
                </h3>
                {renderStatus()}
              </div>
              
              <p className="mt-3 text-base text-gray-600 line-clamp-3">
                {project.description}
              </p>
            </div>
            
            {renderTechnologies()}
            
            <div className="mt-6">
              <div className="text-sm font-medium text-blue-600 group-hover:text-blue-700 flex items-center">
                View project details
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </>
  );
};

export default GV_ProjectCard;