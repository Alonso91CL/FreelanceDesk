const formatters: Record<string, Intl.NumberFormat> = {
  CLP: new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }),
  USD: new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }),
};

export function formatCurrency(amount: number, currency: 'USD' | 'CLP'): string {
  if (!isFinite(amount)) return formatters[currency].format(0);
  return formatters[currency].format(amount);
}

export function formatPercent(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}
