import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/store/main';
import { 
  User, 
  Experience, 
  Education, 
  Certification, 
  Testimonial 
} from '@/store/main';

const UV_About: React.FC = () => {
  // Get current user from global state
  const currentUser = useAppStore(state => state.authentication_state.current_user);
  const userId = currentUser?.user_id;

  // Fetch user profile
  const { data: user, isLoading: isUserLoading, error: userError } = useQuery<User>({
    queryKey: ['userProfile', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID not found');
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/users/${userId}`
      );
      return response.data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  // Fetch experiences
  const { data: experiences, isLoading: isExperiencesLoading, error: experiencesError } = useQuery<Experience[]>({
    queryKey: ['experiences', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID not found');
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/experiences`,
        { params: { user_id: userId, sort_by: 'start_date', sort_order: 'desc' } }
      );
      return response.data.experiences;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  // Fetch educations
  const { data: educations, isLoading: isEducationsLoading, error: educationsError } = useQuery<Education[]>({
    queryKey: ['educations', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID not found');
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/educations`,
        { params: { user_id: userId, sort_by: 'start_date', sort_order: 'desc' } }
      );
      return response.data.educations;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  // Fetch certifications
  const { data: certifications, isLoading: isCertificationsLoading, error: certificationsError } = useQuery<Certification[]>({
    queryKey: ['certifications', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID not found');
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/certifications`,
        { params: { user_id: userId, sort_by: 'issue_date', sort_order: 'desc' } }
      );
      return response.data.certifications;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  // Fetch testimonials
  const { data: testimonials, isLoading: isTestimonialsLoading, error: testimonialsError } = useQuery<Testimonial[]>({
    queryKey: ['testimonials', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID not found');
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/testimonials`,
        { params: { user_id: userId, sort_by: 'created_at', sort_order: 'desc' } }
      );
      return response.data.testimonials;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  // Soft skills to display (can be extended or made dynamic)
  const softSkills = [
    "Problem Solving",
    "Team Collaboration",
    "Agile Methodologies",
    "Communication",
    "Time Management",
    "Adaptability",
    "Leadership",
    "Attention to Detail"
  ];

  // Loading state
  if (isUserLoading || isExperiencesLoading || isEducationsLoading || isCertificationsLoading || isTestimonialsLoading) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <div className="animate-pulse bg-gray-200 rounded-full h-16 w-16 mx-auto"></div>
              <div className="animate-pulse bg-gray-200 h-8 w-48 mx-auto mt-4"></div>
              <div className="animate-pulse bg-gray-200 h-4 w-32 mx-auto mt-2"></div>
            </div>
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Error state
  if (userError || experiencesError || educationsError || certificationsError || testimonialsError) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              <p className="text-sm">Failed to load profile data. Please try again later.</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">About Me</h1>
            <p className="text-lg text-gray-600">Get to know my professional journey</p>
          </div>

          {/* Bio Section */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-16">
            <div className="md:flex">
              {/* Profile Image */}
              <div className="md:w-1/3 p-8 flex flex-col items-center justify-center">
                <div className="rounded-full overflow-hidden w-48 h-48 md:w-64 md:h-64">
                  {user?.avatar_url ? (
                    <img 
                      src={user.avatar_url} 
                      alt={user.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-full flex items-center justify-center">
                      <span className="text-gray-500">No Image</span>
                    </div>
                  )}
                </div>
                <h2 className="mt-6 text-2xl font-bold text-gray-900">{user?.name}</h2>
                <p className="text-blue-600 font-medium">
                  {user?.tagline || "React Native Developer"}
                </p>
              </div>

              {/* Bio Content */}
              <div className="md:w-2/3 p-8 border-t md:border-t-0 md:border-l border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">My Story</h3>
                {user?.bio_text ? (
                  <div className="prose max-w-none text-gray-600">
                    {user.bio_text.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-4">{paragraph}</p>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">
                    No biography available at the moment.
                  </p>
                )}

                {/* Soft Skills */}
                <div className="mt-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Soft Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {softSkills.map((skill, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Professional Experience */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Professional Experience</h2>
            <div className="space-y-6">
              {experiences && experiences.length > 0 ? (
                experiences.map((exp) => (
                  <div 
                    key={exp.experience_id} 
                    className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{exp.role_title}</h3>
                        <p className="text-lg text-blue-600">{exp.company_name}</p>
                      </div>
                      <div className="mt-2 md:mt-0">
                        <p className="text-gray-600">
                          {new Date(exp.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                          {exp.end_date 
                            ? ` - ${new Date(exp.end_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}` 
                            : ' - Present'}
                        </p>
                      </div>
                    </div>
                    {exp.description && (
                      <p className="text-gray-600 mb-4">{exp.description}</p>
                    )}
                    {exp.description && (
                      <div className="flex flex-wrap gap-2">
                        {exp.description.split(',').map((tech, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                          >
                            {tech.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                  <p className="text-gray-500">No professional experience listed yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Education and Certifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {/* Education */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Education</h2>
              <div className="space-y-6">
                {educations && educations.length > 0 ? (
                  educations.map((edu) => (
                    <div 
                      key={edu.education_id} 
                      className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
                    >
                      <h3 className="text-xl font-bold text-gray-900">{edu.degree}</h3>
                      <p className="text-lg text-blue-600">{edu.institution_name}</p>
                      <p className="text-gray-600 mt-2">
                        {new Date(edu.start_date).getFullYear()}
                        {edu.end_date && ` - ${new Date(edu.end_date).getFullYear()}`}
                      </p>
                      {edu.degree && (
                        <p className="text-gray-600 mt-2">Field: {edu.degree}</p>
                      )}
                      {edu.description && (
                        <p className="text-gray-600 mt-3">{edu.description}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <p className="text-gray-500">No education information available.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Certifications */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Certifications</h2>
              <div className="space-y-6">
                {certifications && certifications.length > 0 ? (
                  certifications.map((cert) => (
                    <div 
                      key={cert.certification_id} 
                      className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
                    >
                      <h3 className="text-xl font-bold text-gray-900">{cert.name}</h3>
                      <p className="text-lg text-blue-600">{cert.issuing_organization}</p>
                      <p className="text-gray-600 mt-2">
                        Issued: {new Date(cert.issue_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                      </p>
                      {cert.expiry_date && (
                        <p className="text-gray-600 text-sm">
                          Expires: {new Date(cert.expiry_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                        </p>
                      )}
                      {cert.credential_url && (
                        <a 
                          href={cert.credential_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-block mt-3 text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View credential
                        </a>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <p className="text-gray-500">No certifications listed yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Testimonials */}
          {testimonials && testimonials.length > 0 && (
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Testimonials</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {testimonials.map((testimonial) => (
                  <div 
                    key={testimonial.testimonial_id} 
                    className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
                  >
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold mr-4">
                        {testimonial.author_name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{testimonial.author_name}</h3>
                        {testimonial.author_title && (
                          <p className="text-gray-600 text-sm">{testimonial.author_title}</p>
                        )}
                        {testimonial.author_company && (
                          <p className="text-gray-600 text-sm">{testimonial.author_company}</p>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-600 italic">"{testimonial.content}"</p>
                    {testimonial.rating && (
                      <div className="mt-4 flex">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-5 h-5 ${i < (testimonial.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Call to Action */}
          <div className="text-center py-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Interested in working together?</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              I'm always open to discussing new opportunities and interesting projects.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                to="/contact" 
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
              >
                Get in Touch
              </Link>
              <Link 
                to="/projects" 
                className="px-6 py-3 bg-white text-blue-600 font-medium rounded-lg border border-blue-600 hover:bg-blue-50 transition-colors"
              >
                View My Work
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UV_About;