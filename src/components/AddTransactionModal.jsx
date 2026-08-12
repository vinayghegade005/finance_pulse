import React, { useState } from 'react';
import { X } from 'lucide-react';
import { DEFAULT_CATEGORIES } from '../utils/store';

export default function AddTransactionModal({ isOpen, onClose, onSave, currency = '₹' }) {
  if (!isOpen) return null;

  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(DEFAULT_CATEGORIES.expense[0].name);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Bank Account');
  const [tags, setTags] = useState('');

  const allCategories = type === 'income' 
    ? DEFAULT_CATEGORIES.income.map(c => c.name)
    : DEFAULT_CATEGORIES.expense.map(c => c.name);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      id: 'tx_' + Date.now(),
      type,
      amount: parseFloat(amount),
      category,
      date,
      description: description.trim() || category,
      paymentMethod,
      tags: tags ? tags.split(',').map(s => s.trim()) : []
    });
    onClose();
  };

  return (
    <div className="modal-overlay active">
      <div className="modal-dialog">
        <div className="modal-header">
          <h3>Record New Transaction</h3>
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
              <label>Amount ({currency})</label>
              <input type="number" step="0.01" min="0.01" className="form-input" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
                {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Date</label>
              <input type="date" className="form-input" value={date} onChange={e => setDate(e.target.value)} required />
            </div>
          </div>

          <div className="form-group">
            <label>Description / Payee (Optional)</label>
            <input type="text" className="form-input" value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g. Grocery Store, Salary (Optional)" />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Payment Method</label>
              <select className="form-select" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                <option value="Bank Account">Bank Account</option>
                <option value="Cash">Cash</option>
              </select>
            </div>

            <div className="form-group">
              <label>Tags (comma separated)</label>
              <input type="text" className="form-input" value={tags} onChange={e => setTags(e.target.value)} placeholder="e.g. Food, Work" />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Transaction</button>
          </div>
        </form>
      </div>
    </div>
  );
}
