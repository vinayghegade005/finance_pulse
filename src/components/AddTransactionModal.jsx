import React, { useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown, Landmark, Banknote, Plus, Check } from 'lucide-react';
import { DEFAULT_CATEGORIES } from '../utils/store';

export default function AddTransactionModal({ 
  isOpen, 
  onClose, 
  onSave, 
  currency = '₹',
  customCategories = { expense: [], income: [] },
  onAddCustomCategory
}) {
  if (!isOpen) return null;

  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Bank Account');
  const [tags, setTags] = useState('');

  // Custom Category Inline Creation State
  const [isAddingCustomCategory, setIsAddingCustomCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');

  // Build combined list of categories (Default + Custom)
  const defaultList = (type === 'income' 
    ? DEFAULT_CATEGORIES.income.map(c => c.name)
    : DEFAULT_CATEGORIES.expense.map(c => c.name));

  const customList = (customCategories && customCategories[type]) || [];
  const categoryOptions = [...defaultList, ...customList];

  // Set default category when type or category list changes
  useEffect(() => {
    if (!category || !categoryOptions.includes(category)) {
      setCategory(categoryOptions[0] || '');
    }
  }, [type, customCategories]);

  const handleSaveCustomCategory = (e) => {
    e.preventDefault();
    const trimmed = customCategoryInput.trim();
    if (trimmed) {
      if (onAddCustomCategory) {
        onAddCustomCategory(type, trimmed);
      }
      setCategory(trimmed);
      setCustomCategoryInput('');
      setIsAddingCustomCategory(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    onSave({
      id: 'tx_' + Date.now(),
      type,
      amount: parseFloat(amount),
      category: category || categoryOptions[0],
      date,
      description: description.trim() || category || 'Transaction',
      paymentMethod,
      tags: tags ? tags.split(',').map(s => s.trim()).filter(Boolean) : []
    });
    onClose();
  };

  return (
    <div className="modal-overlay active">
      <div className="modal-dialog" style={{ maxWidth: '540px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              background: type === 'income' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)',
              color: type === 'income' ? 'var(--accent-income)' : 'var(--accent-expense)',
              display: 'flex',
              alignItems: 'center',
              justify: 'center'
            }}>
              {type === 'income' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Record New Transaction</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                Log income or expense entry into your ledger
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Interactive Transaction Type Cards */}
          <div className="type-toggle-grid">
            <div
              className={`type-toggle-card expense ${type === 'expense' ? 'selected' : ''}`}
              onClick={() => { setType('expense'); setIsAddingCustomCategory(false); }}
            >
              <TrendingDown size={18} />
              <span>Expense Outflow</span>
            </div>

            <div
              className={`type-toggle-card income ${type === 'income' ? 'selected' : ''}`}
              onClick={() => { setType('income'); setIsAddingCustomCategory(false); }}
            >
              <TrendingUp size={18} />
              <span>Income Inflow</span>
            </div>
          </div>

          {/* Amount Input with Dynamic Currency Prefix */}
          <div className="form-group" style={{ marginBottom: '18px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Amount</label>
            <div className="amount-input-container">
              <span className="amount-currency-symbol">{currency}</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="form-input amount-input-field"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                required
                autoFocus
              />
            </div>
          </div>

          {/* Category Dropdown + Custom Category Addition */}
          <div className="form-group" style={{ marginBottom: '18px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Category</label>
            {!isAddingCustomCategory ? (
              <div>
                <select
                  className="form-select"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <optgroup label={`${type === 'income' ? 'Income' : 'Expense'} Categories`}>
                    {categoryOptions.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </optgroup>
                </select>

                <button
                  type="button"
                  className="custom-cat-trigger-btn"
                  onClick={() => setIsAddingCustomCategory(true)}
                >
                  <Plus size={14} />
                  <span>+ Add Custom {type === 'income' ? 'Income' : 'Expense'} Category</span>
                </button>
              </div>
            ) : (
              <div>
                <div className="custom-cat-inline-row">
                  <input
                    type="text"
                    className="form-input"
                    placeholder={`Name your new ${type} category...`}
                    value={customCategoryInput}
                    onChange={e => setCustomCategoryInput(e.target.value)}
                    autoFocus
                  />
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={handleSaveCustomCategory}
                  >
                    <Check size={16} />
                    <span>Add</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => { setIsAddingCustomCategory(false); setCustomCategoryInput(''); }}
                  >
                    Cancel
                  </button>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  This category will be saved and selectable for future transactions.
                </div>
              </div>
            )}
          </div>

          {/* Payment Account Pills & Date Row */}
          <div className="form-row" style={{ marginBottom: '18px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Payment Method</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className={`account-tab-btn ${paymentMethod === 'Bank Account' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('Bank Account')}
                  style={{ padding: '8px 12px', fontSize: '0.82rem' }}
                >
                  <Landmark size={14} />
                  <span>Bank</span>
                </button>

                <button
                  type="button"
                  className={`account-tab-btn ${paymentMethod === 'Cash' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('Cash')}
                  style={{ padding: '8px 12px', fontSize: '0.82rem' }}
                >
                  <Banknote size={14} />
                  <span>Cash</span>
                </button>
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Date</label>
              <input
                type="date"
                className="form-input"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Description & Tags */}
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Description / Payee (Optional)</label>
            <input
              type="text"
              className="form-input"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Grocery store name, Salary, Client payment"
            />
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Tags (Optional, comma-separated)</label>
            <input
              type="text"
              className="form-input"
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="e.g. Food, Work, Essential"
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className={`btn ${type === 'income' ? 'btn-success' : 'btn-primary'}`}
            >
              <Plus size={16} />
              <span>Record {type === 'income' ? 'Income' : 'Expense'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
