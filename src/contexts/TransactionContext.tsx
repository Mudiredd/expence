
"use client";
import type { FC, ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Transaction } from '@/types';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import {
  collection,
  addDoc,
  query,
  getDocs,
  Timestamp,
  orderBy,
} from 'firebase/firestore';

interface TransactionContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'userId'>) => Promise<void>;
  loading: boolean;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const TransactionProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true); // Start true for initial auth check and fetch
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Effect to subscribe to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user); // This will trigger the data fetching effect below
    });
    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []); // Empty dependency array: runs once on mount

  // Effect to fetch transactions when currentUser changes
  useEffect(() => {
    if (currentUser) {
      // User is logged in
      setLoading(true);
      const transactionsColRef = collection(db, 'users', currentUser.uid, 'transactions');
      const q = query(transactionsColRef, orderBy('date', 'desc'));

      getDocs(q)
        .then((querySnapshot) => {
          const fetchedTransactions: Transaction[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            fetchedTransactions.push({
              id: doc.id,
              userId: currentUser.uid, // Ensure userId is correctly set from the current user
              type: data.type,
              category: data.category,
              amount: data.amount,
              date: (data.date instanceof Timestamp) ? (data.date as Timestamp).toDate().toISOString().split('T')[0] : data.date,
              description: data.description,
            });
          });
          setTransactions(fetchedTransactions);
        })
        .catch((error) => {
          console.error("Error fetching transactions from Firestore:", error);
          setTransactions([]); // Clear transactions on error
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      // No user is logged in (or user logged out)
      setTransactions([]); // Clear transactions
      setLoading(false); // No longer loading if no user
    }
  }, [currentUser, db]); // Re-run this effect if currentUser or db instance changes

  const addTransaction = useCallback(
    async (transaction: Omit<Transaction, 'id' | 'userId'>) => {
      if (!currentUser) {
        console.error("No user logged in to add transaction");
        // Optionally, throw an error or show a toast
        return;
      }
      // setLoading(true); // Optional: For immediate feedback during add operation
      try {
        const transactionsColRef = collection(db, 'users', currentUser.uid, 'transactions');
        // Convert date string to Firestore Timestamp for proper querying/sorting
        const transactionData = {
          ...transaction,
          // userId is implicitly part of the collection path, not stored in the document itself typically
          date: Timestamp.fromDate(new Date(transaction.date)),
        };
        const docRef = await addDoc(transactionsColRef, transactionData);
        
        // Optimistically update local state or refetch
        // For optimistic update, ensure the new transaction object matches the Transaction type
        const newTransactionEntry: Transaction = {
          ...transaction,
          id: docRef.id,
          userId: currentUser.uid, // Add userId for local state consistency
        };
        setTransactions(prevTransactions =>
          [newTransactionEntry, ...prevTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        );
      } catch (error) {
        console.error("Error adding transaction to Firestore:", error);
        // Handle error (e.g., show toast)
      } 
      // finally { setLoading(false); } // If setLoading(true) was used
    },
    [currentUser, db] // addTransaction depends on currentUser and db
  );

  return (
    <TransactionContext.Provider value={{ transactions, addTransaction, loading }}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = (): TransactionContextType => {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};
