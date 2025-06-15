import { create } from "zustand";
import axios  from "../lib/axios.ts"
import { toast } from "react-hot-toast";

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
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

}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set,get) => ({
  user: null,
  isAuthenticated: false,
  error: null,
  isLoading: false,
  isCheckingAuth: true,
  message: null,

  signup: async (email: string, password: string, name: string) => {
    set({ isLoading: true, error: null });
    try {
      console.log("Signup payload:", { email, password: "***", name});
      const response = await axios.post(`/auth/signup`, { email, password, name});
      console.log("Signup response:", response.data);
      set({ user: response.data.user, isAuthenticated: true, isLoading: false });
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
      set({
        isAuthenticated: true,
        user: response.data.user,
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
      set({ user: null, isAuthenticated: false, error: null, isLoading: false });
    } catch (error: any) {
      set({ error: "Error logging out", isLoading: false });
      toast.error("Error logging out: " + (error.response?.data?.message || "Please try again later"));
      throw error;
    }
  },


  checkAuth: async () => {
    set({ isCheckingAuth: true, error: null });
    try {
      const response = await axios.get(`/auth/check-auth`);
      set({ user: response.data.email, isAuthenticated: true, isCheckingAuth: false });
    } catch (error: any) {
      set({ error: null, isCheckingAuth: false, isAuthenticated: false });
    }
  },

  refreshToken: async () => {
		// Prevent multiple simultaneous refresh attempts
		if (get().isCheckingAuth) return;

		set({ isCheckingAuth: true });
		try {
			const response = await axios.post("/auth/refresh-token");
			set({ isCheckingAuth: false });
			return response.data;
		} catch (error) {
			set({ user: null, isCheckingAuth: false });
			throw error;
		}
	},
}));

// Axios interceptor for token refresh
let refreshPromise = null;

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
