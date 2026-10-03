import { ref, set, get, onValue, remove } from 'firebase/database';
import { realtimeDB } from '../firebase/config';
import type { SessionState } from '../types/session';

const SESSIONS_PATH = 'sessions';

export async function createSession(code: string, initialState: SessionState): Promise<void> {
  console.log('Firebase createSession called', { code, initialState });
  try {
    const sessionRef = ref(realtimeDB, `${SESSIONS_PATH}/${code}`);
    await set(sessionRef, initialState);
    console.log('Firebase createSession success');
  } catch (error) {
    console.error('Firebase createSession error:', error);
    throw error;
  }
}

export async function getSession(code: string): Promise<SessionState | null> {
  console.log('Firebase getSession called', { code });
  try {
    const sessionRef = ref(realtimeDB, `${SESSIONS_PATH}/${code}`);
    const snapshot = await get(sessionRef);
    const result = snapshot.exists() ? snapshot.val() as SessionState : null;
    console.log('Firebase getSession result:', result ? 'found' : 'not found');
    return result;
  } catch (error) {
    console.error('Firebase getSession error:', error);
    throw error;
  }
}

export async function sessionExists(code: string): Promise<boolean> {
  console.log('Firebase sessionExists called', { code });
  try {
    const session = await getSession(code);
    const exists = session !== null;
    console.log('Firebase sessionExists result:', exists);
    return exists;
  } catch (error) {
    console.error('Firebase sessionExists error:', error);
    throw error;
  }
}

export function subscribeToSession(code: string, callback: (state: SessionState | null) => void): () => void {
  console.log('Firebase subscribeToSession called', { code });
  const sessionRef = ref(realtimeDB, `${SESSIONS_PATH}/${code}`);
  const unsubscribe = onValue(sessionRef, (snapshot) => {
    callback(snapshot.exists() ? snapshot.val() as SessionState : null);
  });
  return unsubscribe;
}

export async function updateSession(code: string, state: SessionState): Promise<void> {
  console.log('Firebase updateSession called', { code });
  const sessionRef = ref(realtimeDB, `${SESSIONS_PATH}/${code}`);
  await set(sessionRef, state);
}

export async function deleteSession(code: string): Promise<void> {
  console.log('Firebase deleteSession called', { code });
  const sessionRef = ref(realtimeDB, `${SESSIONS_PATH}/${code}`);
  await remove(sessionRef);
}
