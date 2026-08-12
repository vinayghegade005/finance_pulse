import React from 'react';
import { Wallet, TrendingUp, TrendingDown, Percent, ShieldCheck, Landmark, Banknote, Layers } from 'lucide-react';
import { FinanceStore } from '../utils/store';

export default function MetricCards({ transactions, currency = '₹', accountFilter = 'all', onAccountFilterChange }) {
  const metrics = FinanceStore.getMetrics(transactions);

  const getSubtitleText = (type) => {
    if (accountFilter === 'bank') {
      if (type === 'balance') return 'Bank Account Net Worth';
      if (type === 'income') return 'Bank Inflow';
      if (type === 'expense') return 'Bank Outflow';
    }
    if (accountFilter === 'cash') {
      if (type === 'balance') return 'Cash In Hand';
      if (type === 'income') return 'Cash Inflow';
      if (type === 'expense') return 'Cash Outflow';
    }
    if (type === 'balance') return 'Total Net Worth';
    if (type === 'income') return 'Total Inflow';
    if (type === 'expense') return 'Total Outflow';
    return '';
  };

  return (
    <div style={{ marginBottom: '28px' }}>
      {onAccountFilterChange && (
        <div className="account-tabs" style={{ marginBottom: '20px' }}>
          <button
            className={`account-tab-btn ${accountFilter === 'all' ? 'active' : ''}`}
            onClick={() => onAccountFilterChange('all')}
          >
            <Layers size={18} />
            <span>All Accounts Overview</span>
          </button>
          <button
            className={`account-tab-btn ${accountFilter === 'bank' ? 'active' : ''}`}
            onClick={() => onAccountFilterChange('bank')}
          >
            <Landmark size={18} />
            <span>Bank Account</span>
          </button>
          <button
            className={`account-tab-btn ${accountFilter === 'cash' ? 'active' : ''}`}
            onClick={() => onAccountFilterChange('cash')}
          >
            <Banknote size={18} />
            <span>Cash Wallet</span>
          </button>
        </div>
      )}

      <section className="metrics-grid" style={{ marginBottom: 0 }}>
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">
              {accountFilter === 'bank' ? 'Bank Balance' : (accountFilter === 'cash' ? 'Cash Balance' : 'Net Balance')}
            </span>
            <div className="metric-icon-wrapper balance">
              {accountFilter === 'bank' ? <Landmark size={20} /> : (accountFilter === 'cash' ? <Banknote size={20} /> : <Wallet size={20} />)}
            </div>
          </div>
          <div className="metric-value">
            {currency}{metrics.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="metric-subtitle">
            <span className="trend-badge positive">
              <ShieldCheck size={14} /> {getSubtitleText('balance')}
            </span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Total Income</span>
            <div className="metric-icon-wrapper income">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="metric-value">
            {currency}{metrics.income.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="metric-subtitle">
            <span style={{ color: 'var(--accent-income)', fontWeight: 600 }}>{getSubtitleText('income')}</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Total Expenses</span>
            <div className="metric-icon-wrapper expense">
              <TrendingDown size={20} />
            </div>
          </div>
          <div className="metric-value">
            {currency}{metrics.expenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="metric-subtitle">
            <span style={{ color: 'var(--accent-expense)', fontWeight: 600 }}>{getSubtitleText('expense')}</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Savings Rate</span>
            <div className="metric-icon-wrapper savings">
              <Percent size={20} />
            </div>
          </div>
          <div className="metric-value">
            {metrics.savingsRate}%
          </div>
          <div className="metric-subtitle">
            <span>Income Retained</span>
          </div>
        </div>
      </section>
    </div>
  );
}
