import { Member, Settings, DashboardStats } from '../types';

let API_URL = localStorage.getItem('BRIGHT_ASIDE_API_URL') || '';

export const setApiUrl = (url: string) => {
  API_URL = url;
  localStorage.setItem('BRIGHT_ASIDE_API_URL', url);
};

export const getApiUrl = () => API_URL;

const handleRes = async (res: Response) => {
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'API Error');
  return json.data;
};

export const API = {
  get: async (action: string, params: Record<string, any> = {}) => {
    if (!API_URL) return null;
    const url = new URL(API_URL);
    url.searchParams.set('action', action);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
    
    // Using a proxy or direct fetch depending on environment
    // In many cases Apps Script requires CORS handling
    const res = await fetch(url.toString());
    return handleRes(res);
  },
  
  post: async (action: string, payload: any = {}) => {
    if (!API_URL) return null;
    const res = await fetch(API_URL, {
      method: 'POST',
      redirect: 'follow', // Important for GAS
      body: JSON.stringify({ action, payload })
    });
    return handleRes(res);
  }
};

export default API;
