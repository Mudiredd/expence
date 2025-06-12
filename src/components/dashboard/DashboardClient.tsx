"use client";
import type { FC } from 'react';
import { useState, useEffect, useMemo } from 'react';
import { ArrowDownCircle, ArrowUpCircle, DollarSign, TrendingUp, TrendingDown, Scale } from 'lucide-react';
import { SummaryCard } from './SummaryCard';
import { useTransactions } from '@/contexts/TransactionContext';
import type { Transaction, MonthlySummary } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Sector } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const COLORS_CATEGORIES = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

// Helper to format date to "Month Year"
const getMonthYear = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('default', { month: 'short', year: 'numeric' });
};

const DashboardClient: FC = () => {
  const { transactions, loading: transactionsLoading } = useTransactions();
  const [currentMonthYear, setCurrentMonthYear] = useState('');

  useEffect(() => {
    setCurrentMonthYear(getMonthYear(new Date().toISOString()));
  }, []);

  const currentMonthTransactions = useMemo(() => {
    if (!currentMonthYear) return [];
    return transactions.filter(t => getMonthYear(t.date) === currentMonthYear);
  }, [transactions, currentMonthYear]);

  const summary = useMemo(() => {
    const income = currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      income,
      expenses,
      balance: income - expenses,
    };
  }, [currentMonthTransactions]);

  const monthlyChartData = useMemo(() => {
    const monthlyMap: Record<string, { income: number; expenses: number }> = {};
    transactions.forEach(t => {
      const monthYear = getMonthYear(t.date);
      if (!monthlyMap[monthYear]) {
        monthlyMap[monthYear] = { income: 0, expenses: 0 };
      }
      if (t.type === 'income') {
        monthlyMap[monthYear].income += t.amount;
      } else {
        monthlyMap[monthYear].expenses += t.amount;
      }
    });
    
    const sortedMonths = Object.keys(monthlyMap).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    
    // Take last 6 months or all if less than 6
    const recentMonths = sortedMonths.slice(-6);

    return recentMonths.map(month => ({
      name: month,
      Income: monthlyMap[month].income,
      Expenses: monthlyMap[month].expenses,
    }));
  }, [transactions]);
  
  const expenseByCategoryData = useMemo(() => {
    const categoryMap: Record<string, number> = {};
    currentMonthTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
      });
    return Object.entries(categoryMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value); // Sort for consistent pie chart display
  }, [currentMonthTransactions]);


  if (transactionsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1,2,3].map(i => <Skeleton key={i} className="h-32 rounded-lg" />)}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-80 rounded-lg" />
            <Skeleton className="h-80 rounded-lg" />
        </div>
      </div>
    )
  }


  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <SummaryCard title="Total Income" value={summary.income} icon={<ArrowUpCircle size={24} />} isLoading={transactionsLoading} valueClassName="text-green-600 dark:text-green-500" />
        <SummaryCard title="Total Expenses" value={summary.expenses} icon={<ArrowDownCircle size={24} />} isLoading={transactionsLoading} valueClassName="text-red-600 dark:text-red-500" />
        <SummaryCard title="Balance" value={summary.balance} icon={<Scale size={24} />} isLoading={transactionsLoading} valueClassName={summary.balance >= 0 ? 'text-blue-600 dark:text-blue-500' : 'text-orange-600 dark:text-orange-500'} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Monthly Overview (Last 6 Months)</CardTitle>
            <CardDescription>Income vs. Expenses trends.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" tickFormatter={(value) => `$${value/1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)'}}
                  labelClassName="font-semibold"
                  formatter={(value: number) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                />
                <Legend wrapperStyle={{fontSize: "0.875rem"}}/>
                <Bar dataKey="Income" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expenses" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Expenses by Category (Current Month)</CardTitle>
            <CardDescription>Breakdown of your spending.</CardDescription>
          </CardHeader>
          <CardContent>
            {expenseByCategoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expenseByCategoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {expenseByCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS_CATEGORIES[index % COLORS_CATEGORIES.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)'}}
                    formatter={(value: number, name: string) => [value.toLocaleString('en-US', { style: 'currency', currency: 'USD' }), name]}
                  />
                  <Legend wrapperStyle={{fontSize: "0.875rem"}}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-10">No expense data for this month.</p>
            )}
          </CardContent>
        </Card>
      </div>
      <style jsx global>{`
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default DashboardClient;
