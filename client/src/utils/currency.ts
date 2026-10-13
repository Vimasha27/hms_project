export const CURRENCY_SYMBOL = 'Rs.';
export const CURRENCY_CODE = 'LKR';

/**
 * Formats a numeric amount to Sri Lankan Rupee currency string.
 * Example: formatCurrency(1250.5) => "Rs. 1,250.50"
 */
export const formatCurrency = (amount: number | string | null | undefined, decimals: number = 2): string => {
  const num = Number(amount) || 0;
  return `${CURRENCY_SYMBOL} ${num.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
};
