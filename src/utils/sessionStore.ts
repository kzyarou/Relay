import { onValue, ref, runTransaction } from 'firebase/database';
import type { SessionState } from '../types/session';
import { db } from './firebase';
import { createInitialState } from './session';

/*
 * Each session lives at `sessions/{code}/state` in the Realtime Database as a JSON string.
 * Storing a string (rather than a tree) keeps empty arrays and optional fields intact,
 * and lets every change run as one atomic transaction.
 */

function stateRef(code: string) {
  return ref(db, `sessions/${code}/state`);
}

function parseState(raw: unknown): SessionState {
  try {
    const data = (typeof raw === 'string' ? JSON.parse(raw) : raw) as Partial<SessionState>;
    return {
      ...data,
      messenger: Array.isArray(data.messenger) ? data.messenger : [],
      chatgpt: Array.isArray(data.chatgpt) ? data.chatgpt : [],
      typing: Array.isArray(data.typing) ? data.typing : []
    };
  } catch {
    return createInitialState();
  }
}

/** Creates the session if no one has yet; leaves an existing one untouched. */
export async function ensureSession(code: string): Promise<void> {
  await runTransaction(stateRef(code), (current) => current ?? JSON.stringify(createInitialState()));
}

export function subscribeToSession(
code: string,
onState: (state: SessionState | null) => void,
onError: (error: Error) => void)
: () => void {
  return onValue(
    stateRef(code),
    (snap) => onState(snap.exists() ? parseState(snap.val()) : null),
    onError
  );
}

/** Applies `fn` atomically against the latest server state. Returning the same object skips the write. */
export async function mutateSession(code: string, fn: (current: SessionState) => SessionState): Promise<void> {
  await runTransaction(stateRef(code), (current) => {
    const base = current ? parseState(current) : createInitialState();
    const next = fn(base);
    if (next === base) return undefined;
    return JSON.stringify(next);
  });
}