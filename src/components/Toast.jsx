import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function Toast({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className="toast">
          <CheckCircle2 size={18} style={{ color: 'var(--accent-income)' }} />
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
