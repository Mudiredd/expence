
"use client";

import { useState, useEffect, type FC } from 'react';
import { auth } from '@/lib/firebase';
import { sendEmailVerification, onAuthStateChanged, type User } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, MailCheck, ShieldAlert } from 'lucide-react'; // Using ShieldAlert for visibility

const EmailVerificationBanner: FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleResendVerificationEmail = async () => {
    if (!currentUser) {
      toast({
        title: "Error",
        description: "No user is currently logged in.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      await sendEmailVerification(currentUser);
      toast({
        title: "Verification Email Sent",
        description: "A new verification link has been sent to your email address. Please check your inbox (and spam folder).",
        action: <MailCheck className="text-green-500" />,
      });
    } catch (error: any) {
      console.error("Error resending verification email:", error);
      let errorMessage = "Failed to resend verification email. Please try again later.";
      if (error.code === 'auth/too-many-requests') {
        errorMessage = "Too many requests. Please try again later.";
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  if (currentUser && !currentUser.emailVerified) {
    return (
      <div className="bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-500 dark:border-yellow-400 text-yellow-700 dark:text-yellow-300 p-4 shadow-md w-full" role="alert">
        <div className="flex items-center">
          <ShieldAlert className="h-6 w-6 mr-3 text-yellow-600 dark:text-yellow-400" />
          <div>
            <p className="font-bold">Verify Your Email Address</p>
            <p className="text-sm">
              Please check your inbox for a verification link. Your email <span className="font-semibold">{currentUser.email}</span> is not yet verified.
            </p>
          </div>
        </div>
        <Button
          onClick={handleResendVerificationEmail}
          disabled={isSending}
          variant="outline"
          size="sm"
          className="mt-3 ml-9 bg-yellow-200 hover:bg-yellow-300 dark:bg-yellow-700 dark:hover:bg-yellow-600 border-yellow-500 text-yellow-800 dark:text-yellow-100 dark:border-yellow-500"
        >
          {isSending ? 'Sending...' : 'Resend Verification Email'}
        </Button>
      </div>
    );
  }

  return null; // Don't render anything if email is verified or no user
};

export default EmailVerificationBanner;
