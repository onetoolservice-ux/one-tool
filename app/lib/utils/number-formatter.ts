// ─── Indian number-to-words converter ─────────────────────────────────────────
const ONES = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen',
];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

/**
 * Converts a number to its Indian-style words representation.
 * e.g. 18500 → "Eighteen Thousand Five Hundred"
 */
export function numberToWords(n: number): string {
  if (n === 0) return 'Zero';
  const r = (x: number): string => {
    if (x === 0) return '';
    if (x < 20) return ONES[x] + ' ';
    if (x < 100) return TENS[Math.floor(x / 10)] + (x % 10 ? ' ' + ONES[x % 10] : '') + ' ';
    if (x < 1000) return ONES[Math.floor(x / 100)] + ' Hundred ' + r(x % 100);
    if (x < 100000) return r(Math.floor(x / 1000)) + 'Thousand ' + r(x % 1000);
    if (x < 10000000) return r(Math.floor(x / 100000)) + 'Lakh ' + r(x % 100000);
    return r(Math.floor(x / 10000000)) + 'Crore ' + r(x % 10000000);
  };
  return r(Math.round(n)).trim();
}
