import { ref, set, get, onValue, remove } from 'firebase/database';
import { realtimeDB } from '../firebase/config';
import type { SessionState } from '../types/session';

const SESSIONS_PATH = 'sessions';

export async function createSession(code: string, initialState: SessionState): Promise<void> {
  const sessionRef = ref(realtimeDB, `${SESSIONS_PATH}/${code}`);
  await set(sessionRef, initialState);
}

export async function getSession(code: string): Promise<SessionState | null> {
  const sessionRef = ref(realtimeDB, `${SESSIONS_PATH}/${code}`);
  const snapshot = await get(sessionRef);
  return snapshot.exists() ? snapshot.val() as SessionState : null;
}

export async function sessionExists(code: string): Promise<boolean> {
  const session = await getSession(code);
  return session !== null;
}

export function subscribeToSession(code: string, callback: (state: SessionState | null) => void): () => void {
  const sessionRef = ref(realtimeDB, `${SESSIONS_PATH}/${code}`);
  const unsubscribe = onValue(sessionRef, (snapshot) => {
    callback(snapshot.exists() ? snapshot.val() as SessionState : null);
  });
  return unsubscribe;
}

export async function updateSession(code: string, state: SessionState): Promise<void> {
  const sessionRef = ref(realtimeDB, `${SESSIONS_PATH}/${code}`);
  await set(sessionRef, state);
}

export async function deleteSession(code: string): Promise<void> {
  const sessionRef = ref(realtimeDB, `${SESSIONS_PATH}/${code}`);
  await remove(sessionRef);
}
