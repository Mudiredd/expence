
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service or console
    console.error("Global Error Boundary Caught:", error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="flex items-center justify-center min-h-screen bg-background text-foreground p-4">
          <Card className="w-full max-w-md shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto bg-destructive text-destructive-foreground rounded-full p-3 w-fit mb-4">
                <AlertTriangle size={32} />
              </div>
              <CardTitle className="text-2xl font-headline">Oops! Something Went Wrong</CardTitle>
              <CardDescription>
                We encountered an unexpected internal error. Please try again later.
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
                Try to reload
              </Button>
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  );
}
