
"use client";
import type { FC } from 'react';
import { useState, useMemo, useEffect } from 'react';
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

type SortKey = keyof Transaction | '';
type SortOrder = 'asc' | 'desc';

const ALL_CATEGORIES_VALUE = "_all_";

export const TransactionsTable: FC = () => {
  const { transactions, loading } = useTransactions();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<TransactionType | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);


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
      processedTransactions = processedTransactions.filter(t => {
        const transactionDate = new Date(t.date);
        return !isNaN(transactionDate.getTime()) && transactionDate >= dateRange.from!;
      });
    }
    if (dateRange?.to) {
      processedTransactions = processedTransactions.filter(t => {
        const transactionDate = new Date(t.date);
        // For 'to' date, we usually want to include the whole day.
        const toDate = new Date(dateRange.to!);
        toDate.setHours(23, 59, 59, 999); // Set to end of day
        return !isNaN(transactionDate.getTime()) && transactionDate <= toDate;
      });
    }


    if (sortKey) {
      processedTransactions.sort((a, b) => {
        const valA = a[sortKey as keyof Transaction];
        const valB = b[sortKey as keyof Transaction];

        let comparison = 0;

        // Handle cases where one or both values might be undefined
        if (valA === undefined && valB === undefined) {
          comparison = 0;
        } else if (valA === undefined) { // valA is undefined, valB is defined
          comparison = 1; // Undefined values go last in ascending sort
        } else if (valB === undefined) { // valB is undefined, valA is defined
          comparison = -1; // Undefined values go last in ascending sort (so defined valA comes first)
        } else {
          // Both values are defined, proceed with type-specific comparison
          if (sortKey === 'amount') {
            comparison = (valA as number) - (valB as number);
          } else if (sortKey === 'date') {
            // Ensure dates are valid before comparing
            const dateA = new Date(valA as string).getTime();
            const dateB = new Date(valB as string).getTime();
            if (isNaN(dateA) && isNaN(dateB)) comparison = 0;
            else if (isNaN(dateA)) comparison = 1; // Invalid dates go last
            else if (isNaN(dateB)) comparison = -1; // Invalid dates go last
            else comparison = dateA - dateB;
          } else { // For string types (type, category, description)
            comparison = String(valA).localeCompare(String(valB));
          }
        }
        
        return sortOrder === 'asc' ? comparison : -comparison;
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
    <TableHead onClick={() => handleSort(columnKey)} className="cursor-pointer hover:bg-muted/50 text-xs sm:text-sm">
      <div className="flex items-center">
        {children}
        {sortKey === columnKey && <ArrowUpDown className="ml-2 h-4 w-4" />}
      </div>
    </TableHead>
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <Skeleton className="h-10 w-full md:w-1/3" />
          <Skeleton className="h-10 w-full md:w-1/4" />
          <Skeleton className="h-10 w-full md:w-1/4" />
          <Skeleton className="h-10 w-full md:w-1/6" />
        </div>
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
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
          value={filterCategory || ALL_CATEGORIES_VALUE} 
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

      <div className="rounded-lg border shadow-sm overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHeader columnKey="date">Date</SortableHeader>
              <SortableHeader columnKey="type">Type</SortableHeader>
              <SortableHeader columnKey="category">Category</SortableHeader>
              <SortableHeader columnKey="amount">Amount</SortableHeader>
              <TableHead className="text-xs sm:text-sm">Description</TableHead>
              {/* <TableHead>Actions</TableHead> */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedTransactions.length > 0 ? (
              filteredAndSortedTransactions.map(t => {
                const dateObj = new Date(t.date);
                // Check if dateObj is a valid date
                const displayDate = !isNaN(dateObj.getTime()) 
                                    ? format(dateObj, "MMM dd, yyyy") 
                                    : "Invalid Date";
                return (
                  <TableRow key={t.id} className="hover:bg-muted/20 transition-colors">
                    <TableCell className="text-xs sm:text-sm">{displayDate}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        t.type === 'income' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400'
                      }`}>
                        {t.type.charAt(0).toUpperCase() + t.type.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">{t.category}</TableCell>
                    <TableCell className={`text-xs sm:text-sm font-semibold ${t.type === 'income' ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
                      {t.amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm text-muted-foreground max-w-xs truncate">{t.description || '-'}</TableCell>
                    {/* <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Edit size={16} /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 size={16} /></Button>
                    </TableCell> */}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                  No transactions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
