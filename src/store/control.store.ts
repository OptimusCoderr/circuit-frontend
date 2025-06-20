// stores/circuitStore.ts
import { create } from 'zustand';
import axiosInstance from '../lib/axios';

// Circuit state type
export type CircuitState = "0" | "1";

// Control interface
export interface Control {
  _id: string;
  circuitstate: CircuitState;
  createdAt: string | Date;
  updatedAt: string | Date;
  __v?: number;
}

// API response interface
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  count?: number;
}

// Store state interface
export interface CircuitStore {
  // State
  currentState: CircuitState | null;
  controlHistory: Control[];
  loading: boolean;
  error: string | null;
  lastUpdated: string | Date | null;
  
  // Actions
  updateCircuitState: (state: CircuitState) => Promise<void>;
  getCurrentState: () => Promise<void>;
  getCircuitHistory: () => Promise<void>;
  clearError: () => void;
}

const useCircuitStore = create<CircuitStore>((set, get) => ({
  // Initial state
  currentState: null,
  controlHistory: [],
  loading: false,
  error: null,
  lastUpdated: null,

  // Update circuit state (POST request)
  updateCircuitState: async (state: CircuitState) => {
    set({ loading: true, error: null });
    try {
      const payload = { circuitstate: state };
      
      const response = await axiosInstance.post<ApiResponse<Control>>(
        '/control/circuit-state',
        payload
      );

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      const updatedControl = response.data.data;
      
      set((currentState) => ({
        currentState: updatedControl.circuitstate,
        lastUpdated: updatedControl.updatedAt,
        controlHistory: [updatedControl, ...currentState.controlHistory],
        loading: false,
      }));
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to update circuit state';
      set({ error: message, loading: false });
      throw err;
    }
  },

  // Get current circuit state (GET request)
  getCurrentState: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.get<ApiResponse<Control>>(
        '/control/circuit-state'
      );

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      const control = response.data.data;
      
      set({
        currentState: control.circuitstate,
        lastUpdated: control.updatedAt,
        loading: false,
      });
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to get current circuit state';
      set({ error: message, loading: false });
      throw err;
    }
  },

  // Get circuit state history (GET request)
  getCircuitHistory: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.get<ApiResponse<Control[]>>(
        '/control/circuit-state/history'
      );

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      set({
        controlHistory: response.data.data,
        loading: false,
      });
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to get circuit history';
      set({ error: message, loading: false });
      throw err;
    }
  },

  // Clear error state
  clearError: () => {
    set({ error: null });
  },
}));

export default useCircuitStore;
