"use client";
import type { FC, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type React from 'react';

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  isLoading?: boolean;
  className?: string;
  valueClassName?: string;
  style?: React.CSSProperties; // Added style prop
}

export const SummaryCard: FC<SummaryCardProps> = ({ title, value, icon, isLoading, className, valueClassName, style }) => {
  return (
    <Card 
      style={style} // Pass style prop to Card
      className={`shadow-lg hover:shadow-2xl hover:-translate-y-1 hover:ring-2 hover:ring-primary/20 dark:hover:ring-primary/30 transition-all duration-300 ease-in-out ${className}`}
    >
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

