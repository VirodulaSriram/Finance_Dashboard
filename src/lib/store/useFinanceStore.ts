import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './useAuthStore';
import { Transaction, Budget, Goal } from '../types';

const API_BASE = '/api';

interface FinanceState {
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  loading: boolean;
  error: string | null;

  fetchTransactions: () => Promise<void>;
  addTransaction: (tx: Omit<Transaction, 'id' | 'userId'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  fetchBudgets: () => Promise<void>;
  addBudget: (budget: Omit<Budget, 'id' | 'userId'>) => Promise<void>;
  resetBudgets: () => Promise<void>;

  fetchGoals: () => Promise<void>;
  addGoal: (goal: Omit<Goal, 'id' | 'userId'>) => Promise<void>;
  resetGoals: () => Promise<void>;
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  transactions: [],
  budgets: [],
  goals: [],
  loading: false,
  error: null,

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
      set({ error: error.response?.data?.error || error.message, loading: false });
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
      set({ error: error.response?.data?.error || error.message });
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
      set({ error: error.response?.data?.error || error.message });
    }
  },

  fetchBudgets: async () => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;

    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_BASE}/budgets`, {
        headers: { 'User-Id': userId }
      });
      set({ budgets: response.data, loading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.error || error.message, loading: false });
    }
  },

  addBudget: async (budget) => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;

    try {
      const response = await axios.post(`${API_BASE}/budgets`, budget, {
        headers: { 'User-Id': userId }
      });
      set((state) => ({ budgets: [...state.budgets, response.data] }));
    } catch (error: any) {
      set({ error: error.response?.data?.error || error.message });
    }
  },

  resetBudgets: async () => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;

    try {
      await axios.delete(`${API_BASE}/budgets`, {
        headers: { 'User-Id': userId }
      });
      set({ budgets: [] });
    } catch (error: any) {
      set({ error: error.response?.data?.error || error.message });
    }
  },

  fetchGoals: async () => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;

    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_BASE}/goals`, {
        headers: { 'User-Id': userId }
      });
      set({ goals: response.data, loading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.error || error.message, loading: false });
    }
  },

  addGoal: async (goal) => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;

    try {
      const response = await axios.post(`${API_BASE}/goals`, goal, {
        headers: { 'User-Id': userId }
      });
      set((state) => ({ goals: [...state.goals, response.data] }));
    } catch (error: any) {
      set({ error: error.response?.data?.error || error.message });
    }
  },

  resetGoals: async () => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;

    try {
      await axios.delete(`${API_BASE}/goals`, {
        headers: { 'User-Id': userId }
      });
      set({ goals: [] });
    } catch (error: any) {
      set({ error: error.response?.data?.error || error.message });
    }
  },
}));
