// Finance data storage service using localStorage

import type { FinanceData, Transaction } from './types';

const STORAGE_KEY = 'ink-finance-data';
const CURRENT_VERSION = 1;

function getInitialData(): FinanceData {
  return {
    transactions: [],
    version: CURRENT_VERSION,
  };
}

export function loadFinanceData(): FinanceData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return getInitialData();
    }
    const data = JSON.parse(stored) as FinanceData;
    // Version migration could happen here if needed
    return data;
  } catch (error) {
    console.error('Failed to load finance data:', error);
    return getInitialData();
  }
}

export function saveFinanceData(data: FinanceData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save finance data:', error);
  }
}

export function addTransaction(data: FinanceData, transaction: Transaction): FinanceData {
  return {
    ...data,
    transactions: [...data.transactions, transaction],
  };
}

export function updateTransaction(data: FinanceData, id: string, updates: Partial<Transaction>): FinanceData {
  return {
    ...data,
    transactions: data.transactions.map(t =>
      t.id === id ? { ...t, ...updates } : t
    ),
  };
}

export function deleteTransaction(data: FinanceData, id: string): FinanceData {
  return {
    ...data,
    transactions: data.transactions.filter(t => t.id !== id),
  };
}

export function generateId(): string {
  return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
