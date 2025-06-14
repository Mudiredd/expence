import type { Metadata } from 'next';
import AddTransactionPageClient from './page-client';

export const metadata: Metadata = {
  title: 'Add Transaction | Vishnu Finance Tracker',
};

export default function AddTransactionPage() {
  return <AddTransactionPageClient />;
}
