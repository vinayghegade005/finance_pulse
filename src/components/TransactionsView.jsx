import React, { useState } from 'react';
import { Search, Trash2, Landmark, Banknote, Layers } from 'lucide-react';
import { DEFAULT_CATEGORIES, FinanceStore } from '../utils/store';
import { formatDateDDMMYYYY, normalizePaymentMethod } from '../utils/formatters';

export default function TransactionsView({ transactions, currency = '₹', customCategories, onDeleteTx }) {
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'bank', 'cash'
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const [category, setCategory] = useState('all');

  const accountMetrics = FinanceStore.getAccountMetrics(transactions);

  const defaultCategories = [
    ...DEFAULT_CATEGORIES.expense.map(c => c.name),
    ...DEFAULT_CATEGORIES.income.map(c => c.name)
  ];
  const customExpense = (customCategories && customCategories.expense) || [];
  const customIncome = (customCategories && customCategories.income) || [];
  const allCategories = Array.from(new Set([...defaultCategories, ...customExpense, ...customIncome]));

  const filtered = transactions.filter(t => {
    const method = normalizePaymentMethod(t.paymentMethod);
    if (activeTab === 'bank' && method !== 'Bank Account') return false;
    if (activeTab === 'cash' && method !== 'Cash') return false;

    if (type !== 'all' && t.type !== type) return false;
    if (category !== 'all' && t.category !== category) return false;
    if (query) {
      const q = query.toLowerCase();
      const matchDesc = (t.description || '').toLowerCase().includes(q);
      const matchCat = (t.category || '').toLowerCase().includes(q);
      const matchTag = t.tags && t.tags.some(tag => tag.toLowerCase().includes(q));
      if (!matchDesc && !matchCat && !matchTag) return false;
    }
    return true;
  });

  return (
    <div className="page-view active">
      {/* Account Balance Summary Header Cards */}
      <div className="account-summary-grid">
        <div
          className={`account-card bank ${activeTab === 'bank' ? 'selected' : ''}`}
          onClick={() => setActiveTab('bank')}
          style={{ cursor: 'pointer' }}
        >
          <div className="account-card-header">
            <div className="account-card-title bank">
              <Landmark size={22} />
              <span>Bank Account</span>
            </div>
            <span className="payment-badge bank">{accountMetrics.bank.count} Txns</span>
          </div>

          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Bank Balance
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>
              {currency}{accountMetrics.bank.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
            <span style={{ color: 'var(--accent-income)' }}>Inflow: +{currency}{accountMetrics.bank.income.toFixed(2)}</span>
            <span style={{ color: 'var(--accent-expense)' }}>Outflow: -{currency}{accountMetrics.bank.expense.toFixed(2)}</span>
          </div>
        </div>

        <div
          className={`account-card cash ${activeTab === 'cash' ? 'selected' : ''}`}
          onClick={() => setActiveTab('cash')}
          style={{ cursor: 'pointer' }}
        >
          <div className="account-card-header">
            <div className="account-card-title cash">
              <Banknote size={22} />
              <span>Cash Wallet</span>
            </div>
            <span className="payment-badge cash">{accountMetrics.cash.count} Txns</span>
          </div>

          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Cash In Hand
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>
              {currency}{accountMetrics.cash.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
            <span style={{ color: 'var(--accent-income)' }}>Inflow: +{currency}{accountMetrics.cash.income.toFixed(2)}</span>
            <span style={{ color: 'var(--accent-expense)' }}>Outflow: -{currency}{accountMetrics.cash.expense.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Account Part Tabs */}
      <div className="account-tabs">
        <button
          className={`account-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          <Layers size={18} />
          <span>All Transactions ({transactions.length})</span>
        </button>

        <button
          className={`account-tab-btn ${activeTab === 'bank' ? 'active' : ''}`}
          onClick={() => setActiveTab('bank')}
        >
          <Landmark size={18} />
          <span>Bank Account Part ({accountMetrics.bank.count})</span>
        </button>

        <button
          className={`account-tab-btn ${activeTab === 'cash' ? 'active' : ''}`}
          onClick={() => setActiveTab('cash')}
        >
          <Banknote size={18} />
          <span>Cash Part ({accountMetrics.cash.count})</span>
        </button>
      </div>

      {/* Filters & Transaction Table */}
      <div className="section-card">
        <div className="filter-bar">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              className="search-input"
              placeholder="Search by description, category, or tag..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>

          <select className="form-select" value={type} onChange={e => setType(e.target.value)}>
            <option value="all">All Types</option>
            <option value="income">Income Only</option>
            <option value="expense">Expenses Only</option>
          </select>

          <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
            <option value="all">All Categories</option>
            {allCategories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Date (DD/MM/YYYY)</th>
                <th>Description & Tags</th>
                <th>Category</th>
                <th>Payment Method</th>
                <th>Amount</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    No transactions found in this view.
                  </td>
                </tr>
              ) : (
                filtered.map(t => {
                  const method = normalizePaymentMethod(t.paymentMethod);
                  return (
                    <tr key={t.id}>
                      <td style={{ fontWeight: 600 }}>{formatDateDDMMYYYY(t.date)}</td>
                      <td>
                        <strong>{t.description || 'No description'}</strong>
                        {t.tags && t.tags.length > 0 && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {t.tags.map(tag => `#${tag}`).join(' ')}
                          </div>
                        )}
                      </td>
                      <td><span className="category-tag">{t.category}</span></td>
                      <td>
                        <span className={`payment-badge ${method === 'Bank Account' ? 'bank' : 'cash'}`}>
                          {method === 'Bank Account' ? <Landmark size={13} /> : <Banknote size={13} />}
                          {method}
                        </span>
                      </td>
                      <td className={t.type === 'income' ? 'amount-income' : 'amount-expense'}>
                        {t.type === 'income' ? '+' : '-'}{currency}{t.amount.toFixed(2)}
                      </td>
                      <td>
                        <button className="btn btn-secondary btn-sm" onClick={() => onDeleteTx(t.id)}>
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
