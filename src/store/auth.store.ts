import { create } from "zustand";
import axios from "../lib/axios.ts";
import { toast } from "react-hot-toast";

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  error: string | null;
  isLoading: boolean;
  isCheckingAuth: boolean;
  message: string | null;
}

interface AuthActions {
  signup: (email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  refreshToken: () => Promise<void>;
  setToken: (token: string | null) => void;
}

type AuthStore = AuthState & AuthActions;

// Initialize state from localStorage
const getInitialState = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  return {
    token,
    user: user ? JSON.parse(user) : null,
    isAuthenticated: !!token, // Set authenticated if token exists
  };
};

export const useAuthStore = create<AuthStore>((set, get) => {
  const initialState = getInitialState();
  
  return {
    user: initialState.user,
    token: initialState.token,
    isAuthenticated: initialState.isAuthenticated,
    error: null,
    isLoading: false,
    isCheckingAuth: true,
    message: null,

  setToken: (token: string | null) => {
    if (token) {
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete axios.defaults.headers.common['Authorization'];
    }
    set({ token });
  },

  signup: async (email: string, password: string, name: string) => {
    set({ isLoading: true, error: null });
    try {
      console.log("Signup payload:", { email, password: "***", name });
      const response = await axios.post(`/auth/signup`, { email, password, name });
      console.log("Signup response:", response.data);
      
      const { user, token } = response.data;
      
      // Set token and update state
      get().setToken(token);
      localStorage.setItem('user', JSON.stringify(user));
      set({ 
        user, 
        isAuthenticated: true, 
        isLoading: false 
      });
    } catch (error: any) {
      console.error("Signup error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      set({ error: error.response?.data?.message || "Error signing up", isLoading: false });
      toast.error("Error signing up: " + (error.response?.data?.message || "Please try again later"));
      throw error;
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`/auth/login`, { email, password });
      console.log("SignIn response:", response.data);
      
      const { user, token } = response.data;
      
      // Set token and update state
      get().setToken(token);
      localStorage.setItem('user', JSON.stringify(user));
      set({
        isAuthenticated: true,
        user,
        error: null,
        isLoading: false,
      });
    } catch (error: any) {
      set({ error: error.response?.data?.message || "Error logging in", isLoading: false });
      toast.error("Error logging in: " + (error.response?.data?.message || "Please try again later"));
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await axios.post(`/auth/logout`);
      // Clear token and state
      get().setToken(null);
      set({ 
        user: null, 
        isAuthenticated: false, 
        error: null, 
        isLoading: false 
      });
    } catch (error: any) {
      // Even if logout fails on server, clear local state
      get().setToken(null);
      set({ 
        user: null, 
        isAuthenticated: false, 
        error: "Error logging out", 
        isLoading: false 
      });
      toast.error("Error logging out: " + (error.response?.data?.message || "Please try again later"));
      throw error;
    }
  },

  checkAuth: async () => {
    set({ isCheckingAuth: true, error: null });
    try {
      const token = get().token;
      if (!token) {
        set({ error: null, isCheckingAuth: false, isAuthenticated: false });
        return;
      }

      // Set token in axios headers if it exists
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      const response = await axios.get(`/auth/check-auth`);
      set({ 
        user: response.data.user, // Fix: should be user object, not email
        isAuthenticated: true, 
        isCheckingAuth: false 
      });
    } catch (error: any) {
      // Token is invalid, clear it
      get().setToken(null);
      set({ 
        user: null,
        error: null, 
        isCheckingAuth: false, 
        isAuthenticated: false 
      });
    }
  },

  refreshToken: async () => {
    // Prevent multiple simultaneous refresh attempts
    if (get().isCheckingAuth) return;

    set({ isCheckingAuth: true });
    try {
      const response = await axios.post("/auth/refresh-token");
      const { token, user } = response.data;
      
      // Update token and user
      get().setToken(token);
      localStorage.setItem('user', JSON.stringify(user));
      set({ 
        user,
        isAuthenticated: true,
        isCheckingAuth: false 
      });
      
      return response.data;
    } catch (error) {
      get().setToken(null);
      set({ 
        user: null, 
        isAuthenticated: false,
        isCheckingAuth: false 
      });
      throw error;
    }
  },
}});

// Initialize axios with token on app start
const initializeAxios = () => {
  const token = localStorage.getItem('token');
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
};

// Call initialization
initializeAxios();

// Axios interceptor for token refresh
let refreshPromise: Promise<any> | null = null;

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // If a refresh is already in progress, wait for it to complete
        if (refreshPromise) {
          await refreshPromise;
          return axios(originalRequest);
        }

        // Start a new refresh process
        refreshPromise = useAuthStore.getState().refreshToken();
        await refreshPromise;
        refreshPromise = null;

        return axios(originalRequest);
      } catch (refreshError) {
        // If refresh fails, redirect to login or handle as needed
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
