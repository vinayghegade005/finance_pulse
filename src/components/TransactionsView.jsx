import React, { useState } from 'react';
import { Search, Trash2 } from 'lucide-react';
import { DEFAULT_CATEGORIES } from '../utils/store';

export default function TransactionsView({ transactions, onDeleteTx }) {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const [category, setCategory] = useState('all');

  const allCategories = [
    ...DEFAULT_CATEGORIES.expense.map(c => c.name),
    ...DEFAULT_CATEGORIES.income.map(c => c.name)
  ];

  const filtered = transactions.filter(t => {
    if (type !== 'all' && t.type !== type) return false;
    if (category !== 'all' && t.category !== category) return false;
    if (query) {
      const q = query.toLowerCase();
      const matchDesc = t.description.toLowerCase().includes(q);
      const matchCat = t.category.toLowerCase().includes(q);
      const matchTag = t.tags && t.tags.some(tag => tag.toLowerCase().includes(q));
      if (!matchDesc && !matchCat && !matchTag) return false;
    }
    return true;
  });

  return (
    <div className="page-view active">
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
                <th>Date</th>
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
                    No matching transactions found.
                  </td>
                </tr>
              ) : (
                filtered.map(t => (
                  <tr key={t.id}>
                    <td>{t.date}</td>
                    <td>
                      <strong>{t.description || 'No description'}</strong>
                      {t.tags && t.tags.length > 0 && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {t.tags.map(tag => `#${tag}`).join(' ')}
                        </div>
                      )}
                    </td>
                    <td><span className="category-tag">{t.category}</span></td>
                    <td>{t.paymentMethod || 'Cash'}</td>
                    <td className={t.type === 'income' ? 'amount-income' : 'amount-expense'}>
                      {t.type === 'income' ? '+' : '-'}₹{t.amount.toFixed(2)}
                    </td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => onDeleteTx(t.id)}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
