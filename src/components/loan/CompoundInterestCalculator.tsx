
"use client";
import { useState, type FC } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, RefreshCcw, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CompoundCalculationResult {
  compoundInterest: number;
  totalAmount: number;
}

const compoundingFrequencies = [
  { label: 'Annually', value: 1 },
  { label: 'Semi-Annually', value: 2 },
  { label: 'Quarterly', value: 4 },
  { label: 'Monthly', value: 12 },
  // { label: 'Daily', value: 365 }, // Optional
];

export const CompoundInterestCalculator: FC = () => {
  const [principal, setPrincipal] = useState<string>('');
  const [rate, setRate] = useState<string>('');
  const [term, setTerm] = useState<string>(''); // Term in years
  const [compoundingFrequency, setCompoundingFrequency] = useState<string>(compoundingFrequencies[0].value.toString());
  const [result, setResult] = useState<CompoundCalculationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const handleCalculate = () => {
    setIsLoading(true);
    setResult(null);

    const p = parseFloat(principal);
    const r = parseFloat(rate); // Annual rate in percentage
    const t = parseFloat(term); // Term in years
    const n = parseInt(compoundingFrequency); // Compounding periods per year

    if (isNaN(p) || p <= 0) {
      toast({ title: "Invalid Input", description: "Principal amount must be a positive number.", variant: "destructive" });
      setIsLoading(false);
      return;
    }
    if (isNaN(r) || r <= 0) {
      toast({ title: "Invalid Input", description: "Annual interest rate must be a positive number.", variant: "destructive" });
      setIsLoading(false);
      return;
    }
    if (isNaN(t) || t <= 0) {
      toast({ title: "Invalid Input", description: "Loan term must be a positive number of years.", variant: "destructive" });
      setIsLoading(false);
      return;
    }
    if (isNaN(n) || n <= 0) {
      toast({ title: "Invalid Input", description: "Please select a valid compounding frequency.", variant: "destructive" });
      setIsLoading(false);
      return;
    }

    // Simulate calculation delay
    setTimeout(() => {
      const annualRateDecimal = r / 100;
      const totalAmount = p * Math.pow((1 + annualRateDecimal / n), n * t);
      const compoundInterest = totalAmount - p;

      setResult({
        compoundInterest,
        totalAmount,
      });
      setIsLoading(false);
      toast({ title: "Calculation Complete", description: "Compound interest details calculated successfully." });
    }, 500);
  };

  const handleReset = () => {
    setPrincipal('');
    setRate('');
    setTerm('');
    setCompoundingFrequency(compoundingFrequencies[0].value.toString());
    setResult(null);
    toast({ title: "Calculator Reset", description: "Input fields have been cleared." });
  };

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          <CardTitle className="text-xl font-headline">Compound Interest Calculator</CardTitle>
        </div>
        <CardDescription>Calculate interest that accrues on both principal and accumulated interest.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="compoundPrincipal">Principal Amount (INR)</Label>
            <Input
              id="compoundPrincipal"
              type="number"
              step="0.01"
              placeholder="e.g., 100000"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
              className="text-base"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="compoundRate">Annual Interest Rate (%)</Label>
            <Input
              id="compoundRate"
              type="number"
              step="0.01"
              placeholder="e.g., 8.5"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className="text-base"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="compoundTerm">Loan Term (Years)</Label>
            <Input
              id="compoundTerm"
              type="number"
              step="0.5"
              placeholder="e.g., 5"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className="text-base"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="compoundingFrequency">Compounding Frequency</Label>
            <Select value={compoundingFrequency} onValueChange={setCompoundingFrequency}>
              <SelectTrigger id="compoundingFrequency" className="text-base">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                {compoundingFrequencies.map(freq => (
                  <SelectItem key={freq.value} value={freq.value.toString()}>
                    {freq.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleCalculate} disabled={isLoading || !principal || !rate || !term || !compoundingFrequency} className="flex-1 sm:flex-none">
              <Calculator size={18} className="mr-2"/>
              {isLoading ? 'Calculating...' : 'Calculate Compound Interest'}
            </Button>
            <Button onClick={handleReset} variant="outline" className="flex-1 sm:flex-none">
              <RefreshCcw size={18} className="mr-2"/> Reset Fields
            </Button>
        </div>
      </CardContent>

      {result && (
        <CardFooter className="flex flex-col items-start space-y-4 pt-6 border-t bg-muted/20">
          <h3 className="text-lg font-semibold text-primary">Calculation Results:</h3>
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-3 border rounded-md bg-background shadow-sm">
              <p className="text-muted-foreground">Total Compound Interest:</p>
              <p className="font-bold text-lg">{result.compoundInterest.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            <div className="p-3 border rounded-md bg-background shadow-sm">
              <p className="text-muted-foreground">Total Amount (Principal + Interest):</p>
              <p className="font-bold text-lg">{result.totalAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};
