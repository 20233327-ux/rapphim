import { Movie, Room, Showtime, User, Booking, Shift } from './types';
import { MOVIES, ROOMS, SHOWTIMES, USERS, BOOKINGS, SHIFTS } from './constants';

const STORAGE_KEY = 'cinemahub_data';
const AUTH_TOKEN_KEY = 'cinemahub_auth_token';
const REFRESH_TOKEN_KEY = 'cinemahub_refresh_token';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export interface AppData {
  movies: Movie[];
  rooms: Room[];
  showtimes: Showtime[];
  users: User[];
  bookings: Booking[];
  shifts: Shift[];
}

const DEFAULT_DATA: AppData = {
  movies: MOVIES,
  rooms: ROOMS,
  showtimes: SHOWTIMES,
  users: USERS,
  bookings: BOOKINGS,
  shifts: SHIFTS,
};

interface LoginResponse {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: User['role'];
  };
}

interface MeResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: User['role'];
  };
}

export const dataService = {
  getAuthToken: (): string | null => {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },

  setAuthToken: (token: string): void => {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  },

  getRefreshToken: (): string | null => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setRefreshToken: (token: string): void => {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  },

  clearAuthToken: (): void => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  refreshAccessToken: async (): Promise<string | null> => {
    const refreshToken = dataService.getRefreshToken();
    if (!refreshToken) return null;

    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      dataService.clearAuthToken();
      return null;
    }

    const payload = (await response.json()) as LoginResponse;
    dataService.setAuthToken(payload.token);
    dataService.setRefreshToken(payload.refreshToken);
    return payload.token;
  },

  authorizedFetch: async (input: string, init?: RequestInit, retry = true): Promise<Response> => {
    const token = dataService.getAuthToken();
    const response = await fetch(input, {
      ...init,
      headers: {
        ...(init?.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (response.status !== 401 || !retry) {
      return response;
    }

    const newToken = await dataService.refreshAccessToken();
    if (!newToken) {
      return response;
    }

    return fetch(input, {
      ...init,
      headers: {
        ...(init?.headers || {}),
        Authorization: `Bearer ${newToken}`,
      },
    });
  },

  login: async (identifier: string, password: string): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ identifier, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Dang nhap that bai');
    }

    const payload = (await response.json()) as LoginResponse;
    dataService.setAuthToken(payload.token);
    dataService.setRefreshToken(payload.refreshToken);
    return payload;
  },

  register: async (name: string, email: string, password: string, phone?: string): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password, phone: phone || null }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Đăng ký thất bại');
    }

    const payload = (await response.json()) as LoginResponse;
    dataService.setAuthToken(payload.token);
    dataService.setRefreshToken(payload.refreshToken);
    return payload;
  },

  getCurrentUser: async (): Promise<MeResponse['user'] | null> => {
    const response = await dataService.authorizedFetch(`${API_BASE_URL}/api/auth/me`);

    if (!response.ok) {
      dataService.clearAuthToken();
      return null;
    }

    const payload = (await response.json()) as MeResponse;
    return payload.user;
  },

  /**
   * Loads data from API first, then localStorage, then default constants.
   */
  loadData: async (): Promise<AppData> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/data`);
      if (response.ok) {
        const apiData = await response.json();
        dataService.saveDataToLocal(apiData);
        return apiData;
      }
    } catch (error) {
      console.warn('API is unavailable, fallback to localStorage:', error);
    }

    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (storedData) {
        return JSON.parse(storedData);
      }
    } catch (error) {
      console.error('Failed to load data from localStorage:', error);
    }
    
    // Initialize localStorage with default data if empty or failed to load
    dataService.saveDataToLocal(DEFAULT_DATA);
    return DEFAULT_DATA;
  },

  /**
   * Saves data to API and localStorage.
   */
  saveData: async (data: AppData): Promise<void> => {
    dataService.saveDataToLocal(data);

    try {
      const response = await dataService.authorizedFetch(`${API_BASE_URL}/api/data`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`API save failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to save data to API:', error);
    }
  },

  /**
   * Saves data to localStorage.
   */
  saveDataToLocal: (data: AppData): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save data to localStorage:', error);
    }
  },

  /**
   * Resets data to original constants.
   */
  resetData: async (): Promise<AppData> => {
    await dataService.saveData(DEFAULT_DATA);
    return DEFAULT_DATA;
  }
};
