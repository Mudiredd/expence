'use client';

import { TransactionForm } from '@/components/transactions/TransactionForm';
import { useTransactions } from '@/contexts/TransactionContext';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Transaction } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function AddTransactionPageClient() {
  const searchParams = useSearchParams();
  const { transactions } = useTransactions();
  const [initialTransaction, setInitialTransaction] = useState<Transaction | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const transactionId = searchParams.get('id');
    if (transactionId) {
      const transaction = transactions.find(t => t.id === transactionId);
      setInitialTransaction(transaction);
    }
    setIsLoading(false);
  }, [searchParams, transactions]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <Skeleton className="h-[400px] w-full max-w-2xl mx-auto rounded-lg" />
      </div>
    );
  }

  return (
    <div className="animate-fadeIn container mx-auto p-4">
      <TransactionForm initialData={initialTransaction} />
    </div>
  );
}
