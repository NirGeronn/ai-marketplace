// Server-side lock to prevent concurrent sync/seed operations.
// When a new operation starts, the previous one is aborted.

let currentAbort: AbortController | null = null;

export function startOperation(): AbortSignal {
  // Abort any in-flight operation
  if (currentAbort) {
    currentAbort.abort();
  }
  currentAbort = new AbortController();
  return currentAbort.signal;
}

export function isAborted(signal: AbortSignal): boolean {
  return signal.aborted;
}
