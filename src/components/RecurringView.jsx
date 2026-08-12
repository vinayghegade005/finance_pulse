import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

export default function RecurringView({ recurring, onDeleteRec, onOpenAddRec }) {
  return (
    <div className="page-view active">
      <div className="section-card">
        <div className="section-header">
          <div>
            <h3>Automated & Subscription Rules</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Recurring income and expenses automatically generated when due
            </p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={onOpenAddRec}>
            <Plus size={16} />
            <span>Add Recurring Rule</span>
          </button>
        </div>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Frequency</th>
                <th>Last Processed</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recurring.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    No recurring transactions configured.
                  </td>
                </tr>
              ) : (
                recurring.map(r => (
                  <tr key={r.id}>
                    <td><strong>{r.description}</strong></td>
                    <td><span className="category-tag">{r.category}</span></td>
                    <td className={r.type === 'income' ? 'amount-income' : 'amount-expense'}>
                      {r.type === 'income' ? '+' : '-'}₹{r.amount.toFixed(2)}
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>{r.frequency}</td>
                    <td>{r.lastProcessed || 'N/A'}</td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => onDeleteRec(r.id)}>
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
