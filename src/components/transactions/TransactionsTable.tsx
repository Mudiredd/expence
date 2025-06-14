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
import { ArrowUpDown, Search, Filter, CalendarDays } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { DateRange } from "react-day-picker"
import { cn } from '@/lib/utils';

type SortKey = keyof Transaction | '';
type SortOrder = 'asc' | 'desc';

interface TransactionsTableProps {
  onSelect?: (transaction: Transaction) => void;
}

const ALL_CATEGORIES_VALUE = "_all_";

export const TransactionsTable: FC<TransactionsTableProps> = ({ onSelect }) => {
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
    try {
      let processedTransactions = [...transactions];

      // Apply search filter
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase();
        processedTransactions = processedTransactions.filter(t =>
          t.category.toLowerCase().includes(searchLower) ||
          t.description?.toLowerCase().includes(searchLower) ||
          false
        );
      }

      // Apply type filter
      if (filterType !== 'all') {
        processedTransactions = processedTransactions.filter(t => t.type === filterType);
      }

      // Apply category filter
      if (filterCategory) {
        processedTransactions = processedTransactions.filter(t => t.category === filterCategory);
      }

      // Apply date range filter
      if (dateRange?.from) {
        const fromDate = dateRange.from.setHours(0, 0, 0, 0);
        processedTransactions = processedTransactions.filter(t => 
          new Date(t.date).getTime() >= fromDate
        );
      }
      if (dateRange?.to) {
        const toDate = dateRange.to.setHours(23, 59, 59, 999);
        processedTransactions = processedTransactions.filter(t => 
          new Date(t.date).getTime() <= toDate
        );
      }

      // Apply sorting
      if (sortKey) {
        processedTransactions.sort((a, b) => {
          try {
            switch (sortKey) {
              case 'date':
                return sortOrder === 'asc'
                  ? new Date(a.date).getTime() - new Date(b.date).getTime()
                  : new Date(b.date).getTime() - new Date(a.date).getTime();
              case 'amount':
                return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
              case 'type':
              case 'category':
                const aVal = a[sortKey]?.toString().toLowerCase() ?? '';
                const bVal = b[sortKey]?.toString().toLowerCase() ?? '';
                return sortOrder === 'asc'
                  ? aVal.localeCompare(bVal)
                  : bVal.localeCompare(aVal);
              default:
                return 0;
            }
          } catch (error) {
            console.error('Sorting error:', error);
            return 0;
          }
        });
      }

      return processedTransactions;
    } catch (error) {
      console.error('Error processing transactions:', error);
      return [];
    }
  }, [transactions, searchTerm, filterType, filterCategory, sortKey, sortOrder, dateRange]);

  const handleSort = (key: SortKey) => {
    setSortOrder(prevOrder => sortKey === key && prevOrder === 'asc' ? 'desc' : 'asc');
    setSortKey(key);
  };

  const SortableHeader: FC<{ columnKey: SortKey; children: React.ReactNode }> = ({ columnKey, children }) => (
    <TableHead 
      onClick={() => handleSort(columnKey)} 
      className="cursor-pointer hover:bg-muted/50 text-xs sm:text-sm whitespace-nowrap"
    >
      <div className="flex items-center">
        {children}
        {sortKey === columnKey && (
          <ArrowUpDown className="ml-2 h-4 w-4 shrink-0" />
        )}
      </div>
    </TableHead>
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-4 p-4 border rounded-lg">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
        <div className="rounded-lg border">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 sm:h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters Section */}
      <div className="flex flex-col gap-4 p-4 border rounded-lg bg-card">
        {/* Search Input */}
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-sm w-full"
          />
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Select value={filterType} onValueChange={(value) => setFilterType(value as TransactionType | 'all')}>
            <SelectTrigger className="h-9">
              <Filter className="mr-2 h-4 w-4 text-muted-foreground"/>
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filterCategory || ALL_CATEGORIES_VALUE}
            onValueChange={(value) => setFilterCategory(value === ALL_CATEGORIES_VALUE ? '' : value)}
          >
            <SelectTrigger className="h-9">
              <Filter className="mr-2 h-4 w-4 text-muted-foreground"/>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_CATEGORIES_VALUE}>All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="h-9 px-3 text-sm justify-start font-normal"
              >
                <CalendarDays className="mr-2 h-4 w-4" />
                <span className="truncate">
                  {dateRange?.from ? (
                    dateRange.to ? (
                      `${format(dateRange.from, "MMM d")} - ${format(dateRange.to, "MMM d")}`
                    ) : (
                      format(dateRange.from, "MMM d")
                    )
                  ) : (
                    "Date Range"
                  )}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={1}
                className="rounded-md border"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Transactions List */}
      <div className="rounded-lg border shadow-sm bg-card divide-y">
        {filteredAndSortedTransactions.length > 0 ? (
          filteredAndSortedTransactions.map((t) => (
            <div
              key={t.id}
              onClick={() => onSelect?.(t)}
              className="cursor-pointer hover:bg-muted/50 active:bg-muted/70 transition-colors p-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="flex items-center justify-between flex-1">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-sm font-semibold",
                        t.type === 'income'
                          ? 'text-green-600 dark:text-green-500'
                          : 'text-red-600 dark:text-red-500'
                      )}>
                        {t.amount.toLocaleString('en-IN', { 
                          style: 'currency', 
                          currency: 'INR',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0
                        })}
                      </span>
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        t.type === 'income' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400'
                      )}>
                        {t.type.charAt(0).toUpperCase() + t.type.slice(1)}
                      </span>
                    </div>
                    <div className="mt-1">
                      <span className="text-sm font-medium">{t.category}</span>
                      {t.description && (
                        <p className="text-sm text-muted-foreground truncate max-w-[250px]">
                          {t.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(t.date), "MMM dd, yyyy")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="h-32 flex items-center justify-center text-muted-foreground">
            No transactions found
          </div>
        )}
      </div>
    </div>
  );
};
