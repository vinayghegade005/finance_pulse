import React from 'react';
import { Globe } from 'lucide-react';
import { CURRENCIES } from '../utils/store';

export default function Header({ currentView, currency, onCurrencyChange }) {
  const titles = {
    dashboard: { title: 'Dashboard Overview', subtitle: 'Track your personal balance, income, expenses, and cash flow' },
    transactions: { title: 'Transaction History', subtitle: 'Manage, search, and filter all income and expense records' },
    budgets: { title: 'Category Budgets', subtitle: 'Set spending caps per category and track your limit progress' },
    recurring: { title: 'Recurring Payments', subtitle: 'Automate tracking for salary, rent, and monthly subscriptions' },
    reports: { title: 'Financial Reports', subtitle: 'Deep dive into expense category breakdowns and visual analytics' },
    settings: { title: 'Settings', subtitle: 'Manage theme appearance, categories, currency preferences, and backups' }
  };

  const info = titles[currentView] || titles.dashboard;

  return (
    <header className="top-header">
      <div className="header-title-group">
        <h2>{info.title}</h2>
        <p>{info.subtitle}</p>
      </div>

      <div className="header-actions">
        <div className="currency-selector-pill" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-surface-hover)', padding: '6px 14px', borderRadius: 'var(--radius-md)', border: 'var(--glass-border)' }}>
          <Globe size={16} style={{ color: 'var(--accent-primary)' }} />
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Currency:</span>
          <select
            value={currency}
            onChange={(e) => onCurrencyChange(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              fontWeight: '700',
              fontSize: '0.9rem',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            {CURRENCIES.map(c => (
              <option key={c.code} value={c.symbol} style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)' }}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}
