import type { ReactNode } from "react";
import { Component, type ErrorInfo } from "react";

import { ErrorState } from "@/components/shared/error-state";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

/** Catches render errors and shows a retryable error state. */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false, message: "" });
    this.props.onReset?.();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <ErrorState
          title={this.props.fallbackTitle}
          message={this.state.message || "An unexpected error occurred."}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}
