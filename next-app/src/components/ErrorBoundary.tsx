"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

/**
 * Minimal React error boundary that renders `fallback` (default: null) if
 * children throw during render. Logs the error to console so devtools show
 * it; does NOT report to Sentry (that's route-level responsibility).
 *
 * Used to contain the blast radius of Batch 36 additions on Progress + Report
 * — if a new primitive throws for a subset of users, the rest of the page
 * still renders instead of hitting Next.js's page-level error boundary.
 */
type Props = {
  children: ReactNode;
  fallback?: ReactNode;
  /** Optional label surfaced in console error logs for triage. */
  boundary?: string;
};

type State = { hasError: boolean; error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error(
      `[ErrorBoundary${this.props.boundary ? ` · ${this.props.boundary}` : ""}] contained render error:`,
      error,
      info.componentStack,
    );
  }

  render() {
    if (this.state.hasError) return this.props.fallback ?? null;
    return this.props.children;
  }
}
