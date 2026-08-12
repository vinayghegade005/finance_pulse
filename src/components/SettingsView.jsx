import React from 'react';
import { FileSpreadsheet, Download, Upload, RotateCcw } from 'lucide-react';
import { exportToCSV, exportToJSON, importFromJSON } from '../utils/exportUtils';

export default function SettingsView({ appData, setAppData, showToast }) {
  const handleExportCSV = () => {
    exportToCSV(appData.transactions);
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
