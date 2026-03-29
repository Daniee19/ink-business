// Finance app types

export type TransactionType = 'income' | 'expense';

export type Category =
  // Income categories
  | 'salary'
  | 'freelance'
  | 'investments'
  | 'gifts'
  | 'other_income'
  // Expense categories
  | 'food'
  | 'transport'
  | 'housing'
  | 'utilities'
  | 'entertainment'
  | 'health'
  | 'shopping'
  | 'education'
  | 'other_expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  title: string;
  amount: number;
  description: string;
  category: Category;
  date: string; // ISO date string
  createdAt: string; // ISO timestamp
  source: 'manual' | 'ink'; // How it was created
}

export interface FinanceData {
  transactions: Transaction[];
  version: number;
}

// Category metadata for display
export const INCOME_CATEGORIES: { value: Category; label: string; emoji: string }[] = [
  { value: 'salary', label: 'Salario', emoji: '💼' },
  { value: 'freelance', label: 'Freelance', emoji: '💻' },
  { value: 'investments', label: 'Inversiones', emoji: '📈' },
  { value: 'gifts', label: 'Regalos', emoji: '🎁' },
  { value: 'other_income', label: 'Otros', emoji: '💰' },
];

export const EXPENSE_CATEGORIES: { value: Category; label: string; emoji: string }[] = [
  { value: 'food', label: 'Comida', emoji: '🍔' },
  { value: 'transport', label: 'Transporte', emoji: '🚗' },
  { value: 'housing', label: 'Vivienda', emoji: '🏠' },
  { value: 'utilities', label: 'Servicios', emoji: '💡' },
  { value: 'entertainment', label: 'Entretenimiento', emoji: '🎮' },
  { value: 'health', label: 'Salud', emoji: '🏥' },
  { value: 'shopping', label: 'Compras', emoji: '🛒' },
  { value: 'education', label: 'Educacion', emoji: '📚' },
  { value: 'other_expense', label: 'Otros', emoji: '📦' },
];

export function getCategoryInfo(category: Category) {
  return [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES].find(c => c.value === category);
}

export function getDefaultCategory(type: TransactionType): Category {
  return type === 'income' ? 'other_income' : 'other_expense';
}
