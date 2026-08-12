import React from 'react';

export default function Header({ currentView }) {
  const titles = {
    dashboard: { title: 'Dashboard Overview', subtitle: 'Track your personal balance, income, expenses, and cash flow' },
    transactions: { title: 'Transaction History', subtitle: 'Manage, search, and filter all income and expense records' },
    budgets: { title: 'Category Budgets', subtitle: 'Set spending caps per category and track your limit progress' },
    recurring: { title: 'Recurring Payments', subtitle: 'Automate tracking for salary, rent, and monthly subscriptions' },
    reports: { title: 'Financial Reports', subtitle: 'Deep dive into expense category breakdowns and visual analytics' },
    settings: { title: 'Data & Settings', subtitle: 'Export CSV spreadsheets, backup data, or restore from JSON' }
  };

  const info = titles[currentView] || titles.dashboard;

  return (
    <header className="top-header">
      <div className="header-title-group">
        <h2>{info.title}</h2>
        <p>{info.subtitle}</p>
      </div>
    </header>
  );
}
