// stores/circuitStore.ts
import { create } from 'zustand';
import axiosInstance from '../lib/axios';

// Circuit state type
export type CircuitState = "0" | "1";

// Control interface
export interface Control {
  _id?: string;
  circuitstate?: CircuitState;
  circuitstate1?: CircuitState;
  createdAt?: string | Date;
  updatedAt?: string | Date;
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
  currentState1: CircuitState | null;
  controlHistory: Control[];
  loading: boolean;
  error: string | null;
  lastUpdated: string | Date | null;
  
  // Actions for circuit state
  updateCircuitState: (state: CircuitState) => Promise<void>;
  getCurrentState: () => Promise<void>;
  
  // Actions for circuit state1
  updateCircuitState1: (state: CircuitState) => Promise<void>;
  getCurrentState1: () => Promise<void>;
  
  // General actions
  getCircuitHistory: () => Promise<void>;
  clearError: () => void;
}

const useCircuitStore = create<CircuitStore>((set, get) => ({
  // Initial state
  currentState: null,
  currentState1: null,
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
        currentState: updatedControl.circuitstate || null,
        currentState1: updatedControl.circuitstate1 || currentState.currentState1,
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

  // Update circuit state1 (POST request)
  updateCircuitState1: async (state: CircuitState) => {
    set({ loading: true, error: null });
    try {
      const payload = { circuitstate1: state };
      
      const response = await axiosInstance.post<ApiResponse<Control>>(
        '/control/circuit-state1',
        payload
      );

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      const updatedControl = response.data.data;
      
      set((currentState) => ({
        currentState: updatedControl.circuitstate || currentState.currentState,
        currentState1: updatedControl.circuitstate1 || null,
        lastUpdated: updatedControl.updatedAt,
        controlHistory: [updatedControl, ...currentState.controlHistory],
        loading: false,
      }));
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to update circuit state1';
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
      
      set((currentState) => ({
        currentState: control.circuitstate || null,
        lastUpdated: control.updatedAt,
        loading: false,
      }));
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to get current circuit state';
      set({ error: message, loading: false });
      throw err;
    }
  },

  // Get current circuit state1 (GET request)
  getCurrentState1: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.get<ApiResponse<Control>>(
        '/control/circuit-state1'
      );

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      const control = response.data.data;
      
      set((currentState) => ({
        currentState1: control.circuitstate1 || null,
        lastUpdated: control.updatedAt,
        loading: false,
      }));
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to get current circuit state1';
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
