import React from 'react';
import { IndianRupee, TrendingUp, TrendingDown, Percent, ShieldCheck } from 'lucide-react';
import { FinanceStore } from '../utils/store';

export default function MetricCards({ transactions }) {
  const metrics = FinanceStore.getMetrics(transactions);

  return (
    <section className="metrics-grid">
      <div className="metric-card">
        <div className="metric-header">
          <span className="metric-title">Net Balance</span>
          <div className="metric-icon-wrapper balance">
            <IndianRupee size={20} />
          </div>
        </div>
        <div className="metric-value">
          ₹{metrics.balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="metric-subtitle">
          <span className="trend-badge positive">
            <ShieldCheck size={14} /> Total Net Worth
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
          ₹{metrics.income.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="metric-subtitle">
          <span style={{ color: 'var(--accent-income)', fontWeight: 600 }}>Total Inflow</span>
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
          ₹{metrics.expenses.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="metric-subtitle">
          <span style={{ color: 'var(--accent-expense)', fontWeight: 600 }}>Total Outflow</span>
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
  );
}
