'use client';

import { TransactionsTable } from '@/components/transactions/TransactionsTable';
import { useTransactions } from '@/contexts/TransactionContext';
import type { Transaction } from '@/types';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { useState } from 'react';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function TransactionsPageClient() {
  const { deleteTransaction } = useTransactions();
  const router = useRouter();
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const handleEdit = async () => {
    if (selectedTransaction) {
      // Navigate to the add-transaction page with the transaction ID
      router.push(`/add-transaction?id=${selectedTransaction.id}`);
      setSelectedTransaction(null);
    }
  };

  const handleDelete = async () => {
    if (selectedTransaction) {
      try {
        await deleteTransaction(selectedTransaction.id);
        toast({ description: "Transaction deleted successfully" });
      } catch (error) {
        toast({ 
          description: "Failed to delete transaction", 
          variant: "destructive" 
        });
      } finally {
        setSelectedTransaction(null);
      }
    }
  };

  const handleTransactionSelect = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Transactions</h1>
        <p className="text-muted-foreground text-sm">View and manage your transaction history</p>
      </div>
      
      <TransactionsTable onSelect={handleTransactionSelect} />

      <AlertDialog 
        open={!!selectedTransaction} 
        onOpenChange={(open) => !open && setSelectedTransaction(null)}
      >
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Transaction Details</AlertDialogTitle>
            {selectedTransaction && (
              <AlertDialogDescription asChild>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-foreground font-medium">Amount</span>
                    <span className={cn(
                      "font-semibold",
                      selectedTransaction.type === 'income'
                        ? 'text-green-600 dark:text-green-500'
                        : 'text-red-600 dark:text-red-500'
                    )}>
                      {selectedTransaction.amount.toLocaleString('en-IN', { 
                        style: 'currency', 
                        currency: 'INR',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                      })}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Type</p>
                      <p className="font-medium capitalize">{selectedTransaction.type}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Category</p>
                      <p className="font-medium">{selectedTransaction.category}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Date</p>
                      <p className="font-medium">{format(new Date(selectedTransaction.date), "MMM dd, yyyy")}</p>
                    </div>
                    {selectedTransaction.description && (
                      <div className="col-span-2">
                        <p className="text-muted-foreground">Description</p>
                        <p className="font-medium">{selectedTransaction.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              </AlertDialogDescription>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <div className="flex w-full flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <AlertDialogCancel
                onClick={() => setSelectedTransaction(null)}
                className="sm:w-auto"
              >
                Cancel
              </AlertDialogCancel>
              <Button 
                variant="outline"
                onClick={handleEdit}
                className="flex items-center gap-2 sm:w-auto"
              >
                <Edit2 className="h-4 w-4" />
                Edit
              </Button>
              <Button 
                variant="destructive"
                onClick={handleDelete}
                className="flex items-center gap-2 sm:w-auto"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
