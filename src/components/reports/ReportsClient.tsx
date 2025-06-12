
"use client";
import type { FC } from 'react';
import { useMemo } from 'react';
import { useTransactions } from '@/contexts/TransactionContext';
import type { Transaction, MonthlySummary, ChartDataPoint } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Sector } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const COLORS_CATEGORIES = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

const getMonthYear = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('default', { month: 'short', year: 'numeric' });
};

const ReportsClient: FC = () => {
  const { transactions, loading } = useTransactions();

  const monthlySummaryData: MonthlySummary[] = useMemo(() => {
    const summary: Record<string, { income: number; expenses: number }> = {};
    transactions.forEach(t => {
      const monthYear = getMonthYear(t.date);
      if (!summary[monthYear]) {
        summary[monthYear] = { income: 0, expenses: 0 };
      }
      if (t.type === 'income') {
        summary[monthYear].income += t.amount;
      } else {
        summary[monthYear].expenses += t.amount;
      }
    });
    
    const sortedMonths = Object.keys(summary).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    return sortedMonths.map(month => ({
      month,
      income: summary[month].income,
      expenses: summary[month].expenses,
    }));
  }, [transactions]);

  const expenseByCategoryData: ChartDataPoint[] = useMemo(() => {
    const categoryMap: Record<string, number> = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
      });
    return Object.entries(categoryMap)
      .map(([name, value], index) => ({ 
        name, 
        value,
        fill: COLORS_CATEGORIES[index % COLORS_CATEGORIES.length] 
      }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Skeleton className="h-96 rounded-lg" />
        <Skeleton className="h-96 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 animate-fadeIn">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-xl">Monthly Income vs. Expenses</CardTitle>
          <CardDescription>Visualize your financial flow over time.</CardDescription>
        </CardHeader>
        <CardContent>
          {monthlySummaryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={monthlySummaryData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis dataKey="month" className="text-xs"/>
                <YAxis className="text-xs" tickFormatter={(value) => `₹${value/1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)'}}
                  labelClassName="font-semibold"
                  formatter={(value: number) => value.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                />
                <Legend wrapperStyle={{fontSize: "0.875rem"}} />
                <Bar dataKey="income" name="Income" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted-foreground py-10">No data available for monthly summary.</p>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-xl">Expenses by Category</CardTitle>
          <CardDescription>See where your money is going.</CardDescription>
        </CardHeader>
        <CardContent>
          {expenseByCategoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={expenseByCategoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={120}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {expenseByCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)'}}
                  formatter={(value: number, name: string) => [value.toLocaleString('en-IN', { style: 'currency', currency: 'INR' }), name]}
                />
                <Legend wrapperStyle={{fontSize: "0.875rem"}} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted-foreground py-10">No expense data available for category breakdown.</p>
          )}
        </CardContent>
      </Card>
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

export default ReportsClient;
