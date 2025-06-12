
"use client";
import { useState, type FC } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, RefreshCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CalculationResult {
  simpleInterest: number;
  totalAmount: number;
  monthlyPayment: number;
}

export const InterestCalculator: FC = () => {
  const [principal, setPrincipal] = useState<string>('');
  const [rate, setRate] = useState<string>('');
  const [term, setTerm] = useState<string>(''); // Term in years
  const [ratePeriod, setRatePeriod] = useState<string>('year'); // 'year' or 'month'
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const handleCalculate = () => {
    setIsLoading(true);
    setResult(null);

    const p = parseFloat(principal);
    let r = parseFloat(rate); // Interest rate in percentage
    const t = parseFloat(term); // Term in years

    if (isNaN(p) || p <= 0) {
      toast({ title: "Invalid Input", description: "Principal amount must be a positive number.", variant: "destructive" });
      setIsLoading(false);
      return;
    }
    if (isNaN(r) || r <= 0) {
      toast({ title: "Invalid Input", description: "Interest rate must be a positive number.", variant: "destructive" });
      setIsLoading(false);
      return;
    }
    if (isNaN(t) || t <= 0) {
      toast({ title: "Invalid Input", description: "Loan term must be a positive number of years.", variant: "destructive" });
      setIsLoading(false);
      return;
    }

    // Convert monthly rate to annual rate if needed
    const annualRatePercent = ratePeriod === 'month' ? r * 12 : r;

    // Simulate calculation delay
    setTimeout(() => {
      const annualRateDecimal = annualRatePercent / 100;
      const simpleInterest = p * annualRateDecimal * t;
      const totalAmount = p + simpleInterest;
      const monthlyPayment = totalAmount / (t * 12);

      setResult({
        simpleInterest,
        totalAmount,
        monthlyPayment,
      });
      setIsLoading(false);
      toast({ title: "Calculation Complete", description: "Interest details calculated successfully." });
    }, 500);
  };

  const handleReset = () => {
    setPrincipal('');
    setRate('');
    setTerm('');
    setRatePeriod('year');
    setResult(null);
    toast({ title: "Calculator Reset", description: "Input fields have been cleared." });
  };

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Calculator className="h-6 w-6 text-primary" />
          <CardTitle className="text-xl font-headline">Simple Interest Calculator</CardTitle>
        </div>
        <CardDescription>Calculate simple interest, total repayment, and estimated monthly payments.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="principal">Principal Amount (INR)</Label>
            <Input
              id="principal"
              type="number"
              step="0.01"
              placeholder="e.g., 100000"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
              className="text-base"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rate">Interest Rate (%)</Label>
            <div className="flex gap-2">
              <Input
                id="rate"
                type="number"
                step="0.01"
                placeholder="e.g., 8.5"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className="text-base"
              />
              <Select value={ratePeriod} onValueChange={setRatePeriod}>
                <SelectTrigger className="w-[120px] text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="year">Per Year</SelectItem>
                  <SelectItem value="month">Per Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="term">Loan Term (Years)</Label>
            <Input
              id="term"
              type="number"
              step="0.1" // Allow for terms like 1.5 years
              placeholder="e.g., 5"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className="text-base"
            />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleCalculate} disabled={isLoading || !principal || !rate || !term} className="flex-1 sm:flex-none">
              <Calculator size={18} className="mr-2"/>
              {isLoading ? 'Calculating...' : 'Calculate Interest'}
            </Button>
            <Button onClick={handleReset} variant="outline" className="flex-1 sm:flex-none">
              <RefreshCcw size={18} className="mr-2"/> Reset Fields
            </Button>
        </div>
      </CardContent>

      {result && (
        <CardFooter className="flex flex-col items-start space-y-4 pt-6 border-t bg-muted/20">
          <h3 className="text-lg font-semibold text-primary">Calculation Results:</h3>
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-3 border rounded-md bg-background shadow-sm">
              <p className="text-muted-foreground">Simple Interest:</p>
              <p className="font-bold text-lg">{result.simpleInterest.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            <div className="p-3 border rounded-md bg-background shadow-sm">
              <p className="text-muted-foreground">Total Amount Payable:</p>
              <p className="font-bold text-lg">{result.totalAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            <div className="p-3 border rounded-md bg-background shadow-sm">
              <p className="text-muted-foreground">Estimated Monthly Payment:</p>
              <p className="font-bold text-lg">{result.monthlyPayment.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
          </div>
           <p className="text-xs text-muted-foreground mt-2">*Monthly payment calculated based on simple interest spread evenly over the loan term.</p>
        </CardFooter>
      )}
    </Card>
  );
};
