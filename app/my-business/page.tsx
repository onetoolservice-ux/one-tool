import { redirect } from 'next/navigation';

// Default landing for the My Business workspace — the Command Center dashboard.
export default function MyBusinessHome() {
  redirect('/my-business/biz-dashboard');
}
