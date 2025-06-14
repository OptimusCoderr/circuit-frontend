import { create } from 'zustand';
import axiosInstance from '../lib/axios';

// Individual reading interface
export interface EnergyReading {
  timestamp: string | Date;
  voltage: number;
  current: number;
  ACvoltage: number;
  ACcurrent: number;
  power: number;
}

// Updated EnergyData interface (removed calculated fields)
export interface EnergyData {
  _id?: string;
  circuit: string; // ObjectId reference to Circuit
  batchTimestamp?: string | Date;
  readings: EnergyReading[]; // Array of up to 20 readings
  totalEnergyConsumed: number; // kWh
  status: 'active' | 'standby' | 'off';
  
  // Virtual fields for backward compatibility
  voltage?: number;
  current?: number;
  ACvoltage?: number;
  ACcurrent?: number;
  power?: number;
  timestamp?: string | Date;
  
  // Timestamps from mongoose
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

// Flattened reading for easier chart processing
export interface FlattenedReading extends EnergyReading {
  circuit: any; // Populated circuit data
  batchId: string;
  batchTimestamp: string | Date;
  status: string;
}

// Calculated statistics interface (for on-demand calculations)
export interface CalculatedStats {
  _id: string;
  circuit: any;
  avgVoltage: number;
  avgCurrent: number;
  avgACVoltage: number;
  avgACCurrent: number;
  avgPower: number;
  maxPower: number;
  minPower: number;
  maxVoltage: number;
  minVoltage: number;
  totalReadings: number;
  firstTimestamp: string | Date;
  lastTimestamp: string | Date;
  durationSeconds: number;
}

export interface EnergyDataState {
  energyDataList: EnergyData[];
  flattenedReadings: FlattenedReading[];
  calculatedStats: CalculatedStats[];
  loading: boolean;
  error: string | null;
  pagination: {
    current: number;
    pages: number;
    total: number;
  };
  
  // Available methods (matching actual routes)
  fetchFlattenedReadings: (params?: {
    circuit?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }) => Promise<void>;
  
  fetchAggregatedData: (params?: {
    circuit?: string;
    groupBy?: 'hour' | 'day' | 'week';
    startDate?: string;
    endDate?: string;
  }) => Promise<any[]>;
  
  // Create methods
  addEnergyDataBatch: (data: {
    circuit: string;
    readings: Omit<EnergyReading, 'timestamp'>[];
    totalEnergyConsumed: number;
    status?: 'active' | 'standby' | 'off';
  }) => Promise<void>;
  
  addSingleEnergyData: (data: {
    circuit: string;
    voltage: number;
    current: number;
    ACvoltage: number;
    ACcurrent: number;
    power: number;
    energyConsumed: number;
    status?: 'active' | 'standby' | 'off';
  }) => Promise<void>;
  
  clearError: () => void;
}

const useEnergyDataStore = create<EnergyDataState>((set, get) => ({
  energyDataList: [],
  flattenedReadings: [],
  calculatedStats: [],
  loading: false,
  error: null,
  pagination: { current: 1, pages: 1, total: 0 },

  // Fetch flattened readings for detailed analysis
  fetchFlattenedReadings: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const queryParams = new URLSearchParams();
      if (params.circuit) queryParams.append('circuit', params.circuit);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      if (params.limit) queryParams.append('limit', params.limit.toString());

      const response = await axiosInstance.get<FlattenedReading[]>(
        `/energy/energy-data/flattened?${queryParams.toString()}`
      );
      
      set({ flattenedReadings: response.data, loading: false });
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to fetch flattened readings';
      set({ error: message, loading: false });
    }
  },

  // Fetch aggregated data for charts
  fetchAggregatedData: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const queryParams = new URLSearchParams();
      if (params.circuit) queryParams.append('circuit', params.circuit);
      if (params.groupBy) queryParams.append('groupBy', params.groupBy);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);

      const response = await axiosInstance.get<any[]>(
        `/energy/energy-data/aggregated?${queryParams.toString()}`
      );
      
      set({ loading: false });
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to fetch aggregated data';
      set({ error: message, loading: false });
      return [];
    }
  },

  // Add energy data batch (multiple readings)
  addEnergyDataBatch: async (data) => {
    set({ loading: true, error: null });
    try {
      // Add timestamps to readings
      const readingsWithTimestamps = data.readings.map((reading, index) => ({
        ...reading,
        timestamp: new Date(Date.now() + index * 1000) // 1 second apart
      }));

      const payload = {
        ...data,
        readings: readingsWithTimestamps
      };

      const response = await axiosInstance.post<EnergyData>('/energy/energy-data', payload);
      set((state) => ({
        energyDataList: [response.data, ...state.energyDataList],
        loading: false,
      }));
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to add energy data batch';
      set({ error: message, loading: false });
      throw err;
    }
  },

  // Add single energy data (backward compatibility)
  addSingleEnergyData: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.post<EnergyData>('/energy/energy-data/single', data);
      set((state) => ({
        energyDataList: [response.data, ...state.energyDataList],
        loading: false,
      }));
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to add single energy data';
      set({ error: message, loading: false });
      throw err;
    }
  },

  // Clear error state
  clearError: () => {
    set({ error: null });
  },
}));

export default useEnergyDataStore;