import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

// Types from OpenAPI spec and architecture
interface User {
  user_id: string;
  email: string;
  name: string;
  professional_title: string | null;
  tagline: string | null;
  bio: string | null;
  profile_image_url: string | null;
  phone_number: string | null;
  location: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  website_url: string | null;
  created_at: string;
  updated_at: string;
}

interface Project {
  project_id: string;
  user_id: string;
  title: string;
  description: string;
  project_type: string | null;
  role_in_project: string | null;
  problem_statement: string | null;
  solution_approach: string | null;
  technical_challenges: string | null;
  technologies_used: string | null;
  live_demo_url: string | null;
  github_repo_url: string | null;
  app_store_url: string | null;
  play_store_url: string | null;
  case_study_url: string | null;
  is_featured: boolean;
  status: string | null;
  created_at: string;
  updated_at: string;
}

interface Skill {
  skill_id: string;
  user_id: string;
  category: string;
  name: string;
  proficiency_level: number | null;
  description: string | null;
  icon_name: string | null;
  created_at: string;
  updated_at: string;
}

interface SocialMediaLink {
  link_id: string;
  user_id: string;
  platform: string;
  url: string;
  display_order: number | null;
  created_at: string;
  updated_at: string;
}

interface Experience {
  experience_id: string;
  user_id: string;
  company_name: string;
  company_logo_url: string | null;
  job_title: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  location: string | null;
  description: string | null;
  technologies_used: string | null;
  achievements: string | null;
  company_website_url: string | null;
  created_at: string;
  updated_at: string;
}

interface Education {
  education_id: string;
  user_id: string;
  institution_name: string;
  degree: string;
  field_of_study: string | null;
  start_date: string;
  end_date: string | null;
  grade: string | null;
  description: string | null;
  institution_website_url: string | null;
  created_at: string;
  updated_at: string;
}

interface Certification {
  certification_id: string;
  user_id: string;
  name: string;
  issuing_organization: string;
  issue_date: string;
  expiration_date: string | null;
  credential_id: string | null;
  credential_url: string | null;
  created_at: string;
  updated_at: string;
}

interface BlogPost {
  post_id: string;
  user_id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  published_at: string | null;
  is_published: boolean;
  read_time_minutes: number | null;
  tags: string | null;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
}

interface ContactMessage {
  message_id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

interface ResumeDownload {
  download_id: string;
  user_id: string;
  download_url: string;
  file_size_bytes: number | null;
  created_at: string;
}

interface SiteSetting {
  setting_id: string;
  user_id: string;
  privacy_policy_content: string | null;
  terms_of_service_content: string | null;
  cookie_policy_content: string | null;
  seo_meta_title: string | null;
  seo_meta_description: string | null;
  google_analytics_id: string | null;
  created_at: string;
  updated_at: string;
}

interface Testimonial {
  testimonial_id: string;
  user_id: string;
  client_name: string;
  client_position: string | null;
  company_name: string | null;
  content: string;
  rating: number | null;
  client_photo_url: string | null;
  project_reference: string | null;
  created_at: string;
  updated_at: string;
}

// Authentication state structure
interface AuthenticationState {
  current_user: User | null;
  auth_token: string | null;
  authentication_status: {
    is_authenticated: boolean;
    is_loading: boolean;
  };
  error_message: string | null;
}

// Contact form state
interface ContactFormState {
  is_submitting: boolean;
  success_message: string | null;
  error_message: string | null;
}

// Main app state
interface AppState {
  // Authentication
  authentication_state: AuthenticationState;
  
  // Navigation
  active_nav_section: string;
  is_mobile_menu_open: boolean;
  
  // Project
  selected_project_id: string | null;
  
  // Contact form
  contact_form_status: ContactFormState;
  
  // Loading states
  is_loading: {
    user: boolean;
    projects: boolean;
    skills: boolean;
    experiences: boolean;
    educations: boolean;
    certifications: boolean;
    blog_posts: boolean;
    social_links: boolean;
    site_settings: boolean;
    testimonials: boolean;
    resume: boolean;
  };
  
  // Error states
  errors: {
    user: string | null;
    projects: string | null;
    skills: string | null;
    experiences: string | null;
    educations: string | null;
    certifications: string | null;
    blog_posts: string | null;
    social_links: string | null;
    site_settings: string | null;
    testimonials: string | null;
    resume: string | null;
  };
  
  // Data collections
  featured_projects: Project[];
  skills: Skill[];
  social_links: SocialMediaLink[];
  experiences: Experience[];
  educations: Education[];
  certifications: Certification[];
  blog_posts: BlogPost[];
  testimonials: Testimonial[];
  site_settings: SiteSetting | null;
  resume_download: ResumeDownload | null;
  
  // Actions
  // Authentication
  login_user: (email: string, password: string) => Promise<void>;
  logout_user: () => void;
  register_user: (email: string, password: string, name: string) => Promise<void>;
  initialize_auth: () => Promise<void>;
  clear_auth_error: () => void;
  
  // Navigation
  set_active_nav_section: (section: string) => void;
  toggle_mobile_menu: () => void;
  close_mobile_menu: () => void;
  
  // Project
  set_selected_project_id: (project_id: string | null) => void;
  
  // Contact form
  set_contact_form_status: (status: Partial<ContactFormState>) => void;
  submit_contact_message: (messageData: Omit<ContactMessage, 'message_id' | 'created_at' | 'ip_address' | 'user_agent'>) => Promise<void>;
  
  // Data fetching
  fetch_user_profile: () => Promise<void>;
  fetch_featured_projects: () => Promise<void>;
  fetch_skills: () => Promise<void>;
  fetch_social_links: () => Promise<void>;
  fetch_experiences: () => Promise<void>;
  fetch_educations: () => Promise<void>;
  fetch_certifications: () => Promise<void>;
  fetch_blog_posts: () => Promise<void>;
  fetch_testimonials: () => Promise<void>;
  fetch_site_settings: () => Promise<void>;
  fetch_resume_download: () => Promise<void>;
  
  // Loading and error state management
  set_loading: (key: keyof AppState['is_loading'], loading: boolean) => void;
  set_error: (key: keyof AppState['errors'], error: string | null) => void;
  clear_errors: () => void;
}

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Create the store with persistence
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      authentication_state: {
        current_user: null,
        auth_token: null,
        authentication_status: {
          is_authenticated: false,
          is_loading: true,
        },
        error_message: null,
      },
      
      active_nav_section: 'home',
      is_mobile_menu_open: false,
      selected_project_id: null,
      
      contact_form_status: {
        is_submitting: false,
        success_message: null,
        error_message: null,
      },
      
      is_loading: {
        user: false,
        projects: false,
        skills: false,
        experiences: false,
        educations: false,
        certifications: false,
        blog_posts: false,
        social_links: false,
        site_settings: false,
        testimonials: false,
        resume: false,
      },
      
      errors: {
        user: null,
        projects: null,
        skills: null,
        experiences: null,
        educations: null,
        certifications: null,
        blog_posts: null,
        social_links: null,
        site_settings: null,
        testimonials: null,
        resume: null,
      },
      
      featured_projects: [],
      skills: [],
      social_links: [],
      experiences: [],
      educations: [],
      certifications: [],
      blog_posts: [],
      testimonials: [],
      site_settings: null,
      resume_download: null,
      
      // Authentication actions
      login_user: async (email: string, password: string) => {
        set((state) => ({
          authentication_state: {
            ...state.authentication_state,
            authentication_status: {
              ...state.authentication_state.authentication_status,
              is_loading: true,
            },
            error_message: null,
          },
        }));
        
        try {
          const response = await axios.post(
            `${API_BASE_URL}/api/auth/login`,
            { email, password },
            { headers: { 'Content-Type': 'application/json' } }
          );
          
          const { user, token } = response.data;
          
          set((state) => ({
            authentication_state: {
              current_user: user,
              auth_token: token,
              authentication_status: {
                is_authenticated: true,
                is_loading: false,
              },
              error_message: null,
            },
          }));
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || 'Login failed';
          
          set((state) => ({
            authentication_state: {
              ...state.authentication_state,
              authentication_status: {
                is_authenticated: false,
                is_loading: false,
              },
              error_message: errorMessage,
            },
          }));
          
          throw new Error(errorMessage);
        }
      },
      
      logout_user: () => {
        set((state) => ({
          authentication_state: {
            current_user: null,
            auth_token: null,
            authentication_status: {
              is_authenticated: false,
              is_loading: false,
            },
            error_message: null,
          },
        }));
      },
      
      register_user: async (email: string, password: string, name: string) => {
        set((state) => ({
          authentication_state: {
            ...state.authentication_state,
            authentication_status: {
              ...state.authentication_state.authentication_status,
              is_loading: true,
            },
            error_message: null,
          },
        }));
        
        try {
          const response = await axios.post(
            `${API_BASE_URL}/api/auth/register`,
            { email, password_hash: password, name },
            { headers: { 'Content-Type': 'application/json' } }
          );
          
          const { user, token } = response.data;
          
          set((state) => ({
            authentication_state: {
              current_user: user,
              auth_token: token,
              authentication_status: {
                is_authenticated: true,
                is_loading: false,
              },
              error_message: null,
            },
          }));
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
          
          set((state) => ({
            authentication_state: {
              ...state.authentication_state,
              authentication_status: {
                is_authenticated: false,
                is_loading: false,
              },
              error_message: errorMessage,
            },
          }));
          
          throw new Error(errorMessage);
        }
      },
      
      initialize_auth: async () => {
        const { authentication_state } = get();
        const token = authentication_state.auth_token;
        
        // If no token, we're done
        if (!token) {
          set((state) => ({
            authentication_state: {
              ...state.authentication_state,
              authentication_status: {
                ...state.authentication_state.authentication_status,
                is_loading: false,
              },
            },
          }));
          return;
        }
        
        try {
          // Verify token with backend
          const response = await axios.get(
            `${API_BASE_URL}/api/users/${authentication_state.current_user?.user_id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          const user = response.data;
          
          set((state) => ({
            authentication_state: {
              current_user: user,
              auth_token: token,
              authentication_status: {
                is_authenticated: true,
                is_loading: false,
              },
              error_message: null,
            },
          }));
        } catch (error) {
          // Token is invalid, clear auth state
          set((state) => ({
            authentication_state: {
              current_user: null,
              auth_token: null,
              authentication_status: {
                is_authenticated: false,
                is_loading: false,
              },
              error_message: null,
            },
          }));
        }
      },
      
      clear_auth_error: () => {
        set((state) => ({
          authentication_state: {
            ...state.authentication_state,
            error_message: null,
          },
        }));
      },
      
      // Navigation actions
      set_active_nav_section: (section: string) => {
        set({ active_nav_section: section });
      },
      
      toggle_mobile_menu: () => {
        set((state) => ({ is_mobile_menu_open: !state.is_mobile_menu_open }));
      },
      
      close_mobile_menu: () => {
        set({ is_mobile_menu_open: false });
      },
      
      // Project actions
      set_selected_project_id: (project_id: string | null) => {
        set({ selected_project_id: project_id });
      },
      
      // Contact form actions
      set_contact_form_status: (status: Partial<ContactFormState>) => {
        set((state) => ({
          contact_form_status: {
            ...state.contact_form_status,
            ...status,
          },
        }));
      },
      
      submit_contact_message: async (messageData) => {
        set((state) => ({
          contact_form_status: {
            ...state.contact_form_status,
            is_submitting: true,
            error_message: null,
            success_message: null,
          },
        }));
        
        try {
          await axios.post(
            `${API_BASE_URL}/api/contact-messages`,
            messageData,
            { headers: { 'Content-Type': 'application/json' } }
          );
          
          set((state) => ({
            contact_form_status: {
              is_submitting: false,
              success_message: 'Message sent successfully!',
              error_message: null,
            },
          }));
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || 'Failed to send message';
          
          set((state) => ({
            contact_form_status: {
              is_submitting: false,
              success_message: null,
              error_message: errorMessage,
            },
          }));
          
          throw new Error(errorMessage);
        }
      },
      
      // Data fetching actions
      fetch_user_profile: async () => {
        const { authentication_state } = get();
        const userId = authentication_state.current_user?.user_id;
        
        if (!userId) return;
        
        set((state) => ({
          is_loading: { ...state.is_loading, user: true },
          errors: { ...state.errors, user: null },
        }));
        
        try {
          const response = await axios.get(
            `${API_BASE_URL}/api/users/${userId}`,
            { headers: { Authorization: `Bearer ${authentication_state.auth_token}` } }
          );
          
          set((state) => ({
            authentication_state: {
              ...state.authentication_state,
              current_user: response.data,
            },
            is_loading: { ...state.is_loading, user: false },
          }));
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch user profile';
          
          set((state) => ({
            is_loading: { ...state.is_loading, user: false },
            errors: { ...state.errors, user: errorMessage },
          }));
        }
      },
      
      fetch_featured_projects: async () => {
        set((state) => ({
          is_loading: { ...state.is_loading, projects: true },
          errors: { ...state.errors, projects: null },
        }));
        
        try {
          const response = await axios.get(
            `${API_BASE_URL}/api/projects`,
            { params: { is_featured: true, limit: 6 } }
          );
          
          set((state) => ({
            featured_projects: response.data.projects,
            is_loading: { ...state.is_loading, projects: false },
          }));
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch projects';
          
          set((state) => ({
            is_loading: { ...state.is_loading, projects: false },
            errors: { ...state.errors, projects: errorMessage },
          }));
        }
      },
      
      fetch_skills: async () => {
        set((state) => ({
          is_loading: { ...state.is_loading, skills: true },
          errors: { ...state.errors, skills: null },
        }));
        
        try {
          const response = await axios.get(
            `${API_BASE_URL}/api/skills`,
            { params: { category: 'primary', limit: 8 } }
          );
          
          set((state) => ({
            skills: response.data.skills,
            is_loading: { ...state.is_loading, skills: false },
          }));
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch skills';
          
          set((state) => ({
            is_loading: { ...state.is_loading, skills: false },
            errors: { ...state.errors, skills: errorMessage },
          }));
        }
      },
      
      fetch_social_links: async () => {
        set((state) => ({
          is_loading: { ...state.is_loading, social_links: true },
          errors: { ...state.errors, social_links: null },
        }));
        
        try {
          const response = await axios.get(
            `${API_BASE_URL}/api/social-media-links`,
            { params: { sort_by: 'display_order', sort_order: 'asc', limit: 5 } }
          );
          
          set((state) => ({
            social_links: response.data.links,
            is_loading: { ...state.is_loading, social_links: false },
          }));
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch social links';
          
          set((state) => ({
            is_loading: { ...state.is_loading, social_links: false },
            errors: { ...state.errors, social_links: errorMessage },
          }));
        }
      },
      
      fetch_experiences: async () => {
        const { authentication_state } = get();
        const userId = authentication_state.current_user?.user_id;
        
        if (!userId) return;
        
        set((state) => ({
          is_loading: { ...state.is_loading, experiences: true },
          errors: { ...state.errors, experiences: null },
        }));
        
        try {
          const response = await axios.get(
            `${API_BASE_URL}/api/experiences`,
            { 
              params: { 
                user_id: userId, 
                sort_by: 'start_date', 
                sort_order: 'desc' 
              } 
            }
          );
          
          set((state) => ({
            experiences: response.data.experiences,
            is_loading: { ...state.is_loading, experiences: false },
          }));
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch experiences';
          
          set((state) => ({
            is_loading: { ...state.is_loading, experiences: false },
            errors: { ...state.errors, experiences: errorMessage },
          }));
        }
      },
      
      fetch_educations: async () => {
        const { authentication_state } = get();
        const userId = authentication_state.current_user?.user_id;
        
        if (!userId) return;
        
        set((state) => ({
          is_loading: { ...state.is_loading, educations: true },
          errors: { ...state.errors, educations: null },
        }));
        
        try {
          const response = await axios.get(
            `${API_BASE_URL}/api/educations`,
            { 
              params: { 
                user_id: userId, 
                sort_by: 'start_date', 
                sort_order: 'desc' 
              } 
            }
          );
          
          set((state) => ({
            educations: response.data.educations,
            is_loading: { ...state.is_loading, educations: false },
          }));
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch educations';
          
          set((state) => ({
            is_loading: { ...state.is_loading, educations: false },
            errors: { ...state.errors, educations: errorMessage },
          }));
        }
      },
      
      fetch_certifications: async () => {
        const { authentication_state } = get();
        const userId = authentication_state.current_user?.user_id;
        
        if (!userId) return;
        
        set((state) => ({
          is_loading: { ...state.is_loading, certifications: true },
          errors: { ...state.errors, certifications: null },
        }));
        
        try {
          const response = await axios.get(
            `${API_BASE_URL}/api/certifications`,
            { 
              params: { 
                user_id: userId, 
                sort_by: 'issue_date', 
                sort_order: 'desc' 
              } 
            }
          );
          
          set((state) => ({
            certifications: response.data.certifications,
            is_loading: { ...state.is_loading, certifications: false },
          }));
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch certifications';
          
          set((state) => ({
            is_loading: { ...state.is_loading, certifications: false },
            errors: { ...state.errors, certifications: errorMessage },
          }));
        }
      },
      
      fetch_blog_posts: async () => {
        const { authentication_state } = get();
        const userId = authentication_state.current_user?.user_id;
        
        if (!userId) return;
        
        set((state) => ({
          is_loading: { ...state.is_loading, blog_posts: true },
          errors: { ...state.errors, blog_posts: null },
        }));
        
        try {
          const response = await axios.get(
            `${API_BASE_URL}/api/blog-posts`,
            { 
              params: { 
                user_id: userId, 
                is_published: true,
                sort_by: 'created_at', 
                sort_order: 'desc',
                limit: 10
              } 
            }
          );
          
          set((state) => ({
            blog_posts: response.data.posts,
            is_loading: { ...state.is_loading, blog_posts: false },
          }));
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch blog posts';
          
          set((state) => ({
            is_loading: { ...state.is_loading, blog_posts: false },
            errors: { ...state.errors, blog_posts: errorMessage },
          }));
        }
      },
      
      fetch_testimonials: async () => {
        const { authentication_state } = get();
        const userId = authentication_state.current_user?.user_id;
        
        if (!userId) return;
        
        set((state) => ({
          is_loading: { ...state.is_loading, testimonials: true },
          errors: { ...state.errors, testimonials: null },
        }));
        
        try {
          const response = await axios.get(
            `${API_BASE_URL}/api/testimonials`,
            { 
              params: { 
                user_id: userId, 
                sort_by: 'created_at', 
                sort_order: 'desc' 
              } 
            }
          );
          
          set((state) => ({
            testimonials: response.data.testimonials,
            is_loading: { ...state.is_loading, testimonials: false },
          }));
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch testimonials';
          
          set((state) => ({
            is_loading: { ...state.is_loading, testimonials: false },
            errors: { ...state.errors, testimonials: errorMessage },
          }));
        }
      },
      
      fetch_site_settings: async () => {
        const { authentication_state } = get();
        const userId = authentication_state.current_user?.user_id;
        
        if (!userId) return;
        
        set((state) => ({
          is_loading: { ...state.is_loading, site_settings: true },
          errors: { ...state.errors, site_settings: null },
        }));
        
        try {
          const response = await axios.get(
            `${API_BASE_URL}/api/site-settings`,
            { 
              params: { 
                user_id: userId, 
                sort_by: 'created_at', 
                sort_order: 'desc',
                limit: 1
              } 
            }
          );
          
          set((state) => ({
            site_settings: response.data.settings[0] || null,
            is_loading: { ...state.is_loading, site_settings: false },
          }));
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch site settings';
          
          set((state) => ({
            is_loading: { ...state.is_loading, site_settings: false },
            errors: { ...state.errors, site_settings: errorMessage },
          }));
        }
      },
      
      fetch_resume_download: async () => {
        const { authentication_state } = get();
        const userId = authentication_state.current_user?.user_id;
        
        if (!userId) return;
        
        set((state) => ({
          is_loading: { ...state.is_loading, resume: true },
          errors: { ...state.errors, resume: null },
        }));
        
        try {
          const response = await axios.get(
            `${API_BASE_URL}/api/resume-downloads`,
            { 
              params: { 
                user_id: userId, 
                sort_by: 'created_at', 
                sort_order: 'desc',
                limit: 1
              } 
            }
          );
          
          set((state) => ({
            resume_download: response.data.downloads[0] || null,
            is_loading: { ...state.is_loading, resume: false },
          }));
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch resume download';
          
          set((state) => ({
            is_loading: { ...state.is_loading, resume: false },
            errors: { ...state.errors, resume: errorMessage },
          }));
        }
      },
      
      // Loading and error state management
      set_loading: (key, loading) => {
        set((state) => ({
          is_loading: { ...state.is_loading, [key]: loading },
        }));
      },
      
      set_error: (key, error) => {
        set((state) => ({
          errors: { ...state.errors, [key]: error },
        }));
      },
      
      clear_errors: () => {
        set({
          errors: {
            user: null,
            projects: null,
            skills: null,
            experiences: null,
            educations: null,
            certifications: null,
            blog_posts: null,
            social_links: null,
            site_settings: null,
            testimonials: null,
            resume: null,
          },
        });
      },
    }),
    {
      name: 'devfolio-storage',
      partialize: (state) => ({
        authentication_state: {
          current_user: state.authentication_state.current_user,
          auth_token: state.authentication_state.auth_token,
          authentication_status: {
            is_authenticated: state.authentication_state.authentication_status.is_authenticated,
            is_loading: false, // Never persist loading state
          },
          error_message: null, // Never persist errors
        },
        active_nav_section: state.active_nav_section,
        is_mobile_menu_open: state.is_mobile_menu_open,
        selected_project_id: state.selected_project_id,
      }),
    }
  )
);

// Export types for use in components
export type {
  User,
  Project,
  Skill,
  SocialMediaLink,
  Experience,
  Education,
  Certification,
  BlogPost,
  ContactMessage,
  ResumeDownload,
  SiteSetting,
  Testimonial,
  AuthenticationState,
  ContactFormState,
};