export type Role = 'Admin' | 'Viewer';

export interface User {
  id: string;
  username: string;
  email: string;
  role: Role;
  country?: string;
  currencyCode: string;
  phone?: string;
  avatar?: string;
}

export type TransactionType = 'Income' | 'Expense';

export interface Transaction {
  id: string;
  userId: string;
  title: string;
  date: string;
  amount: number;
  category: string;
  type: TransactionType;
}

export interface Budget {
  id: string;
  userId: string;
  category: string;
  total: number;
  spent: number;
  color: string;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  target: number;
  current: number;
  deadline: string;
  priority: 'High' | 'Medium' | 'Low' | 'Critical';
  color: string;
}

export type Theme = 'light' | 'dark';
