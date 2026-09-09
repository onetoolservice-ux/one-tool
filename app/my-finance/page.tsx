import { redirect } from 'next/navigation';

// Default landing for the My Finance workspace — the Financial Snapshot
// dashboard aggregates the other Personal Finance screens into one view.
export default function MyFinanceHome() {
  redirect('/my-finance/pf-financial-snapshot');
}
