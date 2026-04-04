export type InsightResponse = {
  insights: string;
};

export type TransactionCategory = 'Salary' | 'Groceries' | 'Entertainment' | 'Utilities' | 'Rent' | 'Other';
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

export type Role = 'Viewer' | 'Admin';
export type Theme = 'light' | 'dark';

export interface User {
  id: string;
  username: string;
  email: string;
  role: Role;
  country: string;
  currencyCode: string;
  phone: string;
  avatar: string;
}
