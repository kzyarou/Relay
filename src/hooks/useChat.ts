import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSession } from '../contexts/SessionContext';
import type { Conversation, Skin } from '../types/chat';
import { createId } from '../utils/id';

interface UseChatOptions {
  /** Rename "New chat" conversations after the first message (ChatGPT behavior). */
  retitleNewConversations?: boolean;
  /** Sending with no chat open starts a new one (ChatGPT behavior). */
  createOnSend?: boolean;
}

/** Receiver-side chat state. Replies arrive from the controller through the shared session. */
export function useChat(skin: Skin, options: UseChatOptions = {}) {
  const session = useSession();
  const { appendMessage, markRead, settleMessage: settle, startConversation: start } = session;
  const conversations = session.state[skin];
  const [selectedId, setSelectedId] = useState<string>('');

  // Fall back to the newest chat when nothing is selected or the selected chat was removed.
  const active = conversations.find((c) => c.id === selectedId) ?? conversations[0];
  const activeId = active?.id ?? '';

  const typingIds = useMemo(
    () => session.state.typing.filter((k) => k.startsWith(`${skin}:`)).map((k) => k.slice(skin.length + 1)),
    [session.state.typing, skin]
  );

  // Anything landing in the chat the receiver is looking at counts as seen.
  useEffect(() => {
    if (active?.unread) markRead(skin, active.id);
  }, [active?.unread, active?.id, markRead, skin]);

  const startConversation = useCallback(
    (conversation: Conversation) => {
      start(skin, conversation);
      setSelectedId(conversation.id);
    },
    [start, skin]
  );

  const send = useCallback(
    (raw: string) => {
      const text = raw.trim();
      if (!text) return;
      let targetId = activeId;
      if (!targetId) {
        if (!options.createOnSend) return;
        targetId = createId();
        startConversation({ id: targetId, name: 'New chat', messages: [] });
      }
      appendMessage(
        skin,
        targetId,
        { id: createId(), sender: 'me', text, time: Date.now() },
        { retitle: options.retitleNewConversations }
      );
    },
    [appendMessage, startConversation, skin, activeId, options.createOnSend, options.retitleNewConversations]
  );

  const select = useCallback((id: string) => setSelectedId(id), []);

  const settleMessage = useCallback((messageId: string) => settle(skin, messageId), [settle, skin]);

  const { setReaction } = session;
  const react = useCallback(
    (messageId: string, emoji: string) => {
      if (activeId) setReaction(skin, activeId, messageId, 'me', emoji);
    },
    [setReaction, skin, activeId]
  );

  return {
    conversations,
    active,
    activeId,
    typingIds,
    isTyping: typingIds.includes(activeId),
    send,
    select,
    startConversation,
    settleMessage,
    react
  };
}