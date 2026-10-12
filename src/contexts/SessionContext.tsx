import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Loader2Icon, WifiOffIcon } from 'lucide-react';
import type { Conversation, Message, Sender, Skin } from '../types/chat';
import type { Role, SessionState } from '../types/session';
import { createInitialState, toTitle, typingKey } from '../utils/session';
import { ensureSession, mutateSession, subscribeToSession } from '../utils/sessionStore';

interface SessionContextValue {
  code: string;
  state: SessionState;
  appendMessage: (skin: Skin, conversationId: string, message: Message, options?: {retitle?: boolean;}) => void;
  startConversation: (skin: Skin, conversation: Conversation) => void;
  renameConversation: (skin: Skin, conversationId: string, name: string) => void;
  removeConversation: (skin: Skin, conversationId: string) => void;
  markRead: (skin: Skin, conversationId: string) => void;
  settleMessage: (skin: Skin, messageId: string) => void;
  setTyping: (skin: Skin, conversationId: string, typing: boolean) => void;
  setAvatar: (skin: Skin, conversationId: string, avatar: string | undefined) => void;
  /** Sets `by`'s reaction on a message; picking the same emoji again removes it. */
  setReaction: (skin: Skin, conversationId: string, messageId: string, by: Sender, emoji: string) => void;
  setReceiverName: (name: string) => void;
  setReceiverSkin: (skin: Skin) => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

interface SessionProviderProps {
  code: string;
  /** Lets the user leave if the session can't be reached. */
  onExit?: () => void;
  /** Only the controller creates sessions; receivers wait until the controller has started one. */
  role: Role;
  children: React.ReactNode;
}

type ConnectionStatus = 'connecting' | 'waiting' | 'ready' | 'error';

export function SessionProvider({ code, role, onExit, children }: SessionProviderProps) {
  const [state, setState] = useState<SessionState>(createInitialState);
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setStatus('connecting');
    const fail = (error: Error) => {
      console.error('Session connection failed', error);
      setStatus('error');
    };
    const unsubscribe = subscribeToSession(
      code,
      (next) => {
        // No session yet: the controller's is being created, or the receiver is early — keep listening.
        if (!next) {
          if (role === 'receiver') setStatus('waiting');
          return;
        }
        setState(next);
        setStatus('ready');
      },
      fail
    );
    if (role === 'controller') ensureSession(code).catch(fail);
    return unsubscribe;
  }, [code, role, attempt]);

  // Changes apply optimistically through the live subscription, then sync to everyone on the code.
  const mutate = useCallback(
    (fn: (current: SessionState) => SessionState) => {
      mutateSession(code, fn).catch((error: unknown) => console.error('Session update failed', error));
    },
    [code]
  );

  const appendMessage = useCallback<SessionContextValue['appendMessage']>(
    (skin, conversationId, message, options) =>
    mutate((s) => {
      const list = s[skin];
      const target = list.find((c) => c.id === conversationId);
      if (!target) return s;
      // Only auto-title untitled chats, so names the controller set are kept.
      const retitle =
      options?.retitle && message.sender === 'me' && target.messages.length === 0 && target.name === 'New chat';
      const updated: Conversation = {
        ...target,
        name: retitle ? toTitle(message.text) : target.name,
        unread: message.sender === 'them',
        messages: [...target.messages, message]
      };
      const key = typingKey(skin, conversationId);
      return {
        ...s,
        [skin]: [updated, ...list.filter((c) => c.id !== conversationId)],
        typing: message.sender === 'them' ? s.typing.filter((k) => k !== key) : s.typing
      };
    }),
    [mutate]
  );

  const startConversation = useCallback<SessionContextValue['startConversation']>(
    (skin, conversation) => mutate((s) => ({ ...s, [skin]: [conversation, ...s[skin]] })),
    [mutate]
  );

  const renameConversation = useCallback<SessionContextValue['renameConversation']>(
    (skin, conversationId, name) =>
    mutate((s) => {
      const clean = name.trim();
      if (!clean || !s[skin].some((c) => c.id === conversationId && c.name !== clean)) return s;
      return { ...s, [skin]: s[skin].map((c) => c.id === conversationId ? { ...c, name: clean } : c) };
    }),
    [mutate]
  );

  const removeConversation = useCallback<SessionContextValue['removeConversation']>(
    (skin, conversationId) =>
    mutate((s) => {
      if (!s[skin].some((c) => c.id === conversationId)) return s;
      const key = typingKey(skin, conversationId);
      return {
        ...s,
        [skin]: s[skin].filter((c) => c.id !== conversationId),
        typing: s.typing.filter((k) => k !== key)
      };
    }),
    [mutate]
  );

  const markRead = useCallback<SessionContextValue['markRead']>(
    (skin, conversationId) =>
    mutate((s) => {
      if (!s[skin].some((c) => c.id === conversationId && c.unread)) return s;
      return { ...s, [skin]: s[skin].map((c) => c.id === conversationId ? { ...c, unread: false } : c) };
    }),
    [mutate]
  );

  const settleMessage = useCallback<SessionContextValue['settleMessage']>(
    (skin, messageId) =>
    mutate((s) => {
      if (!s[skin].some((c) => c.messages.some((m) => m.id === messageId && m.animate))) return s;
      return {
        ...s,
        [skin]: s[skin].map((c) =>
        c.messages.some((m) => m.id === messageId) ?
        { ...c, messages: c.messages.map((m) => m.id === messageId ? { ...m, animate: false } : m) } :
        c
        )
      };
    }),
    [mutate]
  );

  const setTyping = useCallback<SessionContextValue['setTyping']>(
    (skin, conversationId, typing) =>
    mutate((s) => {
      const key = typingKey(skin, conversationId);
      const has = s.typing.includes(key);
      if (has === typing) return s;
      return { ...s, typing: typing ? [...s.typing, key] : s.typing.filter((k) => k !== key) };
    }),
    [mutate]
  );

  const setAvatar = useCallback<SessionContextValue['setAvatar']>(
    (skin, conversationId, avatar) =>
    mutate((s) => {
      if (!s[skin].some((c) => c.id === conversationId && c.avatar !== avatar)) return s;
      return { ...s, [skin]: s[skin].map((c) => c.id === conversationId ? { ...c, avatar } : c) };
    }),
    [mutate]
  );

  const setReaction = useCallback<SessionContextValue['setReaction']>(
    (skin, conversationId, messageId, by, emoji) =>
    mutate((s) => {
      const target = s[skin].find((c) => c.id === conversationId);
      if (!target || !target.messages.some((m) => m.id === messageId)) return s;
      const messages = target.messages.map((m) => {
        if (m.id !== messageId) return m;
        const reactions = { ...m.reactions };
        if (reactions[by] === emoji) delete reactions[by];else
        reactions[by] = emoji;
        return { ...m, reactions };
      });
      return { ...s, [skin]: s[skin].map((c) => c.id === conversationId ? { ...c, messages } : c) };
    }),
    [mutate]
  );

  const setReceiverName = useCallback(
    (name: string) => mutate((s) => s.receiverName === name ? s : { ...s, receiverName: name }),
    [mutate]
  );

  const setReceiverSkin = useCallback(
    (skin: Skin) => mutate((s) => s.receiverSkin === skin ? s : { ...s, receiverSkin: skin }),
    [mutate]
  );

  const value = useMemo<SessionContextValue>(
    () => ({
      code,
      state,
      appendMessage,
      startConversation,
      renameConversation,
      removeConversation,
      markRead,
      settleMessage,
      setTyping,
      setAvatar,
      setReaction,
      setReceiverName,
      setReceiverSkin
    }),
    [
    setAvatar,
    setReaction,
    code,
    state,
    appendMessage,
    startConversation,
    renameConversation,
    removeConversation,
    markRead,
    settleMessage,
    setTyping,
    setReceiverName,
    setReceiverSkin]

  );

  if (status !== 'ready') {
    return (
      <main className="flex min-h-screen w-full items-center justify-center bg-gpt-sidebar px-4 text-gpt-text">
        {status === 'connecting' ?
        <div role="status" className="flex items-center gap-3 text-[15px] text-gpt-muted">
            <Loader2Icon className="h-5 w-5 animate-spin" aria-hidden="true" />
            Joining session <span className="font-mono tracking-[0.2em] text-gpt-text">{code}</span>
          </div> :
        status === 'waiting' ?
        <div role="status" className="w-full max-w-[380px] text-center">
            <Loader2Icon className="mx-auto h-6 w-6 animate-spin text-gpt-muted" aria-hidden="true" />
            <h1 className="mt-3 text-lg font-semibold">
              Waiting for session <span className="font-mono tracking-[0.2em]">{code}</span>
            </h1>
            <p className="mt-1.5 text-[14px] leading-5 text-gpt-muted">
              You’ll join automatically once the controller signs in with this code. Double-check the code if this takes a while.
            </p>
            {onExit &&
          <button
            type="button"
            onClick={onExit}
            className="mt-5 h-10 rounded-xl border border-gpt-border bg-white px-4 text-[14px] font-medium transition-colors duration-150 hover:bg-gpt-hover">
            
                Use a different code
              </button>
          }
          </div> :

        <div role="alert" className="w-full max-w-[380px] text-center">
            <WifiOffIcon className="mx-auto h-6 w-6 text-gpt-muted" aria-hidden="true" />
            <h1 className="mt-3 text-lg font-semibold">Couldn’t connect to the session</h1>
            <p className="mt-1.5 text-[14px] leading-5 text-gpt-muted">
              Check your connection and try again. If this keeps happening, the database may be blocking access.
            </p>
            <div className="mt-5 flex justify-center gap-2">
              {onExit &&
            <button
              type="button"
              onClick={onExit}
              className="h-10 rounded-xl border border-gpt-border bg-white px-4 text-[14px] font-medium transition-colors duration-150 hover:bg-gpt-hover">
              
                  Sign out
                </button>
            }
              <button
              type="button"
              onClick={() => setAttempt((n) => n + 1)}
              className="h-10 rounded-xl bg-gpt-text px-4 text-[14px] font-medium text-white transition-colors duration-150 hover:bg-black">
              
                Try again
              </button>
            </div>
          </div>
        }
      </main>);

  }

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used inside a SessionProvider');
  return ctx;
}