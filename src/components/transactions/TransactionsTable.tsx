"use client";
import type { FC } from 'react';
import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { Transaction, TransactionType } from '@/types';
import { useTransactions } from '@/contexts/TransactionContext';
import { ArrowUpDown, Search, Filter, Trash2, Edit, CalendarDays } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { DateRange } from "react-day-picker"
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TransactionForm } from './TransactionForm';
import { Badge } from "@/components/ui/badge";

type SortKey = keyof Transaction | '';
type SortOrder = 'asc' | 'desc';

const ALL_CATEGORIES_VALUE = "_all_";

export const TransactionsTable: FC = () => {
  const { transactions, loading, deleteTransaction, editTransaction } = useTransactions();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<TransactionType | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const categories = useMemo(() => {
    const uniqueCategories = new Set(transactions.map(t => t.category));
    return Array.from(uniqueCategories);
  }, [transactions]);

  const filteredAndSortedTransactions = useMemo(() => {
    let processedTransactions = [...transactions];

    if (searchTerm) {
      processedTransactions = processedTransactions.filter(t =>
        t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filterType !== 'all') {
      processedTransactions = processedTransactions.filter(t => t.type === filterType);
    }

    if (filterCategory) {
      processedTransactions = processedTransactions.filter(t => t.category === filterCategory);
    }
    
    if (dateRange?.from) {
      processedTransactions = processedTransactions.filter(t => new Date(t.date) >= dateRange.from!);
    }
    if (dateRange?.to) {
      processedTransactions = processedTransactions.filter(t => new Date(t.date) <= dateRange.to!);
    }
    if (sortKey) {
      processedTransactions.sort((a, b) => {
        const valA = a[sortKey as keyof Transaction];
        const valB = b[sortKey as keyof Transaction];

        // Handle numeric comparisons (amount)
        if (sortKey === 'amount') {
          return sortOrder === 'asc' 
            ? a.amount - b.amount 
            : b.amount - a.amount;
        }

        // Handle date comparisons
        if (sortKey === 'date') {
          return sortOrder === 'asc'
            ? new Date(a.date).getTime() - new Date(b.date).getTime()
            : new Date(b.date).getTime() - new Date(a.date).getTime();
        }

        // Handle string comparisons (type, category, description)
        const stringA = String(valA || '');
        const stringB = String(valB || '');
        
        return sortOrder === 'asc'
          ? stringA.localeCompare(stringB)
          : stringB.localeCompare(stringA);
      });
    }
    return processedTransactions;
  }, [transactions, searchTerm, filterType, filterCategory, sortKey, sortOrder, dateRange]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(prevOrder => prevOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };
  
  const SortableHeader: FC<{ columnKey: SortKey; children: React.ReactNode }> = ({ columnKey, children }) => (
    <TableHead onClick={() => handleSort(columnKey)} className="cursor-pointer hover:bg-muted/50">
      <div className="flex items-center">
        {children}
        {sortKey === columnKey && <ArrowUpDown className="ml-2 h-4 w-4" />}
      </div>
    </TableHead>
  );

  const handleDelete = async (transactionId: string) => {
    try {
      await deleteTransaction(transactionId);
      toast({
        title: "Transaction Deleted",
        description: "The transaction has been successfully deleted.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete transaction. Please try again.",
        variant: "destructive",
      });
    }
  };
  const handleEdit = async (formData: Omit<Transaction, 'id' | 'userId'>) => {
    if (!editingTransaction) return;
    
    try {
      await editTransaction(editingTransaction.id, {
        type: formData.type,
        category: formData.category,
        amount: formData.amount,
        date: formData.date,
        description: formData.description,
      });
      setIsEditDialogOpen(false);
      setEditingTransaction(null);
      toast({
        title: "Transaction Updated",
        description: "The transaction has been successfully updated.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update transaction. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="w-full space-y-4">
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="w-full h-16" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg shadow bg-card">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by category or description..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={(value) => setFilterType(value as TransactionType | 'all')}>
          <SelectTrigger className="w-full md:w-[180px]">
            <Filter className="mr-2 h-4 w-4 text-muted-foreground"/>
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filterCategory || ALL_CATEGORIES_VALUE} // Ensure select shows "All Categories" if filterCategory is ""
          onValueChange={(value) => {
            if (value === ALL_CATEGORIES_VALUE) {
              setFilterCategory('');
            } else {
              setFilterCategory(value);
            }
          }}
        >
          <SelectTrigger className="w-full md:w-[180px]">
             <Filter className="mr-2 h-4 w-4 text-muted-foreground"/>
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_CATEGORIES_VALUE}>All Categories</SelectItem>
            {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
          </SelectContent>
        </Select>
        <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className="w-full md:w-auto justify-start text-left font-normal"
              >
                <CalendarDays className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHeader columnKey="date">Date</SortableHeader>
              <SortableHeader columnKey="type">Type</SortableHeader>
              <SortableHeader columnKey="category">Category</SortableHeader>
              <SortableHeader columnKey="amount">Amount</SortableHeader>
              <TableHead>Description</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{format(new Date(transaction.date), 'MMM dd, yyyy')}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    transaction.type === 'income' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400'
                  }`}>
                    {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                  </span>
                </TableCell>
                <TableCell>{transaction.category}</TableCell>
                <TableCell className={`font-semibold ${transaction.type === 'income' ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
                  {transaction.amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                </TableCell>
                <TableCell className="text-muted-foreground max-w-xs truncate">{transaction.description || '-'}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingTransaction(transaction);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this transaction? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(transaction.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredAndSortedTransactions.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No transactions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
            <DialogDescription>
              Make changes to your transaction here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          {editingTransaction && (
            <div className="mt-4">
              <TransactionForm
                initialData={editingTransaction}
                onCancel={() => setIsEditDialogOpen(false)}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
