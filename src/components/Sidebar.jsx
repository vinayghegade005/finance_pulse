import React from 'react';
import { 
  Wallet, 
  LayoutDashboard, 
  Receipt, 
  PiggyBank, 
  Repeat, 
  PieChart, 
  Settings, 
  Sun, 
  Moon 
} from 'lucide-react';

export default function Sidebar({ currentView, setCurrentView, theme, toggleTheme }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'budgets', label: 'Budgets', icon: PiggyBank },
    { id: 'recurring', label: 'Recurring', icon: Repeat },
    { id: 'reports', label: 'Analytics', icon: PieChart },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside class="sidebar">
      <div className="brand">
        <div className="brand-icon">
          <Wallet size={22} />
        </div>
        <span className="brand-title">FinancePulse</span>
      </div>

      <nav className="nav-menu">
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`nav-item ${currentView === item.id ? 'active' : ''}`}
              onClick={() => setCurrentView(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="avatar">VP</div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Personal Vault</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Offline Storage</div>
          </div>
        </div>
        <button className="theme-toggle-btn" onClick={toggleTheme} title="Toggle Dark/Light Theme">
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>
    </aside>
  );
}
