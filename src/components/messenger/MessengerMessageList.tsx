import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Avatar } from '../Avatar';
import { ReactionBadge } from '../ReactionBadge';
import { ReactionPicker } from '../ReactionPicker';
import { MessengerTypingBubble } from './MessengerTypingBubble';
import type { Conversation, Sender } from '../../types/chat';
import { formatSeparator } from '../../utils/time';

interface MessengerMessageListProps {
  conversation: Conversation;
  isTyping: boolean;
  onReact: (messageId: string, emoji: string) => void;
}

const GROUP_GAP = 5 * 60_000;
const SEPARATOR_GAP = 30 * 60_000;
const EMOJI_ONLY = /^(\p{Extended_Pictographic}|\uFE0F|\u200D|\s){1,6}$/u;

export function MessengerMessageList({ conversation, isTyping, onReact }: MessengerMessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const messages = conversation.messages;
  const lastMine = messages.map((m) => m.sender).lastIndexOf('me');

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages.length, isTyping]);

  return (
    <div ref={scrollRef} className="thin-scroll flex-1 overflow-y-auto px-4 pb-3">
      <div className="flex flex-col items-center pb-6 pt-8 text-center">
        <Avatar name={conversation.name} src={conversation.avatar} size={60} />
        <p className="mt-3 text-[17px] font-semibold text-messenger-text">{conversation.name}</p>
        <p className="text-[13px] text-messenger-muted">
          {conversation.isGroup ? 'You created this group' : 'You’re friends on Facebook'}
        </p>
        <button
          type="button"
          className="mt-3 h-9 rounded-md bg-messenger-surface px-3 text-[15px] font-semibold text-messenger-text transition-colors duration-150 hover:bg-messenger-divider">
          
          {conversation.isGroup ? 'View members' : 'View profile'}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {messages.map((m, i) => {
          const prev = messages[i - 1];
          const next = messages[i + 1];
          const separator = !prev || m.time - prev.time > SEPARATOR_GAP;
          const joinsPrev = !!prev && !separator && prev.sender === m.sender && m.time - prev.time < GROUP_GAP;
          const nextSeparates = !!next && next.time - m.time > SEPARATOR_GAP;
          const joinsNext = !!next && !nextSeparates && next.sender === m.sender && next.time - m.time < GROUP_GAP;
          const mine = m.sender === 'me';
          const emojiOnly = EMOJI_ONLY.test(m.text);
          const hasReaction = !!(m.reactions?.me || m.reactions?.them);
          const picker =
          <ReactionPicker
            side={mine ? 'right' : 'left'}
            selected={m.reactions?.me}
            onPick={(emoji) => onReact(m.id, emoji)}
            className="self-center" />;



          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}>
              
              {separator &&
              <p className="my-4 text-center text-xs font-medium text-messenger-muted">{formatSeparator(m.time)}</p>
              }
              <div
                className={`group flex items-end gap-2 ${mine ? 'justify-end' : 'justify-start'} ${
                joinsPrev ? 'mt-[2px]' : separator ? '' : 'mt-2'} ${
                hasReaction ? 'mb-4' : ''}`}>
                
                {!mine &&
                <span className="w-7 shrink-0">
                    {!joinsNext && <Avatar name={conversation.name} src={conversation.avatar} size={28} />}
                  </span>
                }
                {mine && picker}
                <div className="relative min-w-0 max-w-[75%] md:max-w-[65%]">
                  {emojiOnly ?
                  <span className="block px-1 text-[40px] leading-[48px]">{m.text}</span> :

                  <p
                    className={`whitespace-pre-wrap break-words px-3 py-2 text-[15px] leading-5 ${bubbleShape(
                      m.sender,
                      joinsPrev,
                      joinsNext
                    )} ${mine ? 'bg-messenger-blue text-white' : 'bg-messenger-bubble text-messenger-text'}`}>
                    
                      {m.text}
                    </p>
                  }
                  <ReactionBadge reactions={m.reactions} labels={{ me: 'You', them: conversation.name }} className="right-1" />
                </div>
                {!mine && picker}
              </div>
              {i === lastMine && i === messages.length - 1 &&
              <div className="mt-1 flex justify-end">
                  <Avatar name={conversation.name} src={conversation.avatar} size={14} />
                  <span className="sr-only">Seen</span>
                </div>
              }
            </motion.div>);

        })}
      </AnimatePresence>

      <AnimatePresence>
        {isTyping && <MessengerTypingBubble key="typing" name={conversation.name} avatar={conversation.avatar} />}
      </AnimatePresence>
    </div>);

}

const SHAPES: Record<Sender, {middle: string;first: string;last: string;}> = {
  me: {
    middle: 'rounded-[18px] rounded-r-[4px]',
    first: 'rounded-[18px] rounded-br-[4px]',
    last: 'rounded-[18px] rounded-tr-[4px]'
  },
  them: {
    middle: 'rounded-[18px] rounded-l-[4px]',
    first: 'rounded-[18px] rounded-bl-[4px]',
    last: 'rounded-[18px] rounded-tl-[4px]'
  }
};

function bubbleShape(sender: Sender, joinsPrev: boolean, joinsNext: boolean): string {
  if (joinsPrev && joinsNext) return SHAPES[sender].middle;
  if (joinsNext) return SHAPES[sender].first;
  if (joinsPrev) return SHAPES[sender].last;
  return 'rounded-[18px]';
}