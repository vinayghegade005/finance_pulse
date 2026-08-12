/* ==========================================================================
   FINANCEPULSE - DATA STORE & LOCAL STORAGE MANAGER
   ========================================================================== */

import { normalizePaymentMethod } from './formatters';

const STORAGE_KEY = 'finance_pulse_db_v2';

export const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee (₹)' },
  { code: 'USD', symbol: '$', name: 'US Dollar ($)' },
  { code: 'EUR', symbol: '€', name: 'Euro (€)' },
  { code: 'GBP', symbol: '£', name: 'British Pound (£)' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen (¥)' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar (A$)' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar (C$)' },
  { code: 'AED', symbol: 'AED ', name: 'UAE Dirham (AED)' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar (S$)' }
];

export const DEFAULT_CATEGORIES = {
  expense: [
    { name: 'Housing & Rent', color: '#6366f1' },
    { name: 'Groceries & Dining', color: '#10b981' },
    { name: 'Transport & Fuel', color: '#0ea5e9' },
    { name: 'Utilities & Bills', color: '#f59e0b' },
    { name: 'Entertainment & Subs', color: '#ec4899' },
    { name: 'Shopping & Clothes', color: '#8b5cf6' },
    { name: 'Health & Medical', color: '#f43f5e' },
    { name: 'Other Expenses', color: '#64748b' }
  ],
  income: [
    { name: 'Salary & Wages', color: '#10b981' },
    { name: 'Freelance & Projects', color: '#0ea5e9' },
    { name: 'Investments & Dividends', color: '#6366f1' },
    { name: 'Gifts & Bonuses', color: '#f59e0b' },
    { name: 'Other Income', color: '#8b5cf6' }
  ]
};

export class FinanceStore {
  static loadData() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.transactions)) {
          parsed.transactions = parsed.transactions.map(t => ({
            ...t,
            paymentMethod: normalizePaymentMethod(t.paymentMethod)
          }));
        }
        return parsed;
      } catch (e) {
        console.error("Error loading stored data, returning default seed:", e);
      }
    }
    return this.generateSeedData();
  }

  static saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  static generateSeedData() {
    const formatDate = (daysAgo) => {
      const d = new Date();
      d.setDate(d.getDate() - daysAgo);
      return d.toISOString().split('T')[0];
    };

    const initialTransactions = [
      { id: 'tx_1', type: 'income', amount: 4800, category: 'Salary & Wages', date: formatDate(14), description: 'Monthly Tech Lead Salary', paymentMethod: 'Bank Account', tags: ['Salary', 'Primary'] },
      { id: 'tx_2', type: 'expense', amount: 1450, category: 'Housing & Rent', date: formatDate(12), description: 'Downtown Apartment Rent', paymentMethod: 'Bank Account', tags: ['Housing', 'Fixed'] },
      { id: 'tx_3', type: 'expense', amount: 240, category: 'Groceries & Dining', date: formatDate(10), description: 'Trader Joe & Whole Foods Groceries', paymentMethod: 'Cash', tags: ['Food'] },
      { id: 'tx_4', type: 'income', amount: 950, category: 'Freelance & Projects', date: formatDate(8), description: 'UI/UX Design Consulting Client', paymentMethod: 'Bank Account', tags: ['Side-Hustle'] },
      { id: 'tx_5', type: 'expense', amount: 75, category: 'Utilities & Bills', date: formatDate(6), description: 'Gigabit Fiber Broadband', paymentMethod: 'Bank Account', tags: ['Bills'] },
      { id: 'tx_6', type: 'expense', amount: 17.99, category: 'Entertainment & Subs', date: formatDate(5), description: 'Netflix Ultra HD Subscription', paymentMethod: 'Bank Account', tags: ['Subscription'] },
      { id: 'tx_7', type: 'expense', amount: 90, category: 'Transport & Fuel', date: formatDate(4), description: 'Shell Station Premium Fuel', paymentMethod: 'Cash', tags: ['Car'] },
      { id: 'tx_8', type: 'expense', amount: 135, category: 'Shopping & Clothes', date: formatDate(3), description: 'Nike Athletic Wear', paymentMethod: 'Bank Account', tags: ['Fitness'] },
      { id: 'tx_9', type: 'expense', amount: 110, category: 'Groceries & Dining', date: formatDate(2), description: 'Weekend Restaurant Dinner', paymentMethod: 'Cash', tags: ['Dining'] },
      { id: 'tx_10', type: 'expense', amount: 50, category: 'Health & Medical', date: formatDate(1), description: 'Pharmacy Supplies', paymentMethod: 'Cash', tags: ['Health'] }
    ];

    const initialBudgets = [
      { category: 'Groceries & Dining', limit: 650 },
      { category: 'Housing & Rent', limit: 1500 },
      { category: 'Transport & Fuel', limit: 250 },
      { category: 'Entertainment & Subs', limit: 150 },
      { category: 'Shopping & Clothes', limit: 200 },
      { category: 'Utilities & Bills', limit: 200 }
    ];

    const initialRecurring = [
      { id: 'rec_1', type: 'income', amount: 4800, category: 'Salary & Wages', description: 'Monthly Tech Lead Salary', frequency: 'monthly', lastProcessed: formatDate(14) },
      { id: 'rec_2', type: 'expense', amount: 1450, category: 'Housing & Rent', description: 'Downtown Apartment Rent', frequency: 'monthly', lastProcessed: formatDate(12) },
      { id: 'rec_3', type: 'expense', amount: 17.99, category: 'Entertainment & Subs', description: 'Netflix Ultra HD Subscription', frequency: 'monthly', lastProcessed: formatDate(5) }
    ];

    const seed = {
      transactions: initialTransactions,
      budgets: initialBudgets,
      recurring: initialRecurring,
      settings: {
        currency: '₹',
        theme: 'dark'
      }
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }

  static getMetrics(transactions) {
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const balance = income - expenses;
    const savingsRate = income > 0 ? ((balance / income) * 100).toFixed(1) : '0';

    return { income, expenses, balance, savingsRate };
  }

  static getAccountMetrics(transactions) {
    const bankTxs = transactions.filter(t => normalizePaymentMethod(t.paymentMethod) === 'Bank Account');
    const cashTxs = transactions.filter(t => normalizePaymentMethod(t.paymentMethod) === 'Cash');

    const calc = (txList) => {
      const income = txList.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const expense = txList.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      return { income, expense, balance: income - expense, count: txList.length };
    };

    return {
      bank: calc(bankTxs),
      cash: calc(cashTxs)
    };
  }

  static getCategoryBreakdown(transactions, type = 'expense') {
    const filtered = transactions.filter(t => t.type === type);
    const map = {};
    filtered.forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });

    return Object.keys(map).map(category => ({
      category,
      amount: map[category]
    })).sort((a, b) => b.amount - a.amount);
  }

  static getBudgetsWithProgress(budgets, transactions) {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const categorySpending = {};

    transactions
      .filter(t => t.type === 'expense' && t.date.startsWith(currentMonth))
      .forEach(t => {
        categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
      });

    return budgets.map(b => {
      const spent = categorySpending[b.category] || 0;
      const percentage = Math.min(Math.round((spent / b.limit) * 100), 100);
      let status = 'normal';
      if (spent >= b.limit) status = 'exceeded';
      else if (percentage >= 80) status = 'warning';

      return {
        category: b.category,
        limit: b.limit,
        spent,
        remaining: Math.max(0, b.limit - spent),
        percentage,
        status
      };
    });
  }
}
