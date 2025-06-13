
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
import { auth } from '@/lib/firebase'; // Import Firebase auth
import { sendPasswordResetEmail } from 'firebase/auth'; // Import sendPasswordResetEmail

// export const metadata: Metadata = { // TODO: Add metadata back once supported
//   title: 'Forgot Password | Vishnu Finance Tracker',
// };

const ForgotPasswordPage: FC = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSubmitted(false); // Reset submitted state in case of re-try

    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: "Password Reset Email Sent",
        description: `If an account exists for ${email}, a password reset link has been sent. Please check your inbox (and spam folder).`,
      });
      setSubmitted(true);
    } catch (error: any) {
      console.error("Firebase sendPasswordResetEmail error:", error);
      let errorMessage = "Failed to send password reset email. Please try again.";
      if (error.code === 'auth/invalid-email') {
        errorMessage = "The email address is not valid.";
      } else if (error.code === 'auth/user-not-found') {
        // We typically don't want to reveal if an email is registered or not for security reasons.
        // So, the generic success message is often preferred even in this case.
        // However, for debugging or specific UX choices, you might handle it differently.
        // For now, we'll let the generic success message cover this.
        // If you want specific feedback, uncomment the line below:
        // errorMessage = "No user found with this email address.";
      }
      
      // Show a generic success even on user-not-found to prevent email enumeration,
      // unless you specifically want to inform the user. The toast above already handles the success case.
      // If an error other than user-not-found occurred, show it.
      if (error.code !== 'auth/user-not-found') {
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          });
      } else {
        // Still show the success message for user-not-found to prevent enumeration
         toast({
            title: "Password Reset Email Sent",
            description: `If an account exists for ${email}, a password reset link has been sent. Please check your inbox (and spam folder).`,
        });
        setSubmitted(true); // Mark as submitted even if user not found
      }
    } finally {
      setIsLoading(false);
    }
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
              ? "Please check your email for instructions to reset your password."
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
        {submitted && (
            <CardContent className="text-center">
                 <p className="text-sm text-muted-foreground">
                    If you don't see the email, please check your spam or junk folder.
                 </p>
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
