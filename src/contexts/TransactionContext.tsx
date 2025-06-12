"use client";
import type { FC, ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Transaction } from '@/types';

interface TransactionContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  loading: boolean;
  // Future: deleteTransaction, updateTransaction
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'financeTransactions';

export const TransactionProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedTransactions = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedTransactions) {
        setTransactions(JSON.parse(storedTransactions));
      }
    } catch (error) {
      console.error("Failed to load transactions from localStorage", error);
      // Initialize with empty array or default data if parsing fails
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Prevent writing to localStorage during initial server render or before hydration
    if (!loading) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(transactions));
      } catch (error) {
        console.error("Failed to save transactions to localStorage", error);
      }
    }
  }, [transactions, loading]);

  const addTransaction = useCallback((transaction: Omit<Transaction, 'id'>) => {
    setTransactions(prevTransactions => [
      ...prevTransactions,
      { ...transaction, id: new Date().toISOString() + Math.random().toString(36).substr(2, 9) }, // Simple unique ID
    ]);
  }, []);

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
