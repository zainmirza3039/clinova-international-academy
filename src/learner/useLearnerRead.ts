import { useEffect, useState } from 'react';

type ReadState<T> =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; data: T };

/** Clear old data synchronously when the query identity changes; ignore late responses. */
export function useLearnerRead<T>(load: () => Promise<T>) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{ load: typeof load; attempt: number; value: ReadState<T> }>(
    () => ({ load, attempt: 0, value: { status: 'loading' } }),
  );
  useEffect(() => {
    let active = true;
    setResult({ load, attempt, value: { status: 'loading' } });
    void Promise.resolve().then(async () => {
      if (!active) return;
      try {
        const data = await load();
        if (active) setResult({ load, attempt, value: { status: 'ready', data } });
      } catch {
        if (active) setResult({ load, attempt, value: { status: 'error' } });
      }
    });
    return () => { active = false; };
  }, [load, attempt]);
  const state: ReadState<T> = result.load === load && result.attempt === attempt
    ? result.value : { status: 'loading' };
  return { state, reload: () => setAttempt(value => value + 1) };
}
