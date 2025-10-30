import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

// Type definitions
export interface User {
  id?: string;
  user_id: string;
  email: string;
  name: string;
  tagline: string | null;
  bio_text: string | null;
  bio?: string | null;
  professional_title?: string | null;
  profile_image_url?: string | null;
  header_image_url: string | null;
  avatar_url: string | null;
  video_embed_url: string | null;
  phone_number?: string | null;
  linkedin_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Experience {
  experience_id: string;
  user_id: string;
  role_title: string;
  job_title?: string;
  company_name: string;
  company_logo_url: string | null;
  company_website_url?: string | null;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  location: string | null;
  description: string | null;
  achievements?: string[] | null;
  technologies_used?: string[] | null;
  display_order: number;
}

export interface Education {
  education_id: string;
  user_id: string;
  institution_name: string;
  degree: string | null;
  field_of_study?: string | null;
  institution_logo_url: string | null;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  location: string | null;
  description: string | null;
  display_order: number;
}

export interface Certification {
  certification_id: string;
  user_id: string;
  name: string;
  issuing_organization: string;
  issue_date: string;
  expiry_date: string | null;
  expiration_date?: string | null;
  credential_id: string | null;
  credential_url: string | null;
}

export interface Testimonial {
  testimonial_id: string;
  user_id: string;
  author_name: string;
  client_name?: string;
  author_title: string | null;
  client_position?: string | null;
  author_company: string | null;
  company_name?: string | null;
  client_photo_url?: string | null;
  content: string;
  rating: number | null;
  display_order: number;
}

export interface Project {
  project_id: string;
  user_id: string;
  title: string;
  short_description: string | null;
  description: string | null;
  thumbnail_url: string | null;
  project_url: string | null;
  source_code_url: string | null;
  tech_stack: string | null;
  project_type?: string | null;
  status?: string | null;
  role_in_project?: string | null;
  problem_statement?: string | null;
  solution_approach?: string | null;
  technical_challenges?: string | null;
  technologies_used?: string[] | null;
  live_demo_url?: string | null;
  github_repo_url?: string | null;
  app_store_url?: string | null;
  play_store_url?: string | null;
  case_study_url?: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectImage {
  image_id: string;
  project_id: string;
  image_url: string;
  caption: string | null;
  alt_text?: string | null;
  display_order: number;
}

export interface BlogPost {
  post_id: string;
  user_id: string;
  title: string;
  content: string;
  slug: string;
  excerpt?: string | null;
  tags?: string[] | null;
  read_time_minutes?: number | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthenticationState {
  current_user: User | null;
  auth_token: string | null;
  authentication_status: {
    is_authenticated: boolean;
    is_loading: boolean;
  };
  error_message: string | null;
}

interface ThemeState {
  mode: 'light' | 'dark';
}

interface FontScaleState {
  scale: number;
}

interface ActiveTabState {
  tab: string;
}

interface ResumeDownload {
  download_url?: string;
  created_at?: string;
  file_format?: string;
}

interface LoadingState {
  resume?: boolean;
}

interface ErrorState {
  resume?: string | null;
}

interface ContactFormStatus {
  is_submitting?: boolean;
  success_message?: string | null;
  error_message?: string | null;
}

interface AppState {
  authentication_state: AuthenticationState;
  theme_mode: ThemeState;
  font_scale: FontScaleState;
  active_tab: ActiveTabState;
  active_nav_section?: string;
  is_mobile_menu_open?: boolean;
  contact_form_status?: ContactFormStatus;
  site_settings?: any;
  is_loading?: LoadingState;
  errors?: ErrorState;
  resume_download?: ResumeDownload | null;
  
  // Actions
  login_user: (email: string, password: string) => Promise<void>;
  logout_user: () => void;
  register_user: (email: string, password: string, name: string) => Promise<void>;
  initialize_auth: () => Promise<void>;
  clear_auth_error: () => void;
  set_theme_mode: (mode: 'light' | 'dark') => void;
  set_font_scale: (scale: number) => void;
  set_active_tab: (tab: string) => void;
  toggle_mobile_menu?: () => void;
  close_mobile_menu?: () => void;
  set_active_nav_section?: (section: string) => void;
  fetch_resume_download?: () => Promise<void>;
  set_contact_form_status?: (status: Partial<ContactFormStatus>) => void;
  submit_contact_message?: (data: any) => Promise<void>;
}

// Create the store
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
      theme_mode: {
        mode: 'light',
      },
      font_scale: {
        scale: 1,
      },
      active_tab: {
        tab: 'home',
      },
      active_nav_section: 'home',
      is_mobile_menu_open: false,
      contact_form_status: {
        is_submitting: false,
        success_message: null,
        error_message: null,
      },
      site_settings: {},
      is_loading: {
        resume: false,
      },
      errors: {
        resume: null,
      },
      resume_download: null,

      // Actions
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
            `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/auth/login`,
            { email, password },
            { headers: { 'Content-Type': 'application/json' } }
          );

          const { user, token } = response.data;

          set(() => ({
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
          
          set(() => ({
            authentication_state: {
              current_user: null,
              auth_token: null,
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
        set(() => ({
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
        const currentState = get();
        set(() => ({
          authentication_state: {
            ...currentState.authentication_state,
            authentication_status: {
              ...currentState.authentication_state.authentication_status,
              is_loading: true,
            },
            error_message: null,
          },
        }));
        
        try {
          const response = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/auth/register`,
            { email, password, name },
            { headers: { 'Content-Type': 'application/json' } }
          );

          const { user, token } = response.data;

          set(() => ({
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
          const currentState2 = get();
          set(() => ({
            authentication_state: {
              ...currentState2.authentication_state,
              authentication_status: {
                ...currentState2.authentication_state.authentication_status,
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
        
        // If no token, we're definitely not authenticated
        if (!token) {
          const currentState = get();
          set(() => ({
            authentication_state: {
              ...currentState.authentication_state,
              authentication_status: {
                ...currentState.authentication_state.authentication_status,
                is_loading: false,
              },
            },
          }));
          return;
        }

        // Try to verify the token
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/users/${authentication_state.current_user?.user_id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          const user = response.data;
          
          set(() => ({
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
        } catch {
          // Token is invalid, clear auth state
          set(() => ({
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

      set_theme_mode: (mode: 'light' | 'dark') => {
        set(() => ({
          theme_mode: {
            mode,
          },
        }));
      },

      set_font_scale: (scale: number) => {
        set(() => ({
          font_scale: {
            scale,
          },
        }));
      },

      set_active_tab: (tab: string) => {
        set(() => ({
          active_tab: {
            tab,
          },
        }));
      },

      toggle_mobile_menu: () => {
        set((state) => ({
          is_mobile_menu_open: !state.is_mobile_menu_open,
        }));
      },

      close_mobile_menu: () => {
        set(() => ({
          is_mobile_menu_open: false,
        }));
      },

      set_active_nav_section: (section: string) => {
        set(() => ({
          active_nav_section: section,
        }));
      },

      fetch_resume_download: async () => {
        const currentState = get();
        set(() => ({ 
          is_loading: { ...currentState.is_loading, resume: true },
          errors: { ...currentState.errors, resume: null }
        }));
        try {
          const { authentication_state } = get();
          const response = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/users/${authentication_state.current_user?.user_id}/resume-downloads`,
            { 
              headers: { Authorization: `Bearer ${authentication_state.auth_token}` },
              params: { limit: 1, sort_order: 'desc' }
            }
          );
          const resumeData = response.data?.data?.[0] || null;
          const currentState2 = get();
          set(() => ({ 
            resume_download: resumeData,
            is_loading: { ...currentState2.is_loading, resume: false }
          }));
        } catch (error: any) {
          const currentState3 = get();
          set(() => ({ 
            is_loading: { ...currentState3.is_loading, resume: false },
            errors: { ...currentState3.errors, resume: error.response?.data?.message || error.message || 'Download failed' }
          }));
        }
      },

      set_contact_form_status: (status: Partial<ContactFormStatus>) => {
        const currentState = get();
        set(() => ({ 
          contact_form_status: { 
            ...currentState.contact_form_status,
            ...status
          } 
        }));
      },

      submit_contact_message: async (data: any) => {
        set(() => ({ 
          contact_form_status: {
            is_submitting: true,
            success_message: null,
            error_message: null,
          }
        }));
        try {
          const { authentication_state } = get();
          await axios.post(
            `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/contact-messages`,
            data,
            { headers: { Authorization: `Bearer ${authentication_state.auth_token}` } }
          );
          set(() => ({ 
            contact_form_status: {
              is_submitting: false,
              success_message: 'Message sent successfully!',
              error_message: null,
            }
          }));
        } catch (error: any) {
          set(() => ({ 
            contact_form_status: {
              is_submitting: false,
              success_message: null,
              error_message: error.response?.data?.message || error.message || 'Submission failed',
            }
          }));
        }
      },
    }),
    {
      name: 'portfolio-app-storage',
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
        theme_mode: state.theme_mode,
        font_scale: state.font_scale,
        active_tab: state.active_tab,
      }),
    }
  )
);