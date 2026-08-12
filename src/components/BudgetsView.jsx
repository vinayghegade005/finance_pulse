import React from 'react';
import { Plus, AlertTriangle } from 'lucide-react';
import { FinanceStore } from '../utils/store';

export default function BudgetsView({ budgets, transactions, onOpenAddBudget }) {
  const budgetProgress = FinanceStore.getBudgetsWithProgress(budgets, transactions);

  return (
    <div className="page-view active">
      <div className="section-card">
        <div className="section-header">
          <div>
            <h3>Monthly Category Caps</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Set spending limits per expense category and track limit progress
            </p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={onOpenAddBudget}>
            <Plus size={16} />
            <span>Set Category Budget</span>
          </button>
        </div>

        <div className="budget-grid">
          {budgetProgress.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>
              No budgets configured yet. Click "Set Category Budget" to add limits.
            </p>
          ) : (
            budgetProgress.map(b => (
              <div key={b.category} className="budget-card">
                <div className="budget-card-header">
                  <h3>{b.category}</h3>
                  <span className={`trend-badge ${b.status === 'exceeded' ? 'negative' : (b.status === 'warning' ? 'warning' : 'positive')}`}>
                    {b.percentage}% Spent
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Spent: <strong>₹{b.spent.toFixed(2)}</strong></span>
                  <span style={{ color: 'var(--text-muted)' }}>Limit: <strong>₹{b.limit.toFixed(2)}</strong></span>
                </div>

                <div className="progress-bar-bg">
                  <div className={`progress-bar-fill ${b.status}`} style={{ width: `${b.percentage}%` }}></div>
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {b.status === 'exceeded' ? (
                    <span style={{ color: 'var(--accent-expense)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertTriangle size={14} /> Exceeded budget cap by ₹{(b.spent - b.limit).toFixed(2)}
                    </span>
                  ) : (
                    `Remaining budget: ₹${b.remaining.toFixed(2)}`
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
