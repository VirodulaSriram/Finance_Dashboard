import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './useAuthStore';
import type { Transaction, Theme } from '../types';

const API_BASE = 'http://localhost:5001/api';

interface FinanceState {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  theme: Theme;
  insights: string | null;
  insightsLoading: boolean;

  fetchTransactions: () => Promise<void>;
  addTransaction: (tx: Omit<Transaction, 'id' | 'userId'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  generateInsights: () => Promise<void>;
  toggleTheme: () => void;
}

export const useFinanceStore = create<FinanceState>((set) => ({
  transactions: [],
  loading: false,
  error: null,
  theme: (localStorage.getItem('theme') as Theme) || 'light',
  insights: null,
  insightsLoading: false,

  fetchTransactions: async () => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;

    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_BASE}/transactions`, {
        headers: { 'User-Id': userId }
      });
      set({ transactions: response.data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  addTransaction: async (tx) => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;

    try {
      const response = await axios.post(`${API_BASE}/transactions`, tx, {
        headers: { 'User-Id': userId }
      });
      set((state) => ({ transactions: [...state.transactions, response.data] }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  deleteTransaction: async (id) => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;

    try {
      await axios.delete(`${API_BASE}/transactions/${id}`, {
        headers: { 'User-Id': userId }
      });
      set((state) => ({
        transactions: state.transactions.filter((t) => t.id !== id),
      }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  generateInsights: async () => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;

    set({ insightsLoading: true, error: null });
    try {
      const response = await axios.get(`${API_BASE}/insights`, {
        headers: { 'User-Id': userId }
      });
      set({ insights: response.data.insights, insightsLoading: false });
    } catch (error: any) {
      set({ error: 'Failed to fetch insights', insightsLoading: false });
    }
  },

  toggleTheme: () => {
    set((state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      document.documentElement.setAttribute('data-bs-theme', newTheme);
      return { theme: newTheme };
    });
  },
}));
