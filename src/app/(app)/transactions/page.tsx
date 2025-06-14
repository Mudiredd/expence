import type { Metadata } from 'next';
import TransactionsPageClient from './page-client';

export const metadata: Metadata = {
  title: 'Transaction History | Vishnu Finance Tracker',
};

export default function TransactionsPage() {
  return <TransactionsPageClient />;
}
