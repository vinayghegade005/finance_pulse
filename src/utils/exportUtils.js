/* ==========================================================================
   FINANCEPULSE - CSV AND JSON EXPORT/IMPORT UTILITIES
   ========================================================================== */

export function exportToCSV(transactions, filename = 'finance_pulse_report.csv') {
  if (!transactions || transactions.length === 0) {
    alert("No transactions available to export.");
    return;
  }

  const headers = ['ID', 'Date', 'Type', 'Category', 'Amount (₹)', 'Payment Method', 'Description', 'Tags'];
  
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

export function exportToJSON(data, filename = 'finance_pulse_backup.json') {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function importFromJSON(file, callback) {
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const parsed = JSON.parse(e.target.result);
      if (parsed && Array.isArray(parsed.transactions)) {
        callback(true, parsed, "Data successfully restored from JSON backup!");
      } else {
        callback(false, null, "Invalid JSON structure. Backup must contain a transactions array.");
      }
    } catch (err) {
      callback(false, null, "Failed to parse JSON file: " + err.message);
    }
  };
  reader.readAsText(file);
}
