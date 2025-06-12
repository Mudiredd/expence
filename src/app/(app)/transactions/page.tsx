import type { Metadata } from 'next';
import { TransactionsTable } from '@/components/transactions/TransactionsTable';

export const metadata: Metadata = {
  title: 'Transaction History | Vishnu Finance Tracker',
};

export default function TransactionsPage() {
  return <TransactionsTable />;
}
