import { useCallback, useState } from 'react';
import type { SessionUser } from '../types/session';
import { clearSignedInUser, loadSignedInUser, saveSignedInUser } from '../utils/session';

export function useSignedInUser() {
  const [user, setUser] = useState<SessionUser | null>(() => loadSignedInUser());

  const signIn = useCallback((next: SessionUser) => {
    saveSignedInUser(next);
    setUser(next);
  }, []);

  const signOut = useCallback(() => {
    clearSignedInUser();
    setUser(null);
  }, []);

  return { user, signIn, signOut };
}