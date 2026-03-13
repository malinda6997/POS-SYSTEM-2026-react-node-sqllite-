/**
 * Sri Lankan Rupee (LKR) Currency Formatting Utility
 * Formats amounts for Sri Lanka's local currency
 */

/**
 * Format a number as Sri Lankan Rupees (Rs.)
 * @param {number} amount - The amount to format
 * @param {boolean} showSymbol - Whether to show the currency symbol (default: true)
 * @returns {string} Formatted currency string (e.g., "Rs. 1,234.00")
 */
export const formatLKR = (amount, showSymbol = true) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return showSymbol ? 'Rs. 0.00' : '0.00';
  }

  const numAmount = parseFloat(amount);
  const formatted = new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numAmount);

  // Intl.NumberFormat returns "Rs. X,XXX.XX" format for en-LK
  return formatted;
};

/**
 * Format a number as shorthand currency (e.g., "Rs. 1.5k" for thousands)
 * Useful for dashboard KPI cards and charts
 * @param {number} amount - The amount to format
 * @returns {string} Shorthand formatted string (e.g., "Rs. 1.5k")
 */
export const formatLKRShort = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'Rs. 0';
  }

  const numAmount = parseFloat(amount);
  if (numAmount >= 1000000) {
    return `Rs. ${(numAmount / 1000000).toFixed(1)}M`;
  } else if (numAmount >= 1000) {
    return `Rs. ${(numAmount / 1000).toFixed(1)}k`;
  }
  return `Rs. ${numAmount.toFixed(2)}`;
};

/**
 * Format for display in tables and lists (no decimals for large amounts)
 * @param {number} amount - The amount to format
 * @returns {string} Formatted string (e.g., "Rs. 1,234")
 */
export const formatLKRTable = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'Rs. 0';
  }

  const numAmount = parseFloat(amount);
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numAmount);
};

export default {
  formatLKR,
  formatLKRShort,
  formatLKRTable,
};
