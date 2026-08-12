/* ==========================================================================
   EXPENSE & INCOME TRACKER - MAIN APPLICATION CONTROLLER
   ========================================================================== */

import { FinanceStore, DEFAULT_CATEGORIES } from './store.js';
import { FinanceCharts } from './charts.js';
import { exportToCSV, exportToJSON, importFromJSON } from './export.js';

class AppController {
  constructor() {
    this.store = new FinanceStore();
    this.charts = new FinanceCharts();
    this.currentView = 'dashboard';
    this.filterState = {
      query: '',
      type: 'all',
      category: 'all',
      startDate: '',
      endDate: ''
    };

    this.init();
  }

  init() {
    this.setupTheme();
    this.bindNavigation();
    this.bindEvents();
    this.populateCategoryOptions();
    this.render();
  }

  // --- Theme Management ---
  setupTheme() {
    const savedTheme = this.store.data.settings?.theme || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    this.updateThemeIcon(savedTheme);
  }

  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    this.store.data.settings.theme = next;
    this.store.save();
    this.updateThemeIcon(next);
    // Re-render charts to update text contrast colors
    this.renderCharts();
  }

  updateThemeIcon(theme) {
    const icon = document.getElementById('theme-toggle-icon');
    if (icon) {
      icon.setAttribute('data-lucide', theme === 'light' ? 'moon' : 'sun');
      lucide.createIcons();
    }
  }

  // --- Navigation & View Switching ---
  bindNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const view = item.getAttribute('data-view');
        this.switchView(view);
      });
    });
  }

  switchView(viewName) {
    this.currentView = viewName;

    // Update nav active styling
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.getAttribute('data-view') === viewName);
    });

    // Update view containers
    document.querySelectorAll('.page-view').forEach(view => {
      view.classList.toggle('active', view.id === `view-${viewName}`);
    });

    // Update top header title
    const headerTitle = document.getElementById('page-title');
    const headerSubtitle = document.getElementById('page-subtitle');
    const titles = {
      dashboard: { title: 'Dashboard Overview', subtitle: 'Track your personal balance, income, expenses, and cash flow' },
      transactions: { title: 'Transaction History', subtitle: 'Manage, search, and filter all income and expense records' },
      budgets: { title: 'Category Budgets', subtitle: 'Set spending caps per category and track your limit progress' },
      recurring: { title: 'Recurring Payments', subtitle: 'Automate tracking for salary, rent, and monthly subscriptions' },
      reports: { title: 'Financial Reports', subtitle: 'Deep dive into expense category breakdowns and visual analytics' },
      settings: { title: 'Data & Settings', subtitle: 'Export CSV spreadsheets, backup data, or restore from JSON' }
    };

    if (titles[viewName]) {
      headerTitle.textContent = titles[viewName].title;
      headerSubtitle.textContent = titles[viewName].subtitle;
    }

    this.render();
  }

  // --- Dynamic Rendering Routing ---
  render() {
    this.renderMetrics();

    switch (this.currentView) {
      case 'dashboard':
        this.renderDashboard();
        break;
      case 'transactions':
        this.renderTransactionsTable();
        break;
      case 'budgets':
        this.renderBudgetsView();
        break;
      case 'recurring':
        this.renderRecurringView();
        break;
      case 'reports':
        this.renderReportsView();
        break;
      case 'settings':
        // Settings view is static HTML with event listeners
        break;
    }

    // Refresh icons
    lucide.createIcons();
  }

  // Render Top Metric Cards
  renderMetrics() {
    const m = this.store.getMetrics();
    
    document.getElementById('metric-balance').textContent = `$${m.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    document.getElementById('metric-income').textContent = `$${m.income.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    document.getElementById('metric-expense').textContent = `$${m.expenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    document.getElementById('metric-savings').textContent = `${m.savingsRate}%`;
  }

  // Render Dashboard View
  renderDashboard() {
    this.renderRecentTransactions();
    this.renderCharts();
  }

  // Render Dashboard Charts
  renderCharts() {
    const expenseBreakdown = this.store.getCategoryBreakdown('expense');
    const allTransactions = this.store.getTransactions();

    this.charts.renderCategoryChart('chart-category-donut', expenseBreakdown);
    this.charts.renderCashFlowChart('chart-cashflow-bar', allTransactions);
  }

  // Render Recent Transactions (Dashboard Widget)
  renderRecentTransactions() {
    const tbody = document.getElementById('recent-tx-tbody');
    if (!tbody) return;

    const recent = this.store.getTransactions().slice(0, 5);

    if (recent.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No transactions recorded yet.</td></tr>`;
      return;
    }

    tbody.innerHTML = recent.map(t => `
      <tr>
        <td>${t.date}</td>
        <td><strong>${t.description || 'Transaction'}</strong></td>
        <td><span class="category-tag">${t.category}</span></td>
        <td>${t.paymentMethod || 'Cash'}</td>
        <td class="${t.type === 'income' ? 'amount-income' : 'amount-expense'}">
          ${t.type === 'income' ? '+' : '-'}$${t.amount.toFixed(2)}
        </td>
      </tr>
    `).join('');
  }

  // Render Full Transactions Table View
  renderTransactionsTable() {
    const tbody = document.getElementById('full-tx-tbody');
    if (!tbody) return;

    const list = this.store.getTransactions(this.filterState);

    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 32px; color: var(--text-muted);">No matching transactions found.</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map(t => `
      <tr>
        <td>${t.date}</td>
        <td>
          <strong>${t.description || 'No description'}</strong>
          ${t.tags && t.tags.length ? `<br><small style="color: var(--text-muted);">${t.tags.map(tag => `#${tag}`).join(' ')}</small>` : ''}
        </td>
        <td><span class="category-tag">${t.category}</span></td>
        <td>${t.paymentMethod || 'Cash'}</td>
        <td class="${t.type === 'income' ? 'amount-income' : 'amount-expense'}">
          ${t.type === 'income' ? '+' : '-'}$${t.amount.toFixed(2)}
        </td>
        <td>
          <button class="btn btn-secondary btn-sm delete-tx-btn" data-id="${t.id}">
            <i data-lucide="trash-2"></i>
          </button>
        </td>
      </tr>
    `).join('');

    // Bind delete buttons
    tbody.querySelectorAll('.delete-tx-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        this.store.deleteTransaction(id);
        this.showToast('Transaction deleted');
        this.render();
      });
    });
  }

  // Render Category Budgets View
  renderBudgetsView() {
    const container = document.getElementById('budgets-grid-container');
    if (!container) return;

    const budgets = this.store.getBudgets();

    if (budgets.length === 0) {
      container.innerHTML = `<p style="color: var(--text-muted);">No budgets configured yet. Click "Add Category Budget" to set limits.</p>`;
      return;
    }

    container.innerHTML = budgets.map(b => `
      <div class="budget-card">
        <div class="budget-card-header">
          <h3>${b.category}</h3>
          <span class="trend-badge ${b.status === 'exceeded' ? 'negative' : (b.status === 'warning' ? 'warning' : 'positive')}">
            ${b.percentage}% Spent
          </span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 0.9rem;">
          <span style="color: var(--text-muted);">Spent: <strong>$${b.spent.toFixed(2)}</strong></span>
          <span style="color: var(--text-muted);">Limit: <strong>$${b.limit.toFixed(2)}</strong></span>
        </div>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill ${b.status}" style="width: ${b.percentage}%;"></div>
        </div>
        <div style="font-size: 0.8rem; color: var(--text-muted);">
          ${b.status === 'exceeded' ? `<span style="color: var(--accent-expense);">⚠️ Exceeded limit by $${(b.spent - b.limit).toFixed(2)}</span>` : `Remaining budget: $${b.remaining.toFixed(2)}`}
        </div>
      </div>
    `).join('');
  }

  // Render Recurring View
  renderRecurringView() {
    const tbody = document.getElementById('recurring-tbody');
    if (!tbody) return;

    const recurring = this.store.getRecurring();

    if (recurring.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">No recurring transactions configured.</td></tr>`;
      return;
    }

    tbody.innerHTML = recurring.map(r => `
      <tr>
        <td><strong>${r.description}</strong></td>
        <td><span class="category-tag">${r.category}</span></td>
        <td class="${r.type === 'income' ? 'amount-income' : 'amount-expense'}">${r.type === 'income' ? '+' : '-'}$${r.amount.toFixed(2)}</td>
        <td style="text-transform: capitalize;">${r.frequency}</td>
        <td>${r.lastProcessed || 'N/A'}</td>
        <td>
          <button class="btn btn-secondary btn-sm delete-rec-btn" data-id="${r.id}">
            <i data-lucide="trash-2"></i>
          </button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.delete-rec-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.store.deleteRecurring(btn.getAttribute('data-id'));
        this.showToast('Recurring rule deleted');
        this.render();
      });
    });
  }

  // Render Reports View
  renderReportsView() {
    const expenseBreakdown = this.store.getCategoryBreakdown('expense');
    this.charts.renderCategoryChart('report-category-donut', expenseBreakdown);

    const reportTable = document.getElementById('report-category-tbody');
    if (reportTable) {
      const totalExpense = expenseBreakdown.reduce((sum, i) => sum + i.amount, 0);
      reportTable.innerHTML = expenseBreakdown.map(item => `
        <tr>
          <td><strong>${item.category}</strong></td>
          <td>$${item.amount.toFixed(2)}</td>
          <td>${totalExpense > 0 ? ((item.amount / totalExpense) * 100).toFixed(1) : 0}%</td>
        </tr>
      `).join('');
    }
  }

  // Populate Dropdown Select Options for Categories
  populateCategoryOptions() {
    const select = document.getElementById('modal-tx-category');
    const filterSelect = document.getElementById('filter-category');
    const budgetSelect = document.getElementById('modal-budget-category');
    const recSelect = document.getElementById('modal-rec-category');

    const allCategories = [
      ...DEFAULT_CATEGORIES.expense.map(c => c.name),
      ...DEFAULT_CATEGORIES.income.map(c => c.name)
    ];

    if (select) {
      select.innerHTML = allCategories.map(c => `<option value="${c}">${c}</option>`).join('');
    }
    if (recSelect) {
      recSelect.innerHTML = allCategories.map(c => `<option value="${c}">${c}</option>`).join('');
    }
    if (budgetSelect) {
      budgetSelect.innerHTML = DEFAULT_CATEGORIES.expense.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
    }
    if (filterSelect) {
      filterSelect.innerHTML = `<option value="all">All Categories</option>` + allCategories.map(c => `<option value="${c}">${c}</option>`).join('');
    }
  }

  // Bind All Event Handlers
  bindEvents() {
    // Theme toggle
    document.getElementById('theme-toggle-btn').addEventListener('click', () => this.toggleTheme());

    // Filter controls
    document.getElementById('filter-search')?.addEventListener('input', (e) => {
      this.filterState.query = e.target.value;
      this.renderTransactionsTable();
    });

    document.getElementById('filter-type')?.addEventListener('change', (e) => {
      this.filterState.type = e.target.value;
      this.renderTransactionsTable();
    });

    document.getElementById('filter-category')?.addEventListener('change', (e) => {
      this.filterState.category = e.target.value;
      this.renderTransactionsTable();
    });

    // Add Transaction Modal
    document.getElementById('btn-add-tx')?.addEventListener('click', () => this.openModal('modal-transaction'));
    document.getElementById('form-add-tx')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      this.store.addTransaction({
        type: formData.get('type'),
        amount: formData.get('amount'),
        category: formData.get('category'),
        date: formData.get('date'),
        description: formData.get('description'),
        paymentMethod: formData.get('paymentMethod'),
        tags: formData.get('tags')
      });
      this.closeModal('modal-transaction');
      e.target.reset();
      this.showToast('Transaction added successfully!');
      this.render();
    });

    // Add Budget Modal
    document.getElementById('btn-add-budget')?.addEventListener('click', () => this.openModal('modal-budget'));
    document.getElementById('form-add-budget')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const cat = document.getElementById('modal-budget-category').value;
      const limit = document.getElementById('modal-budget-limit').value;
      this.store.setBudget(cat, limit);
      this.closeModal('modal-budget');
      this.showToast('Budget limit saved!');
      this.render();
    });

    // Add Recurring Modal
    document.getElementById('btn-add-rec')?.addEventListener('click', () => this.openModal('modal-recurring'));
    document.getElementById('form-add-rec')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      this.store.addRecurring({
        type: formData.get('type'),
        amount: formData.get('amount'),
        category: formData.get('category'),
        description: formData.get('description'),
        frequency: formData.get('frequency')
      });
      this.closeModal('modal-recurring');
      this.showToast('Recurring payment created!');
      this.render();
    });

    // Modal Close Buttons
    document.querySelectorAll('.modal-close-btn, .btn-cancel-modal').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal-overlay');
        if (modal) modal.classList.remove('active');
      });
    });

    // Data Export & Import Handlers
    document.getElementById('btn-export-csv')?.addEventListener('click', () => {
      exportToCSV(this.store.getTransactions());
      this.showToast('CSV report downloaded!');
    });

    document.getElementById('btn-export-json')?.addEventListener('click', () => {
      exportToJSON(this.store);
      this.showToast('JSON database backup saved!');
    });

    document.getElementById('btn-import-json')?.addEventListener('click', () => {
      document.getElementById('input-import-file').click();
    });

    document.getElementById('input-import-file')?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        importFromJSON(file, this.store, (success, msg) => {
          this.showToast(msg);
          if (success) this.render();
        });
      }
    });

    document.getElementById('btn-reset-data')?.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset all data back to default demo records?')) {
        this.store.resetAllData();
        this.showToast('Data reset to defaults.');
        this.render();
      }
    });
  }

  // --- Modal & Toast Utilities ---
  openModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
      modal.classList.add('active');
      // Set default date input to today
      const dateInput = modal.querySelector('input[type="date"]');
      if (dateInput && !dateInput.value) {
        dateInput.value = new Date().toISOString().split('T')[0];
      }
    }
  }

  closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('active');
  }

  showToast(msg) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i data-lucide="check-circle" style="color: var(--accent-income);"></i> <span>${msg}</span>`;
    container.appendChild(toast);
    lucide.createIcons();

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}

// Instantiate on DOM Loaded
document.addEventListener('DOMContentLoaded', () => {
  window.app = new AppController();
});
