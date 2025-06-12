
"use client";
import type { FC, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  isLoading?: boolean;
  className?: string;
  valueClassName?: string;
}

export const SummaryCard: FC<SummaryCardProps> = ({ title, value, icon, isLoading, className, valueClassName }) => {
  return (
    <Card className={`shadow-lg hover:shadow-xl transition-shadow duration-300 ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="text-primary">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className={`h-8 w-3/4 ${valueClassName || ''}`} />
        ) : (
          <div className={`text-2xl font-bold ${valueClassName || ''}`}>{typeof value === 'number' ? value.toLocaleString('en-IN', { style: 'currency', currency: 'INR' }) : value}</div>
        )}
        {/* Optional: Add a small description or percentage change here */}
      </CardContent>
    </Card>
  );
};
