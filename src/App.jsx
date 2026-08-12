import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { FinanceStore } from './utils/store';
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
        />

        <div className="content-body">
          <MetricCards transactions={appData.transactions} />

          {currentView === 'dashboard' && (
            <DashboardView
              transactions={appData.transactions}
              theme={theme}
              onSwitchView={setCurrentView}
            />
          )}

          {currentView === 'transactions' && (
            <TransactionsView
              transactions={appData.transactions}
              onDeleteTx={handleDeleteTx}
            />
          )}

          {currentView === 'budgets' && (
            <BudgetsView
              budgets={appData.budgets}
              transactions={appData.transactions}
              onOpenAddBudget={() => setIsAddBudgetOpen(true)}
            />
          )}

          {currentView === 'recurring' && (
            <RecurringView
              recurring={appData.recurring || []}
              onDeleteRec={handleDeleteRec}
              onOpenAddRec={() => setIsAddRecOpen(true)}
            />
          )}

          {currentView === 'reports' && (
            <AnalyticsView
              transactions={appData.transactions}
              theme={theme}
            />
          )}

          {currentView === 'settings' && (
            <SettingsView
              appData={appData}
              setAppData={saveState}
              showToast={showToast}
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
      />

      <AddBudgetModal
        isOpen={isAddBudgetOpen}
        onClose={() => setIsAddBudgetOpen(false)}
        onSave={handleSaveBudget}
      />

      <AddRecurringModal
        isOpen={isAddRecOpen}
        onClose={() => setIsAddRecOpen(false)}
        onSave={handleAddRec}
      />

      <Toast toasts={toasts} />
    </div>
  );
}
