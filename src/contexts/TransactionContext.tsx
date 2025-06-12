
"use client";
import type { FC, ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Transaction } from '@/types';
import { auth, db } from '@/lib/firebase'; // Import Firebase auth and db
import { onAuthStateChanged, type User } from 'firebase/auth';
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  Timestamp,
  orderBy,
  doc,
  writeBatch,
} from 'firebase/firestore';

interface TransactionContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'userId'>) => Promise<void>;
  loading: boolean;
  // Future: deleteTransaction, updateTransaction for Firestore
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const TransactionProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (!user) {
        // User logged out, clear transactions and stop loading
        setTransactions([]);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchTransactions = useCallback(async (user: User) => {
    if (!user) {
      setTransactions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const transactionsColRef = collection(db, 'users', user.uid, 'transactions');
      const q = query(transactionsColRef, orderBy('date', 'desc')); // Order by date
      const querySnapshot = await getDocs(q);
      const fetchedTransactions: Transaction[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedTransactions.push({
          id: doc.id,
          userId: user.uid,
          type: data.type,
          category: data.category,
          amount: data.amount,
          // Firestore stores dates as Timestamps, convert to ISO string
          date: (data.date as Timestamp).toDate().toISOString().split('T')[0],
          description: data.description,
        });
      });
      setTransactions(fetchedTransactions);
    } catch (error) {
      console.error("Error fetching transactions from Firestore:", error);
      // Set transactions to empty array or handle error state appropriately
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchTransactions(currentUser);
    } else {
      // No user, clear transactions
      setTransactions([]);
      setLoading(false); 
    }
  }, [currentUser, fetchTransactions]);

  const addTransaction = useCallback(
    async (transaction: Omit<Transaction, 'id' | 'userId'>) => {
      if (!currentUser) {
        console.error("No user logged in to add transaction");
        // Optionally, throw an error or show a toast
        return;
      }
      try {
        const transactionsColRef = collection(db, 'users', currentUser.uid, 'transactions');
        // Convert date string to Firestore Timestamp for proper querying/sorting
        const transactionData = {
          ...transaction,
          userId: currentUser.uid,
          date: Timestamp.fromDate(new Date(transaction.date)),
        };
        const docRef = await addDoc(transactionsColRef, transactionData);
        // Add to local state immediately for responsiveness, or refetch
        setTransactions(prevTransactions => [
          { ...transaction, id: docRef.id, userId: currentUser.uid },
          ...prevTransactions,
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())); // Keep sorted
      } catch (error) {
        console.error("Error adding transaction to Firestore:", error);
        // Handle error (e.g., show toast)
      }
    },
    [currentUser]
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
