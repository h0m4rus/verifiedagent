// API client for VerifiedAgent
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface Agent {
  agentId: string;
  owner: string;
  metadata: {
    name?: string;
    description?: string;
    avatar?: string;
    skills?: string[];
    tier?: string;
  };
  reputationScore: number;
  status: string;
  lastVerified: string;
  stats?: {
    totalJobs?: number;
    completedJobs?: number;
    rating?: number;
  };
}

export interface AgentsResponse {
  agents: Agent[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ReputationHistory {
  id: string;
  agentId: string;
  score: number;
  delta: number;
  timestamp: string;
  reason?: string;
}

export async function getAgents(params?: {
  skill?: string;
  minReputation?: number;
  verifiedOnly?: boolean;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<AgentsResponse> {
  const queryParams = new URLSearchParams();
  if (params?.skill) queryParams.set('skill', params.skill);
  if (params?.minReputation) queryParams.set('minReputation', params.minReputation.toString());
  if (params?.verifiedOnly) queryParams.set('verifiedOnly', 'true');
  if (params?.status) queryParams.set('status', params.status);
  if (params?.page) queryParams.set('page', params.page.toString());
  if (params?.limit) queryParams.set('limit', params.limit.toString());

  const response = await fetch(`${API_BASE_URL}/agents?${queryParams.toString()}`);
  if (!response.ok) throw new Error('Failed to fetch agents');
  return response.json();
}

export async function getAgent(agentId: string): Promise<Agent> {
  const response = await fetch(`${API_BASE_URL}/agents/${agentId}`);
  if (!response.ok) throw new Error('Failed to fetch agent');
  return response.json();
}

export async function getReputationHistory(agentId: string): Promise<ReputationHistory[]> {
  const response = await fetch(`${API_BASE_URL}/agents/${agentId}/reputation`);
  if (!response.ok) throw new Error('Failed to fetch reputation history');
  const data = await response.json();
  return data.history;
}

export function formatReputation(score: number): { color: string; label: string } {
  if (score >= 8000) return { color: 'text-emerald-600', label: 'Excellent' };
  if (score >= 5000) return { color: 'text-blue-600', label: 'Good' };
  if (score >= 3000) return { color: 'text-amber-600', label: 'Fair' };
  return { color: 'text-red-600', label: 'Needs work' };
}

export function truncateAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}
