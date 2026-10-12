import type { Skin } from '../types/chat';
import type { SessionState, SessionUser } from '../types/session';

const USER_KEY = 'chat-session-user';
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function createInitialState(): SessionState {
  return { messenger: [], chatgpt: [], typing: [] };
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