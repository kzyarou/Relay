import type { Skin } from '../types/chat';
import type { SessionState, SessionUser } from '../types/session';
import { sessionExists as firebaseSessionExists, createSession as firebaseCreateSession, getSession as firebaseGetSession, updateSession as firebaseUpdateSession, subscribeToSession as firebaseSubscribeToSession } from './firebaseSession';

// v2: sessions start empty — older saved sessions contained sample chats.
const STATE_PREFIX = 'chat-session-v2:';
const USER_KEY = 'chat-session-user';
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

// Use Firebase for session management
const USE_FIREBASE = false; // Disabled until Realtime Database is properly configured in Firebase console

export function createInitialState(): SessionState {
  return { messenger: [], chatgpt: [], typing: [] };
}

export async function loadSessionState(code: string): Promise<SessionState | null> {
  if (USE_FIREBASE) {
    return await firebaseGetSession(code);
  }
  try {
    const raw = window.localStorage.getItem(STATE_PREFIX + code);
    return raw ? JSON.parse(raw) as SessionState : null;
  } catch {
    return null;
  }
}

export async function saveSessionState(code: string, state: SessionState): Promise<void> {
  if (USE_FIREBASE) {
    await firebaseUpdateSession(code, state);
    return;
  }
  try {
    window.localStorage.setItem(STATE_PREFIX + code, JSON.stringify(state));
  } catch {

    // Storage unavailable — the in-memory copy and broadcast channel still work.
  }
}

/** Returns null when storage can't be read, so callers don't block sign-in on it. */
export async function sessionExists(code: string): Promise<boolean | null> {
  if (USE_FIREBASE) {
    return await firebaseSessionExists(code);
  }
  try {
    return window.localStorage.getItem(STATE_PREFIX + code) !== null;
  } catch {
    return null;
  }
}

export function isSessionKey(key: string | null, code: string): boolean {
  return key === STATE_PREFIX + code;
}

export function sessionChannelName(code: string): string {
  return `chat-session-${code}`;
}

export function generateSessionCode(): string {
  let code = '';
  for (let i = 0; i < 6; i++) code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  return code;
}

export function normalizeCode(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
}

export function typingKey(skin: Skin, conversationId: string): string {
  return `${skin}:${conversationId}`;
}

export function toTitle(text: string): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length > 38 ? `${clean.slice(0, 38).trimEnd()}…` : clean;
}

export function initials(name: string): string {
  return name.
  split(' ').
  filter(Boolean).
  map((part) => part[0]).
  slice(0, 2).
  join('').
  toUpperCase();
}

export function stripMarkdown(text: string): string {
  return text.replace(/\*\*/g, '').replace(/^#+\s*/gm, '').replace(/\s+/g, ' ').trim();
}

/* Signed-in user lives in sessionStorage so each tab can hold a different role. */
export function loadSignedInUser(): SessionUser | null {
  try {
    const raw = window.sessionStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) as SessionUser : null;
  } catch {
    return null;
  }
}

export function saveSignedInUser(user: SessionUser): void {
  try {
    window.sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {

    // Ignore — user stays signed in for this page load.
  }}

export function clearSignedInUser(): void {
  try {
    window.sessionStorage.removeItem(USER_KEY);
  } catch {

    // Ignore.
  }}