
"use client";
import type { FC } from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { KeyRound, ArrowLeft, MailCheck } from 'lucide-react'; // Added MailCheck
import { auth } from '@/lib/firebase'; 
import { sendPasswordResetEmail } from 'firebase/auth';

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
    // setSubmitted(false); // Reset submitted state only if you allow retry on the same screen without reload. Usually not needed here.

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
        // For security, often don't reveal if an email exists. 
        // The generic success message is good.
      }
      
      if (error.code !== 'auth/user-not-found') {
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          });
      } else {
         toast({ // Still show success for user-not-found
            title: "Password Reset Email Sent",
            description: `If an account exists for ${email}, a password reset link has been sent. Please check your inbox (and spam folder).`,
        });
        setSubmitted(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div
            className={`mx-auto rounded-full p-3 w-fit mb-4 ${
              submitted ? 'bg-muted' : 'bg-primary text-primary-foreground'
            }`}
          >
            {submitted ? (
              <MailCheck size={32} className="text-[hsl(var(--chart-5))]" />
            ) : (
              <KeyRound size={32} />
            )}
          </div>
          <CardTitle className="text-3xl font-headline">
            {submitted ? "Check Your Email" : "Forgot Password?"}
          </CardTitle>
          <CardDescription>
            {submitted 
              ? `We've sent a password reset link to ${email}. Please follow the instructions in the email.`
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
              <Button type="submit" className="w-full text-base py-3" disabled={isLoading || !email}>
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>
          </CardContent>
        )}
        {submitted && (
            <CardContent className="text-center">
                 <p className="text-sm text-muted-foreground">
                    If you don't see the email within a few minutes, please check your spam or junk folder.
                 </p>
            </CardContent>
        )}
        <CardFooter className="flex flex-col items-center space-y-2 text-sm pt-4">
          <Link href="/login" className="text-primary hover:underline flex items-center gap-1">
            <ArrowLeft size={16} /> Back to Login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;
