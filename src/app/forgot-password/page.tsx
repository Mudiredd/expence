
"use client";
import type { FC } from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { KeyRound, ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

// export const metadata: Metadata = { // TODO: Add metadata back once supported
//   title: 'Forgot Password | Vishnu Finance Tracker',
// };

const ForgotPasswordPage: FC = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      // In a real app, you would send a password reset email here.
      toast({
        title: "Password Reset Email Sent",
        description: `If an account exists for ${email}, a password reset link has been sent.`,
      });
      setIsLoading(false);
      setSubmitted(true);
    }, 1000);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary text-primary-foreground rounded-full p-3 w-fit mb-4">
            <KeyRound size={32} />
          </div>
          <CardTitle className="text-3xl font-headline">Forgot Password?</CardTitle>
          <CardDescription>
            {submitted 
              ? "Please check your email for instructions."
              : "Enter your email address and we'll send you a link to reset your password."
            }
          </CardDescription>
        </CardHeader>
        {!submitted && (
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="you@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                  className="text-base"
                />
              </div>
              <Button type="submit" className="w-full text-base py-3" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>
          </CardContent>
        )}
        <CardFooter className="flex flex-col items-center space-y-2 text-sm">
          <Link href="/login" className="text-primary hover:underline flex items-center gap-1">
            <ArrowLeft size={16} /> Back to Login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;
