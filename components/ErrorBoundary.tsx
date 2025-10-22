"use client";

import React from "react";
import { AlertTriangle, Home, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error Boundary caught an error:", error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "exception", {
        description: error.message,
        fatal: false,
      });
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      const isProduction = process.env.NODE_ENV === "production";
      const errorMessage = this.state.error?.message || "An unexpected error occurred";
      const isNetworkError = errorMessage.toLowerCase().includes("network") || 
                            errorMessage.toLowerCase().includes("fetch") ||
                            errorMessage.toLowerCase().includes("cors");
      const isAuthError = errorMessage.toLowerCase().includes("auth") || 
                         errorMessage.toLowerCase().includes("permission");
      const isFirebaseError = errorMessage.toLowerCase().includes("firebase") || 
                             errorMessage.toLowerCase().includes("firestore");

      return (
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
                <div className="space-y-3">
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <h4 className="font-semibold text-red-900 dark:text-red-300 mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Error Details (Development Mode)
                    </h4>
                    <p className="text-sm text-red-800 dark:text-red-400 font-mono break-all">
                      {errorMessage}
                    </p>
                  </div>

                  {this.state.errorInfo && (
                    <details className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer">
                      <summary className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        Stack Trace
                      </summary>
                      <pre className="text-xs text-gray-700 dark:text-gray-300 overflow-auto max-h-60 font-mono">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
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
                onClick={this.handleReset}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white gap-2"
                size="lg"
              >
                <RefreshCcw className="w-4 h-4" />
                Try Again
              </Button>
              <Button
                onClick={this.handleGoHome}
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
      );
    }

    return this.props.children;
  }
}
