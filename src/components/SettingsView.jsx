import React from 'react';
import { FileSpreadsheet, Download, Upload, RotateCcw, Globe } from 'lucide-react';
import { exportToCSV, exportToJSON, importFromJSON } from '../utils/exportUtils';
import { CURRENCIES } from '../utils/store';

export default function SettingsView({ appData, setAppData, showToast }) {
  const currency = appData.settings?.currency || '₹';

  const handleCurrencyChange = (newCurrency) => {
    const updated = {
      ...appData,
      settings: {
        ...appData.settings,
        currency: newCurrency
      }
    };
    setAppData(updated);
    showToast(`Currency updated to ${newCurrency}`);
  };

  const handleExportCSV = () => {
    exportToCSV(appData.transactions, currency);
    showToast('CSV report downloaded successfully!');
  };

  const handleExportJSON = () => {
    exportToJSON(appData);
    showToast('JSON database backup downloaded!');
  };

  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      importFromJSON(file, (success, parsed, msg) => {
        showToast(msg);
        if (success && parsed) {
          setAppData(parsed);
          localStorage.setItem('finance_pulse_db_v2', JSON.stringify(parsed));
        }
      });
    }
  };

  const handleResetData = () => {
    if (confirm('Are you sure you want to reset all data back to default demo records?')) {
      localStorage.removeItem('finance_pulse_db_v2');
      window.location.reload();
    }
  };

  return (
    <div className="page-view active">
      {/* Currency Preferences Section */}
      <div className="section-card" style={{ marginBottom: '28px' }}>
        <div className="section-header">
          <div>
            <h3>Currency & Preferences</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Choose your preferred currency symbol to format all income, expenses, and budget limits across the dashboard.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginTop: '16px' }}>
          {CURRENCIES.map(c => (
            <div
              key={c.code}
              onClick={() => handleCurrencyChange(c.symbol)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justify: 'space-between',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                background: currency === c.symbol ? 'var(--accent-primary-light)' : 'var(--bg-surface)',
                border: currency === c.symbol ? '1.5px solid var(--accent-primary)' : 'var(--glass-border)',
                cursor: 'pointer',
                transition: 'var(--transition-fast)'
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{c.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Code: {c.code}</div>
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: currency === c.symbol ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
                {c.symbol}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Export & Data Management Section */}
      <div className="section-card">
        <h3 style={{ marginBottom: '16px' }}>Export & Data Management</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
          Export your financial data to CSV spreadsheets or generate full offline JSON backups.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
          <button className="btn btn-success" onClick={handleExportCSV}>
            <FileSpreadsheet size={18} />
            <span>Export Transactions to CSV</span>
          </button>

          <button className="btn btn-primary" onClick={handleExportJSON}>
            <Download size={18} />
            <span>Backup JSON Database</span>
          </button>

          <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
            <Upload size={18} />
            <span>Restore from JSON File</span>
            <input type="file" accept=".json" onChange={handleImportFile} style={{ display: 'none' }} />
          </label>

          <button className="btn btn-danger" onClick={handleResetData}>
            <RotateCcw size={18} />
            <span>Reset to Default Demo Data</span>
          </button>
        </div>
      </div>
    </div>
  );
}
