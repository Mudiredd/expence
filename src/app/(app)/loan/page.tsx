
"use client";
import { InterestCalculator } from '@/components/loan/InterestCalculator';
import { CompoundInterestCalculator } from '@/components/loan/CompoundInterestCalculator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Banknote, PlusCircle, Trash2, Edit3, Landmark, CalendarIcon, Wallet, AlertTriangle } from 'lucide-react';
import { useState, useEffect, useMemo, type FormEvent } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { Loan, LoanRatePeriod } from '@/types';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc, query, orderBy, Timestamp, writeBatch } from 'firebase/firestore';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const loanFormSchema = z.object({
  loanName: z.string().min(1, "Loan name is required."),
  lenderName: z.string().min(1, "Lender name is required."),
  principalAmount: z.coerce.number().positive("Principal amount must be positive."),
  interestRate: z.coerce.number().positive("Interest rate must be positive."),
  ratePeriod: z.enum(['year', 'month', 'rupees_per_100_per_month'] as [LoanRatePeriod, ...LoanRatePeriod[]], {
    required_error: "Rate period is required.",
  }),
  loanTermYears: z.coerce.number().positive("Loan term must be positive."),
  startDate: z.date({ required_error: "Start date is required." }),
});

type LoanFormData = z.infer<typeof loanFormSchema>;

export default function LoanPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoadingLoans, setIsLoadingLoans] = useState(true);
  const [isAddLoanDialogOpen, setIsAddLoanDialogOpen] = useState(false);
  
  const [isMakePaymentDialogOpen, setIsMakePaymentDialogOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [selectedLoanForPayment, setSelectedLoanForPayment] = useState<Loan | null>(null);

  const [loanToDelete, setLoanToDelete] = useState<Loan | null>(null);
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);


  const { toast } = useToast();

  const { control, handleSubmit, register, reset, formState: { errors, isSubmitting: isSavingLoan } } = useForm<LoanFormData>({
    resolver: zodResolver(loanFormSchema),
    defaultValues: {
      loanName: '',
      lenderName: '',
      principalAmount: undefined,
      interestRate: undefined,
      ratePeriod: 'year',
      loanTermYears: undefined,
      startDate: new Date(),
    }
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (!user) {
        setLoans([]);
        setIsLoadingLoans(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchLoans(currentUser.uid);
    }
  }, [currentUser]);

  const fetchLoans = async (userId: string) => {
    setIsLoadingLoans(true);
    try {
      const loansColRef = collection(db, 'users', userId, 'loans');
      const q = query(loansColRef, orderBy('startDate', 'desc'));
      const querySnapshot = await getDocs(q);
      const fetchedLoans: Loan[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedLoans.push({
          id: doc.id,
          userId: userId,
          loanName: data.loanName,
          lenderName: data.lenderName,
          principalAmount: data.principalAmount,
          interestRate: data.interestRate,
          ratePeriod: data.ratePeriod,
          loanTermYears: data.loanTermYears,
          startDate: (data.startDate instanceof Timestamp) ? data.startDate.toDate().toISOString().split('T')[0] : data.startDate,
          totalAmountPaid: data.totalAmountPaid || 0,
        });
      });
      setLoans(fetchedLoans);
    } catch (error) {
      console.error("Error fetching loans:", error);
      toast({ title: "Error", description: "Could not fetch loans.", variant: "destructive" });
    } finally {
      setIsLoadingLoans(false);
    }
  };

  const handleSaveNewLoan = async (data: LoanFormData) => {
    if (!currentUser) return;
    try {
      const loansColRef = collection(db, 'users', currentUser.uid, 'loans');
      const newLoanDoc = {
        ...data,
        userId: currentUser.uid,
        startDate: Timestamp.fromDate(data.startDate),
        totalAmountPaid: 0,
      };
      const docRef = await addDoc(loansColRef, newLoanDoc);
      setLoans(prev => [{ ...data, id: docRef.id, userId: currentUser.uid, startDate: format(data.startDate, 'yyyy-MM-dd'), totalAmountPaid: 0 }, ...prev].sort((a,b) => parseISO(b.startDate).getTime() - parseISO(a.startDate).getTime()));
      toast({ title: "Loan Added", description: `"${data.loanName}" has been successfully added.` });
      reset();
      setIsAddLoanDialogOpen(false);
    } catch (error) {
      console.error("Error adding loan:", error);
      toast({ title: "Error", description: "Failed to add loan. Please try again.", variant: "destructive" });
    }
  };

  const confirmDeleteLoan = (loan: Loan) => {
    setLoanToDelete(loan);
    setIsConfirmDeleteDialogOpen(true);
  };

  const handleDeleteLoan = async () => {
    if (!currentUser || !loanToDelete) return;
    try {
      await deleteDoc(doc(db, 'users', currentUser.uid, 'loans', loanToDelete.id));
      setLoans(prev => prev.filter(l => l.id !== loanToDelete.id));
      toast({ title: "Loan Deleted", description: `"${loanToDelete.loanName}" has been removed.`, variant: "destructive" });
    } catch (error) {
      console.error("Error deleting loan:", error);
      toast({ title: "Error", description: "Failed to delete loan.", variant: "destructive" });
    } finally {
      setIsConfirmDeleteDialogOpen(false);
      setLoanToDelete(null);
    }
  };
  
  const openMakePaymentDialog = (loan: Loan) => {
    setSelectedLoanForPayment(loan);
    setPaymentAmount('');
    setIsMakePaymentDialogOpen(true);
  };

  const handleMakePayment = async () => {
    if (!currentUser || !selectedLoanForPayment || !paymentAmount) return;
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: "Invalid Amount", description: "Please enter a positive number for payment.", variant: "destructive" });
      return;
    }

    const loanRef = doc(db, 'users', currentUser.uid, 'loans', selectedLoanForPayment.id);
    const newTotalAmountPaid = (selectedLoanForPayment.totalAmountPaid || 0) + amount;

    try {
      await updateDoc(loanRef, {
        totalAmountPaid: newTotalAmountPaid
      });
      setLoans(prevLoans => prevLoans.map(l => 
        l.id === selectedLoanForPayment.id ? { ...l, totalAmountPaid: newTotalAmountPaid } : l
      ));
      toast({ title: "Payment Made", description: `${amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })} paid for "${selectedLoanForPayment.loanName}".` });
      setIsMakePaymentDialogOpen(false);
      setSelectedLoanForPayment(null);
      setPaymentAmount('');
    } catch (error) {
      console.error("Error making payment:", error);
      toast({ title: "Payment Failed", description: "Could not record payment.", variant: "destructive" });
    }
  };

  // Placeholder for Edit functionality
  const handleEditLoan = (loan: Loan) => {
    toast({ title: "Edit Not Implemented", description: "Editing loan details is coming soon!" });
  };

  const calculateRepaymentProgress = (loan: Loan) => {
    if (loan.principalAmount === 0) return 0;
    return Math.min(100, (loan.totalAmountPaid / loan.principalAmount) * 100);
  };
  
  const remainingBalance = (loan: Loan) => {
    // This is a simplified remaining balance. True remaining balance requires amortization.
    return Math.max(0, loan.principalAmount - loan.totalAmountPaid);
  };


  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-headline flex items-center">
          <Banknote size={32} className="mr-3 text-primary" />
          Loan Management & Interest Calculators
        </h1>
      </div>

      <InterestCalculator />
      <div className="mt-8"><CompoundInterestCalculator /></div>

      {/* My Loans Section */}
      <Card className="shadow-xl mt-8">
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle className="text-xl font-headline flex items-center"><Landmark className="mr-2 h-5 w-5 text-primary"/>My Loans</CardTitle>
            <CardDescription>Track and manage your active loans here.</CardDescription>
          </div>
          <Button onClick={() => { reset(); setIsAddLoanDialogOpen(true); }}>
            <PlusCircle size={18} className="mr-2" /> Add New Loan
          </Button>
        </CardHeader>
        <CardContent>
          {isLoadingLoans && <p>Loading loans...</p>}
          {!isLoadingLoans && loans.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              <Wallet size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg">No loans added yet.</p>
              <p>Click "Add New Loan" to get started.</p>
            </div>
          )}
          {!isLoadingLoans && loans.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {loans.map((loan, index) => (
                <Card key={loan.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300 animate-fadeIn" style={{animationDelay: `${index * 100}ms`}}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="font-headline text-lg">{loan.loanName}</CardTitle>
                        <CardDescription>Lender: {loan.lenderName}</CardDescription>
                      </div>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEditLoan(loan)} className="h-8 w-8" aria-label="Edit loan">
                          <Edit3 size={16} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => confirmDeleteLoan(loan)} className="h-8 w-8 text-destructive hover:text-destructive-foreground hover:bg-destructive/90" aria-label="Delete loan">
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm space-y-1">
                      <p><strong>Principal:</strong> {loan.principalAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</p>
                      <p><strong>Rate:</strong> {loan.interestRate}% {
                        { year: 'p.a.', month: 'p.m.', rupees_per_100_per_month: 'per ₹100 p.m.' }[loan.ratePeriod]
                      }</p>
                      <p><strong>Term:</strong> {loan.loanTermYears} Year(s)</p>
                      <p><strong>Start Date:</strong> {format(parseISO(loan.startDate), 'MMM dd, yyyy')}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Repayment Progress</Label>
                      <Progress value={calculateRepaymentProgress(loan)} className="h-2.5 mt-1" />
                      <div className="flex justify-between text-xs mt-1">
                        <span>Paid: {loan.totalAmountPaid.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                        <span>Remaining: {remainingBalance(loan).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })} (Principal)</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => openMakePaymentDialog(loan)}>
                      <Wallet size={16} className="mr-2"/> Make Payment
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Loan Dialog */}
      <Dialog open={isAddLoanDialogOpen} onOpenChange={setIsAddLoanDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Loan</DialogTitle>
            <DialogDescription>Enter the details of your new loan.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleSaveNewLoan)} className="space-y-4 py-2">
            <div className="space-y-1">
              <Label htmlFor="loanName">Loan Name</Label>
              <Input id="loanName" {...register('loanName')} placeholder="e.g., Home Loan, Car Loan" />
              {errors.loanName && <p className="text-sm text-destructive">{errors.loanName.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="lenderName">Lender Name</Label>
              <Input id="lenderName" {...register('lenderName')} placeholder="e.g., HDFC Bank, SBI" />
              {errors.lenderName && <p className="text-sm text-destructive">{errors.lenderName.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="principalAmount">Principal Amount (INR)</Label>
                <Input id="principalAmount" type="number" step="0.01" {...register('principalAmount')} placeholder="e.g., 500000" />
                {errors.principalAmount && <p className="text-sm text-destructive">{errors.principalAmount.message}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="loanTermYears">Loan Term (Years)</Label>
                <Input id="loanTermYears" type="number" step="0.1" {...register('loanTermYears')} placeholder="e.g., 5" />
                {errors.loanTermYears && <p className="text-sm text-destructive">{errors.loanTermYears.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <Label htmlFor="interestRate">Interest Rate (%)</Label>
                    <Input id="interestRate" type="number" step="0.01" {...register('interestRate')} placeholder="e.g., 8.5" />
                    {errors.interestRate && <p className="text-sm text-destructive">{errors.interestRate.message}</p>}
                </div>
                <Controller
                    name="ratePeriod"
                    control={control}
                    render={({ field }) => (
                        <div className="space-y-1">
                        <Label htmlFor="ratePeriod">Rate Period</Label>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger id="ratePeriod"><SelectValue /></SelectTrigger>
                            <SelectContent>
                            <SelectItem value="year">Per Year</SelectItem>
                            <SelectItem value="month">Per Month (%)</SelectItem>
                            <SelectItem value="rupees_per_100_per_month">₹ per ₹100 / month</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.ratePeriod && <p className="text-sm text-destructive">{errors.ratePeriod.message}</p>}
                        </div>
                    )}
                />
            </div>
             <Controller
              name="startDate"
              control={control}
              render={({ field }) => (
                <div className="space-y-1">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button id="startDate" variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus disabled={(date) => date > new Date()} /></PopoverContent>
                  </Popover>
                  {errors.startDate && <p className="text-sm text-destructive">{errors.startDate.message}</p>}
                </div>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddLoanDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSavingLoan}>{isSavingLoan ? "Saving..." : "Save Loan"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Make Payment Dialog */}
      <Dialog open={isMakePaymentDialogOpen} onOpenChange={(isOpen) => {
          setIsMakePaymentDialogOpen(isOpen);
          if (!isOpen) setSelectedLoanForPayment(null);
      }}>
        <DialogContent className="sm:max-w-md">
          {selectedLoanForPayment && (
            <>
              <DialogHeader>
                <DialogTitle>Make Payment for "{selectedLoanForPayment.loanName}"</DialogTitle>
                <DialogDescription>
                  Principal: {selectedLoanForPayment.principalAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })} <br/>
                  Total Paid: {selectedLoanForPayment.totalAmountPaid.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2 py-3">
                <Label htmlFor="paymentAmount">Payment Amount (INR)</Label>
                <Input
                  id="paymentAmount"
                  type="number"
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="e.g., 5000"
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsMakePaymentDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleMakePayment}>Confirm Payment</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

       {/* Confirm Delete Dialog */}
      <AlertDialog open={isConfirmDeleteDialogOpen} onOpenChange={setIsConfirmDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center"><AlertTriangle className="mr-2 h-5 w-5 text-destructive"/>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the loan "{loanToDelete?.loanName}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setLoanToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteLoan}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Loan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
