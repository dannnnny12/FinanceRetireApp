import { Platform } from 'react-native';

const HOST =
  Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
// 用實機請改成： 'http://192.168.x.x:3000'

export const API_BASE = HOST;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  const text = await res.text();
  const body = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(body?.error || `HTTP ${res.status}`);
  return body as T;
}

export const api = {
  getDashboard: () => request<DashboardDTO>('/dashboard'),
  updateGoal: (retirementGoal: number) =>
    request('/dashboard/goal', { method: 'PUT', body: JSON.stringify({ retirementGoal }) }),

  listAssets: () => request<Asset[]>('/assets'),
  createAsset: (a: AssetInput) => request<Asset>('/assets', { method: 'POST', body: JSON.stringify(a) }),
  deleteAsset: (id: string) => request(`/assets/${id}`, { method: 'DELETE' }),

  listLiabilities: () => request<Liability[]>('/liabilities'),
  createLiability: (l: LiabilityInput) => request<Liability>('/liabilities', { method: 'POST', body: JSON.stringify(l) }),
  deleteLiability: (id: string) => request(`/liabilities/${id}`, { method: 'DELETE' }),
};

export type Asset = { _id: string; name: string; type: string; symbol?: string; quantity: number; price: number; currency: string };
export type AssetInput = Omit<Asset, '_id'>;
export type Liability = { _id: string; name: string; type: string; amount: number; interestRate: number; currency: string };
export type LiabilityInput = Omit<Liability, '_id'>;
export type DashboardDTO = {
  liabilitiesDetail: any;
  totalAssets: number; totalLiabilities: number; netWorth: number;
  retirementGoal: number; progress: number; progressPercent: number;
  allocation: Record<string, number>;
};
