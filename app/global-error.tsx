"use client";

import { useEffect } from "react";
import { AlertTriangle, Home, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error:", error);
  }, [error]);

  const isProduction = process.env.NODE_ENV === "production";
  const errorMessage = error?.message || "An unexpected error occurred";
  const isNetworkError = errorMessage.toLowerCase().includes("network") || 
                        errorMessage.toLowerCase().includes("fetch") ||
                        errorMessage.toLowerCase().includes("cors");
  const isAuthError = errorMessage.toLowerCase().includes("auth") || 
                     errorMessage.toLowerCase().includes("permission");
  const isFirebaseError = errorMessage.toLowerCase().includes("firebase") || 
                         errorMessage.toLowerCase().includes("firestore");

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 via-pink-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-black">
          <Card className="max-w-2xl w-full border-2 shadow-2xl">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center">
                <AlertTriangle className="w-10 h-10 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Oops! Something went wrong
              </CardTitle>
              <CardDescription className="text-lg">
                {isNetworkError && "We're having trouble connecting. Please check your internet connection."}
                {isAuthError && "There was an authentication issue. You may need to log in again."}
                {isFirebaseError && "We encountered a database issue. Please try again in a moment."}
                {!isNetworkError && !isAuthError && !isFirebaseError && 
                  "We encountered an unexpected error. Don't worry, our team has been notified."}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {!isProduction && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <h4 className="font-semibold text-red-900 dark:text-red-300 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Error Details (Development Mode)
                  </h4>
                  <p className="text-sm text-red-800 dark:text-red-400 font-mono break-all">
                    {errorMessage}
                  </p>
                  {error.digest && (
                    <p className="text-xs text-red-700 dark:text-red-500 mt-2">
                      Error ID: {error.digest}
                    </p>
                  )}
                </div>
              )}

              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                <h4 className="font-semibold text-purple-900 dark:text-purple-300 mb-2">
                  What can you do?
                </h4>
                <ul className="space-y-2 text-sm text-purple-800 dark:text-purple-400">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 dark:text-purple-400 mt-0.5">•</span>
                    <span>Try refreshing the page or clicking the retry button below</span>
                  </li>
                  {isNetworkError && (
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 dark:text-purple-400 mt-0.5">•</span>
                      <span>Check your internet connection and try again</span>
                    </li>
                  )}
                  {isAuthError && (
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 dark:text-purple-400 mt-0.5">•</span>
                      <span>Log out and log back in to refresh your session</span>
                    </li>
                  )}
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 dark:text-purple-400 mt-0.5">•</span>
                    <span>Clear your browser cache and cookies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 dark:text-purple-400 mt-0.5">•</span>
                    <span>Return to the homepage and try again</span>
                  </li>
                </ul>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={reset}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white gap-2"
                size="lg"
              >
                <RefreshCcw className="w-4 h-4" />
                Try Again
              </Button>
              <Button
                onClick={() => (window.location.href = "/")}
                variant="outline"
                className="gap-2"
                size="lg"
              >
                <Home className="w-4 h-4" />
                Go to Homepage
              </Button>
            </CardFooter>
          </Card>
        </div>
      </body>
    </html>
  );
}
