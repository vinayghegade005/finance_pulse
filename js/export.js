/* ==========================================================================
   EXPENSE & INCOME TRACKER - DATA IMPORT/EXPORT UTILITY MODULE
   ========================================================================== */

// Export Transactions Array to CSV file
export function exportToCSV(transactions, filename = 'expense_income_report.csv') {
  if (!transactions || transactions.length === 0) {
    alert("No transactions available to export.");
    return;
  }

  const headers = ['ID', 'Date', 'Type', 'Category', 'Amount ($)', 'Payment Method', 'Description', 'Tags'];
  
  const rows = transactions.map(t => [
    t.id,
    t.date,
    t.type.toUpperCase(),
    `"${(t.category || '').replace(/"/g, '""')}"`,
    t.amount.toFixed(2),
    `"${(t.paymentMethod || '').replace(/"/g, '""')}"`,
    `"${(t.description || '').replace(/"/g, '""')}"`,
    `"${(t.tags ? t.tags.join(', ') : '').replace(/"/g, '""')}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Export Full Database to JSON Backup
export function exportToJSON(dataStore, filename = 'finance_tracker_backup.json') {
  const jsonStr = JSON.stringify(dataStore.data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Import JSON Backup File
export function importFromJSON(file, dataStore, callback) {
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const parsed = JSON.parse(e.target.result);
      const success = dataStore.restoreJSON(parsed);
      if (success) {
        callback(true, "Data successfully restored from JSON backup!");
      } else {
        callback(false, "Invalid JSON structure. Please check your backup file.");
      }
    } catch (err) {
      callback(false, "Failed to parse JSON file: " + err.message);
    }
  };
  reader.readAsText(file);
}
