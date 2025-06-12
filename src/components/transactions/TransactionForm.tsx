
"use client";
import type { FC } from 'react';
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useTransactions } from '@/contexts/TransactionContext';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, CheckCircle, IndianRupee } from 'lucide-react'; // Changed CircleDollarSign to IndianRupee
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const transactionFormSchema = z.object({
  type: z.enum(['income', 'expense'], { required_error: "Transaction type is required." }),
  category: z.string().min(1, "Category is required.").max(50, "Category too long."),
  amount: z.coerce.number().positive("Amount must be positive."),
  date: z.date({ required_error: "Date is required." }),
  description: z.string().max(100, "Description too long.").optional(),
});

type TransactionFormData = z.infer<typeof transactionFormSchema>;

const defaultCategories = {
  income: ["Salary", "Freelance", "Investment", "Bonus", "Gift", "Other"],
  expense: ["Food", "Transport", "Housing", "Utilities", "Entertainment", "Healthcare", "Shopping", "Education", "Other"],
};

export const TransactionForm: FC = () => {
  const { addTransaction } = useTransactions();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const { control, handleSubmit, register, watch, reset, formState: { errors } } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      type: 'expense',
      category: '', // Initialize category
      amount: '' as unknown as number, // Initialize amount for controlled input, Zod will coerce
      date: new Date(),
      description: '', // Initialize description
    }
  });

  const transactionType = watch('type');

  const onSubmit = (data: TransactionFormData) => {
    setIsLoading(true);
    try {
      addTransaction({
        ...data,
        date: format(data.date, 'yyyy-MM-dd'), // Store date as string
      });
      toast({
        title: "Transaction Added",
        description: `${data.type === 'income' ? 'Income' : 'Expense'} of ${data.amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })} recorded.`,
        action: <CheckCircle className="text-green-500" />,
      });
      reset(); // Reset form after successful submission
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add transaction. Please try again.",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <div className="flex items-center space-x-2 mb-2">
            <IndianRupee className="h-8 w-8 text-primary" /> {/* Changed Icon Here */}
            <CardTitle className="text-2xl font-headline">Record Transaction</CardTitle>
        </div>
        <CardDescription>Add a new income or expense to your records.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
                </div>
              )}
            />

            <Controller
              name="date"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        disabled={(date) => date > new Date() || date < new Date("2000-01-01")}
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
                </div>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                    <Input list="category-suggestions" {...field} id="category" placeholder="e.g., Food, Salary" />
                )}
              />
              <datalist id="category-suggestions">
                {(transactionType ? defaultCategories[transactionType] : []).map(cat => <option key={cat} value={cat} />)}
              </datalist>
              {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (INR)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('amount')}
              />
              {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="e.g., Groceries for the week"
              {...register('description')}
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
          </div>

          <Button type="submit" className="w-full md:w-auto text-base py-3" disabled={isLoading}>
            {isLoading ? "Adding..." : "Add Transaction"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
