
"use client";
import { InterestCalculator } from '@/components/loan/InterestCalculator';
import { CompoundInterestCalculator } from '@/components/loan/CompoundInterestCalculator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Banknote } from 'lucide-react';

// No Next.js metadata for client components directly, title is handled by AppHeader

export default function LoanPage() {
  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-headline flex items-center">
          <Banknote size={32} className="mr-3 text-primary" />
          Loan Management & Interest Calculators
        </h1>
      </div>

      <InterestCalculator />

      <div className="mt-8">
        <CompoundInterestCalculator />
      </div>

      <Card className="shadow-lg mt-8">
        <CardHeader>
          <CardTitle>My Loans</CardTitle>
          <CardDescription>Track and manage your active loans here.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loan tracking feature coming soon!</p>
          <div className="mt-4 p-6 border rounded-lg bg-muted/30">
            <h4 className="font-semibold mb-2">Future Features:</h4>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Add new loans with details (lender, amount, rate, term, start date).</li>
              <li>View a list of all your active and paid-off loans.</li>
              <li>Track payment schedules and remaining balances.</li>
              <li>Set reminders for upcoming loan payments.</li>
              <li>Visualize loan amortization.</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
