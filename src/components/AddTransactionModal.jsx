import React, { useState, useEffect, useRef } from 'react';
import { X, TrendingUp, TrendingDown, Landmark, Banknote, Plus, Check, ChevronDown, Search, Trash2, Tag } from 'lucide-react';
import { DEFAULT_CATEGORIES } from '../utils/store';

export default function AddTransactionModal({ 
  isOpen, 
  onClose, 
  onSave, 
  currency = '₹',
  customCategories = { expense: [], income: [] },
  onAddCustomCategory,
  onDeleteCustomCategory
}) {
  if (!isOpen) return null;

  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Bank Account');
  const [tags, setTags] = useState('');

  // Custom Category Dropdown State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const dropdownRef = useRef(null);

  // Build lists of categories
  const defaultList = (type === 'income' 
    ? DEFAULT_CATEGORIES.income.map(c => c.name)
    : DEFAULT_CATEGORIES.expense.map(c => c.name));

  const customList = (customCategories && customCategories[type]) || [];
  const allCategoryOptions = [...defaultList, ...customList];

  // Auto-select initial category
  useEffect(() => {
    if (!category || !allCategoryOptions.includes(category)) {
      setCategory(allCategoryOptions[0] || '');
    }
  }, [type, customCategories]);

  // Click outside listener to close category dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setIsCreatingCategory(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreateCategory = (e) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (trimmed) {
      if (onAddCustomCategory) {
        onAddCustomCategory(type, trimmed);
      }
      setCategory(trimmed);
      setNewCategoryName('');
      setIsCreatingCategory(false);
      setIsDropdownOpen(false);
      setSearchQuery('');
    }
  };

  const handleDeleteCategory = (e, catName) => {
    e.stopPropagation();
    if (onDeleteCustomCategory) {
      onDeleteCustomCategory(type, catName);
      if (category === catName) {
        const remaining = allCategoryOptions.filter(c => c !== catName);
        setCategory(remaining[0] || '');
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    onSave({
      id: 'tx_' + Date.now(),
      type,
      amount: parseFloat(amount),
      category: category || allCategoryOptions[0],
      date,
      description: description.trim() || category || 'Transaction',
      paymentMethod,
      tags: tags ? tags.split(',').map(s => s.trim()).filter(Boolean) : []
    });
    onClose();
  };

  // Filter categories by search query
  const filteredDefaults = defaultList.filter(c => c.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredCustoms = customList.filter(c => c.toLowerCase().includes(searchQuery.toLowerCase()));

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
              justifyContent: 'center'
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
              onClick={() => { setType('expense'); setIsDropdownOpen(false); setIsCreatingCategory(false); }}
            >
              <TrendingDown size={18} />
              <span>Expense Outflow</span>
            </div>

            <div
              className={`type-toggle-card income ${type === 'income' ? 'selected' : ''}`}
              onClick={() => { setType('income'); setIsDropdownOpen(false); setIsCreatingCategory(false); }}
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

          {/* Attractive Custom Category Picker */}
          <div className="form-group" style={{ marginBottom: '18px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Category</label>
            
            <div className="custom-category-picker-wrapper" ref={dropdownRef}>
              <button
                type="button"
                className={`custom-category-trigger ${isDropdownOpen ? 'open' : ''}`}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div className="custom-category-selected-info">
                  <div className="custom-category-badge-dot">
                    <Tag size={15} />
                  </div>
                  <span style={{ fontWeight: 600 }}>{category || 'Select Category'}</span>
                </div>
                <ChevronDown size={18} style={{
                  transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease',
                  color: 'var(--text-muted)'
                }} />
              </button>

              {/* Popover Dropdown Menu */}
              {isDropdownOpen && (
                <div className="custom-category-popover">
                  {/* Search Filter */}
                  <div className="custom-category-search-box">
                    <Search size={14} />
                    <input
                      type="text"
                      className="custom-category-search-input"
                      placeholder="Search or add category..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      onClick={e => e.stopPropagation()}
                      autoFocus
                    />
                  </div>

                  {/* Scrollable Category List */}
                  <div className="custom-category-list-scroll">
                    {/* Default Categories */}
                    {filteredDefaults.length > 0 && (
                      <div>
                        <div className="custom-category-group-header">Standard Categories</div>
                        {filteredDefaults.map(cat => (
                          <div
                            key={cat}
                            className={`custom-category-option-item ${category === cat ? 'selected' : ''}`}
                            onClick={() => {
                              setCategory(cat);
                              setIsDropdownOpen(false);
                              setSearchQuery('');
                            }}
                          >
                            <div className="custom-category-option-left">
                              <Tag size={14} style={{ opacity: 0.7 }} />
                              <span>{cat}</span>
                            </div>
                            {category === cat && <Check size={16} className="text-accent" />}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Custom Categories */}
                    {filteredCustoms.length > 0 && (
                      <div style={{ marginTop: '4px' }}>
                        <div className="custom-category-group-header">Custom Categories</div>
                        {filteredCustoms.map(cat => (
                          <div
                            key={cat}
                            className={`custom-category-option-item ${category === cat ? 'selected' : ''}`}
                            onClick={() => {
                              setCategory(cat);
                              setIsDropdownOpen(false);
                              setSearchQuery('');
                            }}
                          >
                            <div className="custom-category-option-left">
                              <Tag size={14} style={{ color: 'var(--accent-primary)' }} />
                              <span>{cat}</span>
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {category === cat && <Check size={16} />}
                              <button
                                type="button"
                                className="custom-category-delete-btn"
                                title="Delete this custom category"
                                onClick={(e) => handleDeleteCategory(e, cat)}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {filteredDefaults.length === 0 && filteredCustoms.length === 0 && (
                      <div style={{ padding: '12px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        No categories found matching "{searchQuery}".
                      </div>
                    )}
                  </div>

                  {/* Dropdown Footer: Embedded Add Category Option */}
                  <div className="custom-category-popover-footer">
                    {!isCreatingCategory ? (
                      <button
                        type="button"
                        className="custom-category-add-trigger"
                        onClick={() => setIsCreatingCategory(true)}
                      >
                        <Plus size={16} />
                        <span>+ Add New {type === 'income' ? 'Income' : 'Expense'} Category</span>
                      </button>
                    ) : (
                      <div className="custom-category-add-inline-form">
                        <div className="custom-category-add-input-row">
                          <input
                            type="text"
                            className="form-input"
                            style={{ padding: '6px 10px', fontSize: '0.82rem', flex: 1 }}
                            placeholder={`New ${type} category name...`}
                            value={newCategoryName}
                            onChange={e => setNewCategoryName(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleCreateCategory(e);
                            }}
                            autoFocus
                          />
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={handleCreateCategory}
                          >
                            <Check size={14} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => { setIsCreatingCategory(false); setNewCategoryName(''); }}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
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
