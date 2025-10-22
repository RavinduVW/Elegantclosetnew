"use client";

import { useEffect } from "react";
import { AlertTriangle, Home, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Route Error:", error);
  }, [error]);

  const isProduction = process.env.NODE_ENV === "production";
  const errorMessage = error?.message || "An unexpected error occurred";

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-xl w-full border-2 shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Something went wrong
          </CardTitle>
          <CardDescription>
            We encountered an error while loading this page
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          {!isProduction && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-400 font-mono break-all">
                {errorMessage}
              </p>
            </div>
          )}

          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
            <p className="text-sm text-purple-800 dark:text-purple-400">
              Try refreshing the page or return to the homepage
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex gap-3 justify-center">
          <Button
            onClick={reset}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white gap-2"
          >
            <RefreshCcw className="w-4 h-4" />
            Try Again
          </Button>
          <Button
            onClick={() => (window.location.href = "/")}
            variant="outline"
            className="gap-2"
          >
            <Home className="w-4 h-4" />
            Homepage
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
