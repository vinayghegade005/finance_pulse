/* ==========================================================================
   FINANCEPULSE - DATE & FORMATTING UTILITIES
   ========================================================================== */

/**
 * Format ISO or YYYY-MM-DD date string to DD/MM/YYYY format.
 */
export function formatDateDDMMYYYY(dateStr) {
  if (!dateStr) return '';
  
  // If already DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return dateStr;
  
  // Handle YYYY-MM-DD
  const parts = dateStr.split('T')[0].split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    const [year, month, day] = parts;
    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
  }

  // Fallback for JS Date instances or timestamps
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  return dateStr;
}

/**
 * Normalize payment methods strictly to 'Bank Account' or 'Cash'.
 */
export function normalizePaymentMethod(method) {
  if (!method) return 'Bank Account';
  const lower = String(method).toLowerCase();
  if (lower.includes('cash')) return 'Cash';
  return 'Bank Account';
}
