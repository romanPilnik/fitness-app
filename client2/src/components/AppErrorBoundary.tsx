import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

type Props = { children: ReactNode };

type State = { hasError: boolean };

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error(error, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-(--bg) px-4">
          <h1 className="text-center text-xl font-medium text-(--text-h)">Something went wrong</h1>
          <p className="max-w-md text-center text-(--text)">
            Refresh the page or return home and try again.
          </p>
          <Link
            to="/"
            className="rounded-lg border border-(--border) px-4 py-2.5 text-sm font-medium text-(--text-h) hover:bg-(--code-bg) focus-visible:outline-2 focus-visible:outline-(--accent-border)"
          >
            Go home
          </Link>
        </div>
      );
    }

    return this.props.children;
  }
}
