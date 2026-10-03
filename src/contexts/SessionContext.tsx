import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { Conversation, Message, Sender, Skin } from '../types/chat';
import type { SessionState } from '../types/session';
import {
  createInitialState,
  loadSessionState,
  saveSessionState,
  sessionChannelName,
  toTitle,
  typingKey } from
'../utils/session';
import { subscribeToSession as firebaseSubscribeToSession } from '../utils/firebaseSession';

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
  children: React.ReactNode;
}

export function SessionProvider({ code, children }: SessionProviderProps) {
  const [state, setState] = useState<SessionState>(createInitialState());
  const [initialized, setInitialized] = useState(false);
  const stateRef = useRef(state);
  const channelRef = useRef<BroadcastChannel | null>(null);

  // Initialize session on mount
  useEffect(() => {
    console.log('SessionProvider: Initializing session for code:', code);
    let hasReceivedInitial = false;
    let timeoutId: NodeJS.Timeout | null = null;

    // First, try to load the session explicitly
    const loadInitialSession = async () => {
      try {
        const existing = await loadSessionState(code);
        console.log('SessionProvider: Initial load result:', existing);
        if (existing) {
          stateRef.current = existing;
          setState(existing);
          hasReceivedInitial = true;
          setInitialized(true);
          console.log('SessionProvider: Initialization complete from initial load, state:', existing);
        }
      } catch (error) {
        console.error('SessionProvider: Initial load error:', error);
      }
    };
    loadInitialSession();

    // Then set up Firebase real-time subscription for updates
    const firebaseUnsubscribe = firebaseSubscribeToSession(code, (firebaseState) => {
      console.log('SessionProvider: Firebase state update received:', firebaseState);
      if (firebaseState) {
        // Clear timeout if we received data
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        stateRef.current = firebaseState;
        setState(firebaseState);
        if (!hasReceivedInitial) {
          hasReceivedInitial = true;
          setInitialized(true);
          console.log('SessionProvider: Initialization complete from Firebase subscription, state:', firebaseState);
        }
      } else if (!hasReceivedInitial) {
        // If Firebase returns null and we haven't loaded anything yet, wait a bit before creating new session
        if (!timeoutId) {
          timeoutId = setTimeout(() => {
            console.log('SessionProvider: Firebase returned null after timeout, creating new session');
            const fresh = createInitialState();
            stateRef.current = fresh;
            setState(fresh);
            saveSessionState(code, fresh);
            hasReceivedInitial = true;
            setInitialized(true);
            console.log('SessionProvider: Initialization complete (new session), state:', fresh);
          }, 1000); // Wait 1 second for Firebase to respond
        }
      }
    });

    return () => {
      console.log('SessionProvider: Cleaning up Firebase subscription');
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      firebaseUnsubscribe();
    };
  }, [code]);

  useEffect(() => {
    const receive = (next: SessionState) => {
      stateRef.current = next;
      setState(next);
    };
    const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(sessionChannelName(code)) : null;
    channelRef.current = channel;
    const onMessage = (e: MessageEvent<SessionState>) => receive(e.data);

    channel?.addEventListener('message', onMessage);

    // Firebase real-time subscription
    const firebaseUnsubscribe = firebaseSubscribeToSession(code, (next) => {
      if (next) receive(next);
    });

    return () => {
      channel?.removeEventListener('message', onMessage);
      channel?.close();
      channelRef.current = null;
      firebaseUnsubscribe();
    };
  }, [code]);

  const mutate = useCallback(
    async (fn: (current: SessionState) => SessionState) => {
      const current = (await loadSessionState(code)) ?? stateRef.current;
      const next = fn(current);
      if (next === current) return;
      await saveSessionState(code, next);
      stateRef.current = next;
      setState(next);
      channelRef.current?.postMessage(next);
    },
    [code]
  );

  const appendMessage = useCallback<SessionContextValue['appendMessage']>(
    (skin, conversationId, message, options) =>
    mutate((s) => {
      const list = s[skin] || [];
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
        typing: (s.typing || []).filter((k) => k !== key)
      };
    }),
    [mutate]
  );

  const startConversation = useCallback<SessionContextValue['startConversation']>(
    (skin, conversation) => mutate((s) => ({ ...s, [skin]: [conversation, ...(s[skin] || [])] })),
    [mutate]
  );

  const renameConversation = useCallback<SessionContextValue['renameConversation']>(
    (skin, conversationId, name) =>
    mutate((s) => {
      const clean = name.trim();
      if (!clean || !(s[skin] || []).some((c) => c.id === conversationId && c.name !== clean)) return s;
      return { ...s, [skin]: (s[skin] || []).map((c) => c.id === conversationId ? { ...c, name: clean } : c) };
    }),
    [mutate]
  );

  const removeConversation = useCallback<SessionContextValue['removeConversation']>(
    (skin, conversationId) =>
    mutate((s) => {
      if (!(s[skin] || []).some((c) => c.id === conversationId)) return s;
      const key = typingKey(skin, conversationId);
      return {
        ...s,
        [skin]: (s[skin] || []).filter((c) => c.id !== conversationId),
        typing: (s.typing || []).filter((k) => k !== key)
      };
    }),
    [mutate]
  );

  const markRead = useCallback<SessionContextValue['markRead']>(
    (skin, conversationId) =>
    mutate((s) => {
      if (!(s[skin] || []).some((c) => c.id === conversationId && c.unread)) return s;
      return { ...s, [skin]: (s[skin] || []).map((c) => c.id === conversationId ? { ...c, unread: false } : c) };
    }),
    [mutate]
  );

  const settleMessage = useCallback<SessionContextValue['settleMessage']>(
    (skin, messageId) =>
    mutate((s) => {
      if (!(s[skin] || []).some((c) => c.messages.some((m) => m.id === messageId && m.animate))) return s;
      return {
        ...s,
        [skin]: (s[skin] || []).map((c) =>
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
      const has = (s.typing || []).includes(key);
      if (has === typing) return s;
      return { ...s, typing: typing ? [...(s.typing || []), key] : (s.typing || []).filter((k) => k !== key) };
    }),
    [mutate]
  );

  const setAvatar = useCallback<SessionContextValue['setAvatar']>(
    (skin, conversationId, avatar) =>
    mutate((s) => {
      if (!(s[skin] || []).some((c) => c.id === conversationId && c.avatar !== avatar)) return s;
      return { ...s, [skin]: (s[skin] || []).map((c) => c.id === conversationId ? { ...c, avatar } : c) };
    }),
    [mutate]
  );

  const setReaction = useCallback<SessionContextValue['setReaction']>(
    (skin, conversationId, messageId, by, emoji) =>
    mutate((s) => {
      const target = (s[skin] || []).find((c) => c.id === conversationId);
      if (!target || !target.messages.some((m) => m.id === messageId)) return s;
      const messages = target.messages.map((m) => {
        if (m.id !== messageId) return m;
        const reactions = { ...m.reactions };
        if (reactions[by] === emoji) delete reactions[by];else
        reactions[by] = emoji;
        return { ...m, reactions };
      });
      return { ...s, [skin]: (s[skin] || []).map((c) => c.id === conversationId ? { ...c, messages } : c) };
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

  // Don't render children until session is initialized
  if (!initialized) {
    return <div className="flex min-h-screen items-center justify-center text-gpt-muted">Loading...</div>;
  }

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used inside a SessionProvider');
  return ctx;
}