import axiosInstance from './axios';
import { RoutingRule } from './types';

export const getRoutingRule = async (): Promise<RoutingRule> => {
  return axiosInstance.get('/api/routing');
};

export const updateRoutingRule = async (rule: Partial<RoutingRule>): Promise<RoutingRule> => {
  return axiosInstance.put('/api/routing', rule);
};

export interface SimulationResponse {
  success: boolean;
  allocations?: Array<{
    cardId: string;
    cardLabel?: string;
    pan: string;
    bank?: string;
    charge: number;
    remaining: number;
    step?: number;
    cardProgram?: string;
  }>;
  reason?: string;
  anomaly?: { reasons: string[] } | null;
  mode?: string;
}

export const simulateRouting = async (data: { amount: number; merchant?: string; category?: string }): Promise<SimulationResponse> => {
  return axiosInstance.post('/api/routing/simulate', data);
};
