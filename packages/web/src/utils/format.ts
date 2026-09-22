const currencyFormatter = new Intl.NumberFormat('en-IE', {
  style: 'currency',
  currency: 'EUR',
});

export function formatCurrency(value: number | null): string {
  if (value === null) return '—';
  return currencyFormatter.format(value);
}
