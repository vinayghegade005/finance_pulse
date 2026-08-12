/* ==========================================================================
   EXPENSE & INCOME TRACKER - LOCAL DATA STORE & LOGIC MODULE
   ========================================================================== */

const STORAGE_KEY = 'finance_tracker_db_v1';

// Initial Categories Configuration
export const DEFAULT_CATEGORIES = {
  expense: [
    { id: 'cat_housing', name: 'Housing & Rent', icon: 'home', color: '#6366f1' },
    { id: 'cat_food', name: 'Groceries & Dining', icon: 'utensils', color: '#10b981' },
    { id: 'cat_transport', name: 'Transport & Fuel', icon: 'car', color: '#0ea5e9' },
    { id: 'cat_utilities', name: 'Utilities & Bills', icon: 'zap', color: '#f59e0b' },
    { id: 'cat_entertainment', name: 'Entertainment & Subs', icon: 'tv', color: '#ec4899' },
    { id: 'cat_shopping', name: 'Shopping & Clothes', icon: 'shopping-bag', color: '#8b5cf6' },
    { id: 'cat_health', name: 'Health & Medical', icon: 'activity', color: '#f43f5e' },
    { id: 'cat_other_exp', name: 'Other Expenses', icon: 'more-horizontal', color: '#64748b' }
  ],
  income: [
    { id: 'cat_salary', name: 'Salary & Wages', icon: 'briefcase', color: '#10b981' },
    { id: 'cat_freelance', name: 'Freelance & Projects', icon: 'laptop', color: '#0ea5e9' },
    { id: 'cat_investments', name: 'Investments & Dividends', icon: 'trending-up', color: '#6366f1' },
    { id: 'cat_gifts', name: 'Gifts & Bonuses', icon: 'gift', color: '#f59e0b' },
    { id: 'cat_other_inc', name: 'Other Income', icon: 'dollar-sign', color: '#8b5cf6' }
  ]
};

// Data Store Class
export class FinanceStore {
  constructor() {
    this.data = this.loadData();
    this.processRecurring();
  }

  // Load from LocalStorage or initialize default seed data
  loadData() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error("Error parsing stored data, loading default seed data:", e);
      }
    }
    return this.generateInitialSeedData();
  }

  // Save current data state
  save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
  }

  // Generate realistic seed data for fresh start
  generateInitialSeedData() {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    const formatDate = (daysAgo) => {
      const d = new Date();
      d.setDate(d.getDate() - daysAgo);
      return d.toISOString().split('T')[0];
    };

    const initialTransactions = [
      { id: 'tx_1', type: 'income', amount: 4500, category: 'Salary & Wages', date: formatDate(12), description: 'Monthly Tech Salary', paymentMethod: 'Bank Transfer', tags: ['Salary'] },
      { id: 'tx_2', type: 'expense', amount: 1400, category: 'Housing & Rent', date: formatDate(10), description: 'Apartment Rent Payment', paymentMethod: 'Bank Transfer', tags: ['Housing', 'Fixed'] },
      { id: 'tx_3', type: 'expense', amount: 230, category: 'Groceries & Dining', date: formatDate(8), description: 'Whole Foods Grocery Run', paymentMethod: 'Credit Card', tags: ['Food'] },
      { id: 'tx_4', type: 'income', amount: 850, category: 'Freelance & Projects', date: formatDate(7), description: 'Web Development Client Work', paymentMethod: 'PayPal', tags: ['Side-Hustle'] },
      { id: 'tx_5', type: 'expense', amount: 65, category: 'Utilities & Bills', date: formatDate(6), description: 'High-speed Fiber Internet', paymentMethod: 'Auto-Debit', tags: ['Bills'] },
      { id: 'tx_6', type: 'expense', amount: 15.99, category: 'Entertainment & Subs', date: formatDate(5), description: 'Netflix Premium Subscription', paymentMethod: 'Credit Card', tags: ['Subscription'] },
      { id: 'tx_7', type: 'expense', amount: 85, category: 'Transport & Fuel', date: formatDate(4), description: 'Gas Station Fuel Fill', paymentMethod: 'Debit Card', tags: ['Car'] },
      { id: 'tx_8', type: 'expense', amount: 120, category: 'Shopping & Clothes', date: formatDate(3), description: 'New Running Shoes', paymentMethod: 'Credit Card', tags: ['Fitness'] },
      { id: 'tx_9', type: 'expense', amount: 95, category: 'Groceries & Dining', date: formatDate(2), description: 'Dinner with Friends', paymentMethod: 'Credit Card', tags: ['Dining'] },
      { id: 'tx_10', type: 'expense', amount: 45, category: 'Health & Medical', date: formatDate(1), description: 'Pharmacy Prescription', paymentMethod: 'Debit Card', tags: ['Health'] }
    ];

    const initialBudgets = [
      { category: 'Groceries & Dining', limit: 600 },
      { category: 'Housing & Rent', limit: 1500 },
      { category: 'Transport & Fuel', limit: 250 },
      { category: 'Entertainment & Subs', limit: 150 },
      { category: 'Shopping & Clothes', limit: 200 },
      { category: 'Utilities & Bills', limit: 200 }
    ];

    const initialRecurring = [
      { id: 'rec_1', type: 'income', amount: 4500, category: 'Salary & Wages', description: 'Monthly Salary', frequency: 'monthly', lastProcessed: formatDate(12) },
      { id: 'rec_2', type: 'expense', amount: 1400, category: 'Housing & Rent', description: 'Apartment Rent', frequency: 'monthly', lastProcessed: formatDate(10) },
      { id: 'rec_3', type: 'expense', amount: 15.99, category: 'Entertainment & Subs', description: 'Netflix Subscription', frequency: 'monthly', lastProcessed: formatDate(5) }
    ];

    const seed = {
      transactions: initialTransactions,
      budgets: initialBudgets,
      recurring: initialRecurring,
      settings: {
        currency: '$',
        theme: 'dark'
      }
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }

  // --- Transactions API ---
  getTransactions(filter = {}) {
    let list = [...this.data.transactions];

    if (filter.type && filter.type !== 'all') {
      list = list.filter(t => t.type === filter.type);
    }
    if (filter.category && filter.category !== 'all') {
      list = list.filter(t => t.category === filter.category);
    }
    if (filter.startDate) {
      list = list.filter(t => t.date >= filter.startDate);
    }
    if (filter.endDate) {
      list = list.filter(t => t.date <= filter.endDate);
    }
    if (filter.query) {
      const q = filter.query.toLowerCase();
      list = list.filter(t => 
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        (t.tags && t.tags.some(tag => tag.toLowerCase().includes(q)))
      );
    }

    // Sort by date descending
    return list.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  addTransaction(tx) {
    const newTx = {
      id: 'tx_' + Date.now(),
      type: tx.type || 'expense',
      amount: parseFloat(tx.amount) || 0,
      category: tx.category || 'Other Expenses',
      date: tx.date || new Date().toISOString().split('T')[0],
      description: tx.description || '',
      paymentMethod: tx.paymentMethod || 'Cash',
      tags: tx.tags ? (Array.isArray(tx.tags) ? tx.tags : tx.tags.split(',').map(s => s.trim())) : []
    };
    this.data.transactions.unshift(newTx);
    this.save();
    return newTx;
  }

  deleteTransaction(id) {
    this.data.transactions = this.data.transactions.filter(t => t.id !== id);
    this.save();
  }

  // --- Summary Metrics API ---
  getMetrics(monthYearStr = null) {
    let txs = this.data.transactions;
    if (monthYearStr) {
      txs = txs.filter(t => t.date.startsWith(monthYearStr));
    }

    const income = txs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = txs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const balance = income - expenses;
    const savingsRate = income > 0 ? ((balance / income) * 100).toFixed(1) : 0;

    return {
      income,
      expenses,
      balance,
      savingsRate
    };
  }

  // --- Category Breakdown API ---
  getCategoryBreakdown(type = 'expense', monthYearStr = null) {
    let txs = this.data.transactions.filter(t => t.type === type);
    if (monthYearStr) {
      txs = txs.filter(t => t.date.startsWith(monthYearStr));
    }

    const breakdown = {};
    txs.forEach(t => {
      breakdown[t.category] = (breakdown[t.category] || 0) + t.amount;
    });

    return Object.keys(breakdown).map(category => ({
      category,
      amount: breakdown[category]
    })).sort((a, b) => b.amount - a.amount);
  }

  // --- Budgets API ---
  getBudgets() {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const categorySpending = {};

    this.data.transactions
      .filter(t => t.type === 'expense' && t.date.startsWith(currentMonth))
      .forEach(t => {
        categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
      });

    return this.data.budgets.map(b => {
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

  setBudget(category, limit) {
    const existingIndex = this.data.budgets.findIndex(b => b.category === category);
    if (existingIndex >= 0) {
      this.data.budgets[existingIndex].limit = parseFloat(limit);
    } else {
      this.data.budgets.push({ category, limit: parseFloat(limit) });
    }
    this.save();
  }

  // --- Recurring Transactions API ---
  getRecurring() {
    return this.data.recurring || [];
  }

  addRecurring(rec) {
    const newRec = {
      id: 'rec_' + Date.now(),
      type: rec.type,
      amount: parseFloat(rec.amount),
      category: rec.category,
      description: rec.description,
      frequency: rec.frequency || 'monthly',
      lastProcessed: rec.lastProcessed || new Date().toISOString().split('T')[0]
    };
    if (!this.data.recurring) this.data.recurring = [];
    this.data.recurring.push(newRec);
    this.save();
    return newRec;
  }

  deleteRecurring(id) {
    this.data.recurring = (this.data.recurring || []).filter(r => r.id !== id);
    this.save();
  }

  processRecurring() {
    if (!this.data.recurring || this.data.recurring.length === 0) return;
    const today = new Date().toISOString().split('T')[0];

    this.data.recurring.forEach(rec => {
      const last = new Date(rec.lastProcessed);
      const now = new Date(today);
      const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24));

      if (rec.frequency === 'monthly' && diffDays >= 30) {
        this.addTransaction({
          type: rec.type,
          amount: rec.amount,
          category: rec.category,
          date: today,
          description: rec.description + ' (Recurring Auto)',
          paymentMethod: 'Auto-Debit'
        });
        rec.lastProcessed = today;
      }
    });
    this.save();
  }

  // --- Data Management API ---
  resetAllData() {
    localStorage.removeItem(STORAGE_KEY);
    this.data = this.generateInitialSeedData();
  }

  restoreJSON(jsonObj) {
    if (jsonObj && Array.isArray(jsonObj.transactions)) {
      this.data = jsonObj;
      this.save();
      return true;
    }
    return false;
  }
}
