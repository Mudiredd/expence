import type { Metadata } from 'next';
import { TransactionForm } from '@/components/transactions/TransactionForm';

export const metadata: Metadata = {
  title: 'Add Transaction | Vishnu Finance Tracker',
};

export default function AddTransactionPage() {
  return (
    <div className="animate-fadeIn">
      <TransactionForm />
    </div>
  );
}
