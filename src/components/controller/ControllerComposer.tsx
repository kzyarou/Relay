import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUpIcon, WandSparklesIcon } from 'lucide-react';
import { useAutosizeTextarea } from '../../hooks/useAutosizeTextarea';
import type { Conversation, Skin } from '../../types/chat';
import { chatgptReply, messengerReply } from '../../utils/replies';

interface ControllerComposerProps {
  skin: Skin;
  conversation: Conversation;
  /** Whether the receiver is currently seeing a typing indicator from you. */
  typingVisible: boolean;
  onSend: (text: string) => void;
  onTypingChange: (typing: boolean) => void;
}

const TYPING_IDLE_MS = 4000;

export function ControllerComposer({ skin, conversation, typingVisible, onSend, onTypingChange }: ControllerComposerProps) {
  const [text, setText] = useState('');
  const ref = useRef<HTMLTextAreaElement>(null);
  const idleTimer = useRef<number>();
  const typingRef = useRef(false);
  const onTypingRef = useRef(onTypingChange);
  onTypingRef.current = onTypingChange;
  useAutosizeTextarea(ref, text, 240);

  const persona = skin === 'chatgpt' ? 'ChatGPT' : conversation.name;
  const canSend = text.trim().length > 0;

  const setTyping = useCallback((on: boolean) => {
    if (typingRef.current === on) return;
    typingRef.current = on;
    onTypingRef.current(on);
  }, []);

  useEffect(
    () => () => {
      window.clearTimeout(idleTimer.current);
      if (typingRef.current) onTypingRef.current(false);
    },
    []
  );

  const change = (value: string) => {
    setText(value);
    window.clearTimeout(idleTimer.current);
    if (value.trim()) {
      setTyping(true);
      idleTimer.current = window.setTimeout(() => setTyping(false), TYPING_IDLE_MS);
    } else {
      setTyping(false);
    }
  };

  const send = () => {
    const value = text.trim();
    if (!value) return;
    window.clearTimeout(idleTimer.current);
    typingRef.current = false; // Sending clears the indicator on the receiver's side.
    onSend(value);
    setText('');
    ref.current?.focus();
  };

  const suggest = () => {
    const lastIncoming = [...conversation.messages].reverse().find((m) => m.sender === 'me')?.text ?? 'hey';
    change(skin === 'chatgpt' ? chatgptReply(lastIncoming) : messengerReply(lastIncoming));
    ref.current?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="shrink-0 border-t border-gpt-border bg-white px-4 pb-4 pt-3 md:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-2 flex items-center justify-between gap-3 px-1 text-xs text-gpt-muted">
          <span className="truncate">
            Replying as <span className="font-medium text-gpt-text">{persona}</span>
          </span>
          <span aria-live="polite" className="shrink-0">
            {typingVisible ? 'Receiver sees you typing…' : ''}
          </span>
        </div>
        <div className="rounded-2xl border border-gpt-border bg-white focus-within:border-gpt-placeholder">
          <label htmlFor="controller-composer" className="sr-only">
            Message as {persona}
          </label>
          <textarea
            id="controller-composer"
            ref={ref}
            rows={1}
            value={text}
            onChange={(e) => change(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={`Message as ${persona}…`}
            className="thin-scroll block w-full resize-none bg-transparent px-4 pt-3 text-[15px] leading-6 placeholder:text-gpt-placeholder focus:outline-none" />
          
          <div className="flex items-center gap-2 px-2 pb-2 pt-1">
            <button
              type="button"
              onClick={suggest}
              className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[13px] font-medium text-gpt-muted transition-colors duration-150 hover:bg-gpt-hover hover:text-gpt-text">
              
              <WandSparklesIcon className="h-3.5 w-3.5" />
              Suggest reply
            </button>
            <span className="ml-auto hidden text-xs text-gpt-placeholder sm:inline">Enter to send · Shift + Enter for new line</span>
            <button
              type="button"
              onClick={send}
              disabled={!canSend}
              aria-label="Send"
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white transition-[opacity,transform] duration-150 active:scale-95 disabled:opacity-30 sm:ml-0 ml-auto ${
              skin === 'messenger' ? 'bg-messenger-blue' : 'bg-gpt-text'}`
              }>
              
              <ArrowUpIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>);

}