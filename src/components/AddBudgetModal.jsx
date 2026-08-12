import React, { useState } from 'react';
import { X } from 'lucide-react';
import { DEFAULT_CATEGORIES } from '../utils/store';

export default function AddBudgetModal({ isOpen, onClose, onSave }) {
  if (!isOpen) return null;

  const [category, setCategory] = useState(DEFAULT_CATEGORIES.expense[0].name);
  const [limit, setLimit] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(category, parseFloat(limit));
    onClose();
  };

  return (
    <div className="modal-overlay active">
      <div className="modal-dialog">
        <div className="modal-header">
          <h3>Set Category Budget Cap</h3>
          <button className="modal-close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Expense Category</label>
            <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
              {DEFAULT_CATEGORIES.expense.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Monthly Limit (₹)</label>
            <input type="number" step="1" min="1" className="form-input" value={limit} onChange={e => setLimit(e.target.value)} placeholder="e.g. 500" required />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Budget</button>
          </div>
        </form>
      </div>
    </div>
  );
}
