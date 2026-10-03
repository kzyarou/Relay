import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { AssistantMessage } from './AssistantMessage';
import type { Conversation } from '../../types/chat';

interface ChatGPTThreadProps {
  conversation: Conversation;
  isTyping: boolean;
  onSettle: (id: string) => void;
}

export function ChatGPTThread({ conversation, isTyping, onSettle }: ChatGPTThreadProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const stick = useRef(true);
  const reduce = useReducedMotion();
  const messages = conversation.messages;

  useEffect(() => {
    const el = scrollRef.current;
    const content = contentRef.current;
    if (!el || !content) return;
    el.scrollTop = el.scrollHeight;
    const observer = new ResizeObserver(() => {
      if (stick.current) el.scrollTop = el.scrollHeight;
    });
    observer.observe(content);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (messages[messages.length - 1]?.sender === 'me') stick.current = true;
  }, [messages]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (el) stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  return (
    <div ref={scrollRef} onScroll={onScroll} className="thin-scroll flex-1 overflow-y-auto">
      <div ref={contentRef} className="mx-auto w-full max-w-3xl px-4 pb-10 pt-4 md:px-6">
        <AnimatePresence initial={false}>
          {messages.map((m, i) =>
          m.sender === 'me' ?
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className={`flex justify-end ${i === 0 ? 'mt-4' : 'mt-10'}`}>
            
                <p className="max-w-[85%] whitespace-pre-wrap break-words rounded-[18px] bg-gpt-bubble px-4 py-2.5 text-base leading-6 text-gpt-text md:max-w-[70%]">
                  {m.text}
                </p>
              </motion.div> :

          <AssistantMessage key={m.id} message={m} onSettle={onSettle} />

          )}
        </AnimatePresence>

        <AnimatePresence>
          {isTyping &&
          <motion.div
            key="thinking"
            role="status"
            aria-label="ChatGPT is thinking"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="mt-6 flex h-7 items-center">
            
              <motion.span
              className="block h-3 w-3 rounded-full bg-gpt-text"
              animate={reduce ? undefined : { scale: [1, 0.7, 1], opacity: [1, 0.6, 1] }}
              transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }} />
            
            </motion.div>
          }
        </AnimatePresence>
      </div>
    </div>);

}