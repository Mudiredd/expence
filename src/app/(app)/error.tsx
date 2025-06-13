
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service or console
    console.error(error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto bg-destructive text-destructive-foreground rounded-full p-3 w-fit mb-4">
            <AlertTriangle size={32} />
          </div>
          <CardTitle className="text-2xl font-headline">Something went wrong</CardTitle>
          <CardDescription>
            We encountered an unexpected error. Please try again.
            {error?.digest && (
              <p className="text-xs mt-2 text-muted-foreground">
                Error Digest: {error.digest}
              </p>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <Button
            onClick={
              // Attempt to recover by trying to re-render the segment
              () => reset()
            }
          >
            Try again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
