/* ==========================================================================
   FINANCEPULSE - DATA STORE & LOCAL STORAGE MANAGER
   ========================================================================== */

const STORAGE_KEY = 'finance_pulse_db_v2';

export const DEFAULT_CATEGORIES = {
  expense: [
    { name: 'Housing & Rent', color: '#059669' },
    { name: 'Groceries & Dining', color: '#10b981' },
    { name: 'Transport & Fuel', color: '#14b8a6' },
    { name: 'Utilities & Bills', color: '#047857' },
    { name: 'Entertainment & Subs', color: '#34d399' },
    { name: 'Shopping & Clothes', color: '#0f766e' },
    { name: 'Health & Medical', color: '#f43f5e' },
    { name: 'Other Expenses', color: '#4b5563' }
  ],
  income: [
    { name: 'Salary & Wages', color: '#10b981' },
    { name: 'Freelance & Projects', color: '#34d399' },
    { name: 'Investments & Dividends', color: '#059669' },
    { name: 'Gifts & Bonuses', color: '#14b8a6' },
    { name: 'Other Income', color: '#047857' }
  ]
};

export class FinanceStore {
  static loadData() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
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
      { id: 'tx_1', type: 'income', amount: 4800, category: 'Salary & Wages', date: formatDate(14), description: 'Monthly Tech Lead Salary', paymentMethod: 'Bank Transfer', tags: ['Salary', 'Primary'] },
      { id: 'tx_2', type: 'expense', amount: 1450, category: 'Housing & Rent', date: formatDate(12), description: 'Downtown Apartment Rent', paymentMethod: 'Bank Transfer', tags: ['Housing', 'Fixed'] },
      { id: 'tx_3', type: 'expense', amount: 240, category: 'Groceries & Dining', date: formatDate(10), description: 'Trader Joe & Whole Foods Groceries', paymentMethod: 'Credit Card', tags: ['Food'] },
      { id: 'tx_4', type: 'income', amount: 950, category: 'Freelance & Projects', date: formatDate(8), description: 'UI/UX Design Consulting Client', paymentMethod: 'PayPal', tags: ['Side-Hustle'] },
      { id: 'tx_5', type: 'expense', amount: 75, category: 'Utilities & Bills', date: formatDate(6), description: 'Gigabit Fiber Broadband', paymentMethod: 'Auto-Debit', tags: ['Bills'] },
      { id: 'tx_6', type: 'expense', amount: 17.99, category: 'Entertainment & Subs', date: formatDate(5), description: 'Netflix Ultra HD Subscription', paymentMethod: 'Credit Card', tags: ['Subscription'] },
      { id: 'tx_7', type: 'expense', amount: 90, category: 'Transport & Fuel', date: formatDate(4), description: 'Shell Station Premium Fuel', paymentMethod: 'Debit Card', tags: ['Car'] },
      { id: 'tx_8', type: 'expense', amount: 135, category: 'Shopping & Clothes', date: formatDate(3), description: 'Nike Athletic Wear', paymentMethod: 'Credit Card', tags: ['Fitness'] },
      { id: 'tx_9', type: 'expense', amount: 110, category: 'Groceries & Dining', date: formatDate(2), description: 'Weekend Restaurant Dinner', paymentMethod: 'Credit Card', tags: ['Dining'] },
      { id: 'tx_10', type: 'expense', amount: 50, category: 'Health & Medical', date: formatDate(1), description: 'Pharmacy Supplies', paymentMethod: 'Debit Card', tags: ['Health'] }
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
