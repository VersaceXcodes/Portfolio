import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

// Type definitions
interface User {
  user_id: string;
  email: string;
  name: string;
  tagline: string | null;
  bio_text: string | null;
  header_image_url: string | null;
  avatar_url: string | null;
  video_embed_url: string | null;
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

interface AppState {
  authentication_state: AuthenticationState;
  theme_mode: ThemeState;
  font_scale: FontScaleState;
  active_tab: ActiveTabState;
  
  // Actions
  login_user: (email: string, password: string) => Promise<void>;
  logout_user: () => void;
  register_user: (email: string, password: string, name: string) => Promise<void>;
  initialize_auth: () => Promise<void>;
  clear_auth_error: () => void;
  set_theme_mode: (mode: 'light' | 'dark') => void;
  set_font_scale: (scale: number) => void;
  set_active_tab: (tab: string) => void;
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
            `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/auth/register`,
            { email, password, name },
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
                ...state.authentication_state.authentication_status,
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

        // Try to verify the token
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/users/${authentication_state.current_user?.user_id}`,
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

      set_theme_mode: (mode: 'light' | 'dark') => {
        set((state) => ({
          theme_mode: {
            mode,
          },
        }));
      },

      set_font_scale: (scale: number) => {
        set((state) => ({
          font_scale: {
            scale,
          },
        }));
      },

      set_active_tab: (tab: string) => {
        set((state) => ({
          active_tab: {
            tab,
          },
        }));
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