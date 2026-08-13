import React, { useState } from 'react';
import { FileSpreadsheet, Download, Upload, RotateCcw, Tag, Plus, Trash2, TrendingUp, TrendingDown, RefreshCw, Moon, Sun, Check } from 'lucide-react';
import { exportToCSV, exportToJSON, importFromJSON } from '../utils/exportUtils';
import { CURRENCIES, DEFAULT_CATEGORIES } from '../utils/store';

export default function SettingsView({ 
  appData, 
  saveState, 
  setAppData, 
  showToast,
  theme = 'dark',
  toggleTheme,
  onAddCategory,
  onDeleteCategory 
}) {
  const currency = appData.settings?.currency || '₹';
  const save = saveState || setAppData;

  // Category Management Tab & Form State
  const [activeCatTab, setActiveCatTab] = useState('expense');
  const [newCatInput, setNewCatInput] = useState('');

  const handleCurrencyChange = (newCurrency) => {
    const updated = {
      ...appData,
      settings: {
        ...(appData.settings || {}),
        currency: newCurrency
      }
    };
    save(updated);
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
          save(parsed);
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

  // Category Management Handlers
  const handleCreateCategory = (e) => {
    e.preventDefault();
    const trimmed = newCatInput.trim();
    if (!trimmed) return;
    if (onAddCategory) {
      onAddCategory(activeCatTab, trimmed);
    }
    setNewCatInput('');
  };

  // Build active and disabled category lists
  const disabledList = (appData.disabledCategories && appData.disabledCategories[activeCatTab]) || [];
  const defaultList = (DEFAULT_CATEGORIES[activeCatTab] || [])
    .map(c => typeof c === 'string' ? c : c.name)
    .filter(name => !disabledList.includes(name));
  const customList = (appData.customCategories && appData.customCategories[activeCatTab]) || [];
  
  const expenseCount = ((DEFAULT_CATEGORIES.expense.map(c => c.name).filter(c => !((appData.disabledCategories?.expense) || []).includes(c))).length) + ((appData.customCategories?.expense) || []).length;
  const incomeCount = ((DEFAULT_CATEGORIES.income.map(c => c.name).filter(c => !((appData.disabledCategories?.income) || []).includes(c))).length) + ((appData.customCategories?.income) || []).length;

  return (
    <div className="page-view active">
      {/* Theme Preferences Section */}
      <div className="section-card" style={{ marginBottom: '28px' }}>
        <div className="section-header">
          <div>
            <h3>Theme</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Customize the visual appearance of the application. Switch between Dark Mode and Light Mode.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginTop: '16px' }}>
          {/* Dark Mode Card */}
          <div
            onClick={() => {
              if (theme !== 'dark' && toggleTheme) toggleTheme();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '16px 20px',
              borderRadius: 'var(--radius-md)',
              background: theme === 'dark' ? 'var(--accent-primary-light)' : 'var(--bg-surface)',
              border: theme === 'dark' ? '2px solid var(--accent-primary)' : 'var(--glass-border)',
              cursor: 'pointer',
              transition: 'var(--transition-fast)'
            }}
          >
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              background: theme === 'dark' ? 'var(--accent-primary)' : 'var(--bg-surface-hover)',
              color: theme === 'dark' ? '#fff' : 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justify: 'center'
            }}>
              <Moon size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>Dark Mode</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Rich dark navy aesthetic</div>
            </div>
            {theme === 'dark' && <Check size={20} style={{ marginLeft: 'auto', color: 'var(--accent-primary)' }} />}
          </div>

          {/* Light Mode Card */}
          <div
            onClick={() => {
              if (theme !== 'light' && toggleTheme) toggleTheme();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '16px 20px',
              borderRadius: 'var(--radius-md)',
              background: theme === 'light' ? 'var(--accent-primary-light)' : 'var(--bg-surface)',
              border: theme === 'light' ? '2px solid var(--accent-primary)' : 'var(--glass-border)',
              cursor: 'pointer',
              transition: 'var(--transition-fast)'
            }}
          >
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              background: theme === 'light' ? 'var(--accent-primary)' : 'var(--bg-surface-hover)',
              color: theme === 'light' ? '#fff' : 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justify: 'center'
            }}>
              <Sun size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>Light Mode</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Clean high-contrast theme</div>
            </div>
            {theme === 'light' && <Check size={20} style={{ marginLeft: 'auto', color: 'var(--accent-primary)' }} />}
          </div>
        </div>
      </div>

      {/* Category Management Settings Section */}
      <div className="section-card" style={{ marginBottom: '28px' }}>
        <div className="section-header">
          <div>
            <h3>Category Management Settings</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Add new categories or delete existing ones for both Income and Expenses across the app.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="account-tabs" style={{ maxWidth: '400px', marginBottom: '20px' }}>
          <button
            type="button"
            className={`account-tab-btn ${activeCatTab === 'expense' ? 'active' : ''}`}
            onClick={() => setActiveCatTab('expense')}
          >
            <TrendingDown size={16} />
            <span>Expense ({expenseCount})</span>
          </button>

          <button
            type="button"
            className={`account-tab-btn ${activeCatTab === 'income' ? 'active' : ''}`}
            onClick={() => setActiveCatTab('income')}
          >
            <TrendingUp size={16} />
            <span>Income ({incomeCount})</span>
          </button>
        </div>

        {/* Add New Category Form */}
        <form onSubmit={handleCreateCategory} style={{ display: 'flex', gap: '10px', marginBottom: '24px', maxWidth: '520px' }}>
          <input
            type="text"
            className="form-input"
            style={{ flex: 1 }}
            placeholder={`Enter new ${activeCatTab} category name...`}
            value={newCatInput}
            onChange={e => setNewCatInput(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-primary">
            <Plus size={16} />
            <span>Add Category</span>
          </button>
        </form>

        {/* Active Categories Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px' }}>
          {/* Default Categories */}
          {defaultList.map(catName => (
            <div
              key={catName}
              style={{
                display: 'flex',
                alignItems: 'center',
                justify: 'space-between',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface)',
                border: 'var(--glass-border)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-surface-hover)',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'center'
                }}>
                  <Tag size={16} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{catName}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Default Standard</div>
                </div>
              </div>

              <button
                type="button"
                className="custom-category-delete-btn"
                title={`Delete ${catName} category`}
                onClick={() => onDeleteCategory && onDeleteCategory(activeCatTab, catName)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          {/* Custom Categories */}
          {customList.map(catName => (
            <div
              key={catName}
              style={{
                display: 'flex',
                alignItems: 'center',
                justify: 'space-between',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(59, 130, 246, 0.08)',
                border: '1px solid rgba(59, 130, 246, 0.25)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(59, 130, 246, 0.2)',
                  color: 'var(--accent-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'center'
                }}>
                  <Tag size={16} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{catName}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--accent-primary)' }}>Custom Category</div>
                </div>
              </div>

              <button
                type="button"
                className="custom-category-delete-btn"
                title={`Delete ${catName} custom category`}
                onClick={() => onDeleteCategory && onDeleteCategory(activeCatTab, catName)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* Restore Deleted Default Categories Sub-Section */}
        {disabledList.length > 0 && (
          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px dashed var(--border-color)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '10px' }}>
              Removed Standard Categories (Click to Restore):
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {disabledList.map(catName => (
                <button
                  key={catName}
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => onAddCategory && onAddCategory(activeCatTab, catName)}
                  style={{ fontSize: '0.78rem', gap: '6px' }}
                >
                  <RefreshCw size={12} />
                  <span>Restore "{catName}"</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

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
