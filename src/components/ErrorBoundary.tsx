import { Component, type ReactNode } from 'react';
export default class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return <main className="min-h-screen bg-surface-50 flex items-center justify-center px-6"><div className="max-w-lg"><p className="text-sm font-semibold text-teal-700 mb-4">CLINOVA INTERNATIONAL ACADEMY</p><h1 className="text-3xl font-bold text-navy-800">This page could not be loaded</h1><p className="my-6 text-navy-600">Please reload to try again. No submission is confirmed by this error screen.</p><button className="px-6 py-3 bg-navy-800 text-white" onClick={() => window.location.reload()}>Reload page</button><a className="ml-6 underline" href="/">Return home</a></div></main>;
    return this.props.children;
  }
}
