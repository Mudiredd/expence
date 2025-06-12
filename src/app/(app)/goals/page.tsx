
"use client";
// import type { Metadata } from 'next'; // TODO: Add metadata back once supported
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Target, PlusCircle, Edit3, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

// export const metadata: Metadata = {
//   title: 'Financial Goals | Vishnu Finance Tracker',
// };

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');

  const [goalToUpdateId, setGoalToUpdateId] = useState<string | null>(null);
  const [isAddFundsModalOpen, setIsAddFundsModalOpen] = useState(false);
  const [fundAmountInput, setFundAmountInput] = useState('');

  const { toast } = useToast();

  const handleAddGoal = () => {
    if (!newGoalName || !newGoalTarget) return;
    const newGoal: Goal = {
      id: Date.now().toString(),
      name: newGoalName,
      targetAmount: parseFloat(newGoalTarget),
      currentAmount: 0,
    };
    setGoals([...goals, newGoal]);
    setNewGoalName('');
    setNewGoalTarget('');
    setIsAddingGoal(false);
    toast({ title: "Goal Created", description: `Your goal "${newGoal.name}" has been added.` });
  };

  const handleDeleteGoal = (id: string) => {
    const goalToDelete = goals.find(goal => goal.id === id);
    setGoals(goals.filter(goal => goal.id !== id));
    if (goalToDelete) {
      toast({ title: "Goal Deleted", description: `Goal "${goalToDelete.name}" has been removed.`, variant: "destructive" });
    }
  };
  
  const handleEditGoal = (id: string) => {
    console.log("Editing goal:", id);
    // Placeholder for future editing functionality using a similar dialog pattern
    toast({ title: "Edit Not Implemented", description: "Editing goal details is coming soon!" });
  };

  const openAddFundsModal = (goalId: string) => {
    setGoalToUpdateId(goalId);
    setFundAmountInput(''); // Clear previous input
    setIsAddFundsModalOpen(true);
  };

  const handleConfirmAddFunds = () => {
    if (!goalToUpdateId || !fundAmountInput) {
      toast({ title: "Error", description: "Goal or amount not specified.", variant: "destructive" });
      return;
    }

    const amount = parseFloat(fundAmountInput);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: "Invalid Amount", description: "Please enter a positive number.", variant: "destructive" });
      return;
    }

    let updatedGoalName = "";
    setGoals(prevGoals =>
      prevGoals.map(g => {
        if (g.id === goalToUpdateId) {
          updatedGoalName = g.name;
          return { ...g, currentAmount: g.currentAmount + amount };
        }
        return g;
      })
    );
    
    if (updatedGoalName) {
      toast({
        title: "Funds Added",
        description: `${amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })} added to "${updatedGoalName}".`,
      });
    }

    setIsAddFundsModalOpen(false);
    setGoalToUpdateId(null);
    setFundAmountInput("");
  };

  const goalBeingUpdated = goals.find(g => g.id === goalToUpdateId);

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-headline flex items-center">
          <Target size={32} className="mr-3 text-primary" />
          Financial Goals
        </h1>
        <Button onClick={() => setIsAddingGoal(!isAddingGoal)}>
          <PlusCircle size={18} className="mr-2" />
          {isAddingGoal ? 'Cancel' : 'Add New Goal'}
        </Button>
      </div>

      {isAddingGoal && (
        <Card className="shadow-lg transition-all duration-300 ease-in-out">
          <CardHeader>
            <CardTitle>Create New Goal</CardTitle>
            <CardDescription>Set up a new financial target.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="goalName">Goal Name</Label>
              <Input 
                id="goalName" 
                value={newGoalName} 
                onChange={(e) => setNewGoalName(e.target.value)} 
                placeholder="e.g., New Laptop, Vacation" 
              />
            </div>
            <div>
              <Label htmlFor="goalTarget">Target Amount (INR)</Label>
              <Input 
                id="goalTarget" 
                type="number" 
                value={newGoalTarget} 
                onChange={(e) => setNewGoalTarget(e.target.value)} 
                placeholder="e.g., 50000"
              />
            </div>
            <Button onClick={handleAddGoal} disabled={!newGoalName || !newGoalTarget}>Add Goal</Button>
          </CardContent>
        </Card>
      )}

      {goals.length === 0 && !isAddingGoal && (
        <Card className="text-center py-12 shadow-md">
          <CardContent>
            <Target size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-xl font-semibold text-muted-foreground">No goals set yet.</p>
            <p className="text-muted-foreground">Click "Add New Goal" to get started!</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal, index) => (
          <Card key={goal.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300 animate-fadeIn" style={{animationDelay: `${index * 100}ms`}}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="font-headline text-lg">{goal.name}</CardTitle>
                  <CardDescription>
                    Target: {goal.targetAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                  </CardDescription>
                </div>
                <div className="flex space-x-1">
                   <Button variant="ghost" size="icon" onClick={() => handleEditGoal(goal.id)} className="h-8 w-8">
                    <Edit3 size={16} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteGoal(goal.id)} className="h-8 w-8 text-destructive hover:text-destructive-foreground hover:bg-destructive/90">
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Progress value={Math.min(100, (goal.currentAmount / goal.targetAmount) * 100)} className="h-3" />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Saved: {goal.currentAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                  </span>
                  <span className="font-medium">
                    {((goal.currentAmount / goal.targetAmount) * 100).toFixed(1)}%
                  </span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-2" 
                  onClick={() => openAddFundsModal(goal.id)}
                >
                  <PlusCircle size={16} className="mr-2"/> Add Funds
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Funds Modal Dialog */}
      <Dialog open={isAddFundsModalOpen} onOpenChange={(isOpen) => {
        setIsAddFundsModalOpen(isOpen);
        if (!isOpen) setGoalToUpdateId(null); // Clear selection when dialog is closed
      }}>
        <DialogContent>
          {goalBeingUpdated && (
            <>
              <DialogHeader>
                <DialogTitle>Add Funds to "{goalBeingUpdated.name}"</DialogTitle>
                <DialogDescription>
                  Current Saved: {goalBeingUpdated.currentAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })} <br />
                  Target Amount: {goalBeingUpdated.targetAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2 py-3">
                <Label htmlFor="fundAmountModal">Amount to Add (INR)</Label>
                <Input
                  id="fundAmountModal"
                  type="number"
                  value={fundAmountInput}
                  onChange={(e) => setFundAmountInput(e.target.value)}
                  placeholder="e.g., 500"
                  className="text-base"
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddFundsModalOpen(false)}>Cancel</Button>
                <Button onClick={handleConfirmAddFunds}>Add Funds</Button>
              </DialogFooter>
            </>
          )}
          {!goalBeingUpdated && (
             <DialogHeader>
                <DialogTitle>Error</DialogTitle>
                <DialogDescription>Could not find goal details. Please try again.</DialogDescription>
             </DialogHeader>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
