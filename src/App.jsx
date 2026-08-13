import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { FinanceStore } from './utils/store';
import { normalizePaymentMethod } from './utils/formatters';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MetricCards from './components/MetricCards';
import DashboardView from './components/DashboardView';
import TransactionsView from './components/TransactionsView';
import BudgetsView from './components/BudgetsView';
import RecurringView from './components/RecurringView';
import AnalyticsView from './components/AnalyticsView';
import SettingsView from './components/SettingsView';
import AddTransactionModal from './components/AddTransactionModal';
import AddBudgetModal from './components/AddBudgetModal';
import AddRecurringModal from './components/AddRecurringModal';
import Toast from './components/Toast';

export default function App() {
  const [appData, setAppData] = useState(() => FinanceStore.loadData());
  const [currentView, setCurrentView] = useState('dashboard');
  const [theme, setTheme] = useState(() => appData.settings?.theme || 'dark');
  const currency = appData.settings?.currency || '₹';
  const [dashboardAccountFilter, setDashboardAccountFilter] = useState('all'); // 'all', 'bank', 'cash'

  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [isAddBudgetOpen, setIsAddBudgetOpen] = useState(false);
  const [isAddRecOpen, setIsAddRecOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const saveState = (newData) => {
    setAppData(newData);
    FinanceStore.saveData(newData);
  };

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    const updated = { ...appData, settings: { ...appData.settings, theme: next } };
    saveState(updated);
  };

  const handleCurrencyChange = (newCurrency) => {
    const updated = {
      ...appData,
      settings: {
        ...(appData.settings || {}),
        currency: newCurrency
      }
    };
    saveState(updated);
    showToast(`Currency changed to ${newCurrency}`);
  };

  const showToast = (message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  // CRUD Actions
  const handleAddTx = (newTx) => {
    const updatedTxs = [newTx, ...appData.transactions];
    const updated = { ...appData, transactions: updatedTxs };
    saveState(updated);
    showToast('Transaction recorded successfully!');
  };

  const handleDeleteTx = (id) => {
    const updatedTxs = appData.transactions.filter(t => t.id !== id);
    const updated = { ...appData, transactions: updatedTxs };
    saveState(updated);
    showToast('Transaction deleted');
  };

  const handleSaveBudget = (category, limit) => {
    const existingIndex = appData.budgets.findIndex(b => b.category === category);
    let updatedBudgets = [...appData.budgets];
    if (existingIndex >= 0) {
      updatedBudgets[existingIndex] = { category, limit };
    } else {
      updatedBudgets.push({ category, limit });
    }
    saveState({ ...appData, budgets: updatedBudgets });
    showToast('Budget cap saved!');
  };

  const handleAddRec = (newRec) => {
    const updatedRec = [...(appData.recurring || []), newRec];
    saveState({ ...appData, recurring: updatedRec });
    showToast('Recurring rule created!');
  };

  const handleDeleteRec = (id) => {
    const updatedRec = (appData.recurring || []).filter(r => r.id !== id);
    saveState({ ...appData, recurring: updatedRec });
    showToast('Recurring rule removed');
  };

  const handleAddCustomCategory = (type, categoryName) => {
    const disabled = appData.disabledCategories || { expense: [], income: [] };
    const disabledList = disabled[type] || [];
    let updatedDisabled = disabled;

    if (disabledList.includes(categoryName)) {
      updatedDisabled = {
        ...disabled,
        [type]: disabledList.filter(c => c !== categoryName)
      };
    }

    const existingCustom = appData.customCategories || { expense: [], income: [] };
    const currentList = existingCustom[type] || [];
    let updatedCustom = existingCustom;

    if (!currentList.includes(categoryName)) {
      updatedCustom = {
        ...existingCustom,
        [type]: [...currentList, categoryName]
      };
    }

    saveState({
      ...appData,
      customCategories: updatedCustom,
      disabledCategories: updatedDisabled
    });
    showToast(`Added ${type} category: ${categoryName}`);
  };

  const handleDeleteCategory = (type, categoryName) => {
    const existingCustom = appData.customCategories || { expense: [], income: [] };
    const customList = existingCustom[type] || [];
    let updatedCustom = existingCustom;
    let updatedDisabled = appData.disabledCategories || { expense: [], income: [] };

    if (customList.includes(categoryName)) {
      updatedCustom = {
        ...existingCustom,
        [type]: customList.filter(c => c !== categoryName)
      };
    } else {
      const disabledList = updatedDisabled[type] || [];
      if (!disabledList.includes(categoryName)) {
        updatedDisabled = {
          ...updatedDisabled,
          [type]: [...disabledList, categoryName]
        };
      }
    }

    saveState({
      ...appData,
      customCategories: updatedCustom,
      disabledCategories: updatedDisabled
    });
    showToast(`Removed ${type} category: ${categoryName}`);
  };

  // Compute dashboard transactions filtered by account selection (all, bank, cash)
  const dashboardTransactions = appData.transactions.filter(t => {
    const method = normalizePaymentMethod(t.paymentMethod);
    if (dashboardAccountFilter === 'bank') return method === 'Bank Account';
    if (dashboardAccountFilter === 'cash') return method === 'Cash';
    return true;
  });

  return (
    <div className="app-container">
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      <main className="main-wrapper">
        <Header
          currentView={currentView}
          currency={currency}
          onCurrencyChange={handleCurrencyChange}
        />

        <div className="content-body">
          {currentView !== 'settings' && (
            <MetricCards
              transactions={currentView === 'dashboard' ? dashboardTransactions : appData.transactions}
              currency={currency}
              accountFilter={dashboardAccountFilter}
              onAccountFilterChange={currentView === 'dashboard' ? setDashboardAccountFilter : null}
            />
          )}

          {currentView === 'dashboard' && (
            <DashboardView
              transactions={dashboardTransactions}
              theme={theme}
              currency={currency}
              onSwitchView={setCurrentView}
            />
          )}

          {currentView === 'transactions' && (
            <TransactionsView
              transactions={appData.transactions}
              currency={currency}
              customCategories={appData.customCategories}
              onDeleteTx={handleDeleteTx}
            />
          )}

          {currentView === 'budgets' && (
            <BudgetsView
              budgets={appData.budgets}
              transactions={appData.transactions}
              currency={currency}
              onOpenAddBudget={() => setIsAddBudgetOpen(true)}
            />
          )}

          {currentView === 'recurring' && (
            <RecurringView
              recurring={appData.recurring || []}
              currency={currency}
              onDeleteRec={handleDeleteRec}
              onOpenAddRec={() => setIsAddRecOpen(true)}
            />
          )}

          {currentView === 'reports' && (
            <AnalyticsView
              transactions={appData.transactions}
              theme={theme}
              currency={currency}
            />
          )}

          {currentView === 'settings' && (
            <SettingsView
              appData={appData}
              saveState={saveState}
              showToast={showToast}
              theme={theme}
              toggleTheme={toggleTheme}
              onAddCategory={handleAddCustomCategory}
              onDeleteCategory={handleDeleteCategory}
            />
          )}
        </div>
      </main>

      {/* Floating Bottom Add Transaction Button */}
      <button
        className="btn btn-primary fab-add-btn"
        onClick={() => setIsAddTxOpen(true)}
        title="Add New Transaction"
      >
        <Plus size={20} />
        <span>Add Transaction</span>
      </button>

      {/* Modals & Toasts */}
      <AddTransactionModal
        isOpen={isAddTxOpen}
        onClose={() => setIsAddTxOpen(false)}
        onSave={handleAddTx}
        currency={currency}
        customCategories={appData.customCategories}
        disabledCategories={appData.disabledCategories}
        onAddCustomCategory={handleAddCustomCategory}
        onDeleteCustomCategory={handleDeleteCategory}
      />

      <AddBudgetModal
        isOpen={isAddBudgetOpen}
        onClose={() => setIsAddBudgetOpen(false)}
        onSave={handleSaveBudget}
        currency={currency}
      />

      <AddRecurringModal
        isOpen={isAddRecOpen}
        onClose={() => setIsAddRecOpen(false)}
        onSave={handleAddRec}
        currency={currency}
      />

      <Toast toasts={toasts} />
    </div>
  );
}
