import React, { useState } from 'react';
import { X } from 'lucide-react';
import { DEFAULT_CATEGORIES } from '../utils/store';

export default function AddRecurringModal({ isOpen, onClose, onSave }) {
  if (!isOpen) return null;

  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(DEFAULT_CATEGORIES.expense[0].name);

  const allCategories = type === 'income' 
    ? DEFAULT_CATEGORIES.income.map(c => c.name)
    : DEFAULT_CATEGORIES.expense.map(c => c.name);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      id: 'rec_' + Date.now(),
      type,
      amount: parseFloat(amount),
      description,
      category,
      frequency: 'monthly',
      lastProcessed: new Date().toISOString().split('T')[0]
    });
    onClose();
  };

  return (
    <div className="modal-overlay active">
      <div className="modal-dialog">
        <div className="modal-header">
          <h3>Add Recurring Payment Rule</h3>
          <button className="modal-close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Type</label>
              <select className="form-select" value={type} onChange={e => { setType(e.target.value); setCategory(e.target.value === 'income' ? DEFAULT_CATEGORIES.income[0].name : DEFAULT_CATEGORIES.expense[0].name); }}>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>

            <div className="form-group">
              <label>Amount (₹)</label>
              <input type="number" step="0.01" min="0.01" className="form-input" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" required />
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <input type="text" className="form-input" value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g. Salary, Rent, Netflix" required />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
                {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Frequency</label>
              <select className="form-select" disabled>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Rule</button>
          </div>
        </form>
      </div>
    </div>
  );
}
