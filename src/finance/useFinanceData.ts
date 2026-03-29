// React hook for managing finance data

import { useState, useCallback, useEffect } from 'react';
import type { FinanceData, Transaction, TransactionType, Category } from './types';
import { getDefaultCategory } from './types';
import { loadFinanceData, saveFinanceData, addTransaction, deleteTransaction, generateId } from './storage';

export function useFinanceData() {
  const [data, setData] = useState<FinanceData>(() => loadFinanceData());

  // Save to localStorage whenever data changes
  useEffect(() => {
    saveFinanceData(data);
  }, [data]);

  const createTransaction = useCallback((
    type: TransactionType,
    title: string,
    amount: number,
    description: string,
    category?: Category,
    source: 'manual' | 'ink' = 'manual'
  ): Transaction => {
    const transaction: Transaction = {
      id: generateId(),
      type,
      title,
      amount: Math.abs(amount),
      description,
      category: category ?? getDefaultCategory(type),
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      source,
    };

    setData(prev => addTransaction(prev, transaction));
    return transaction;
  }, []);

  const removeTransaction = useCallback((id: string) => {
    setData(prev => deleteTransaction(prev, id));
  }, []);

  const updateTransactionCategory = useCallback((id: string, category: Category) => {
    setData(prev => ({
      ...prev,
      transactions: prev.transactions.map(t =>
        t.id === id ? { ...t, category } : t
      ),
    }));
  }, []);

  // Statistics calculations
  const getStats = useCallback(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyTransactions = data.transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const totalIncome = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpenses;

    // Group expenses by category
    const expensesByCategory = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    // Group income by category
    const incomeByCategory = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    // Daily totals for the current month (for trend chart)
    const dailyTotals = Array.from({ length: 31 }, (_, i) => {
      const day = i + 1;
      const dayTransactions = monthlyTransactions.filter(t => {
        const date = new Date(t.date);
        return date.getDate() === day;
      });

      const income = dayTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = dayTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      return { day, income, expenses };
    }).filter(d => d.income > 0 || d.expenses > 0);

    return {
      totalIncome,
      totalExpenses,
      balance,
      expensesByCategory,
      incomeByCategory,
      dailyTotals,
      monthlyTransactions,
      allTransactions: data.transactions,
    };
  }, [data.transactions]);

  return {
    data,
    createTransaction,
    removeTransaction,
    updateTransactionCategory,
    getStats,
  };
}
