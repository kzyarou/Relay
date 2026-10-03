import React from 'react';
import { ArrowLeftIcon, InfoIcon, PhoneIcon, VideoIcon } from 'lucide-react';
import { Avatar } from '../Avatar';
import { MessengerComposer } from './MessengerComposer';
import { MessengerMessageList } from './MessengerMessageList';
import type { Conversation } from '../../types/chat';

interface MessengerChatProps {
  conversation: Conversation;
  isTyping: boolean;
  infoOpen: boolean;
  onSend: (text: string) => void;
  onReact: (messageId: string, emoji: string) => void;
  onBack: () => void;
  onToggleInfo: () => void;
  className?: string;
}

const headerButton =
'flex h-9 w-9 items-center justify-center rounded-full text-messenger-blue transition-colors duration-150 hover:bg-messenger-hover';

export function MessengerChat({
  conversation,
  isTyping,
  infoOpen,
  onSend,
  onReact,
  onBack,
  onToggleInfo,
  className = ''
}: MessengerChatProps) {
  const status = conversation.online ? 'Active now' : conversation.lastActive ? `Active ${conversation.lastActive}` : '';

  return (
    <section className={`${className} min-w-0 flex-1 flex-col`} aria-label={`Conversation with ${conversation.name}`}>
      <header className="flex h-16 shrink-0 items-center gap-2 px-2 shadow-[0_1px_2px_rgba(0,0,0,0.1)] md:px-3">
        <button type="button" aria-label="Back to chats" onClick={onBack} className={`${headerButton} md:hidden`}>
          <ArrowLeftIcon className="h-5 w-5" strokeWidth={2.4} />
        </button>
        <button
          type="button"
          className="flex min-w-0 items-center gap-2.5 rounded-lg p-1.5 text-left transition-colors duration-150 hover:bg-messenger-hover">
          
          <Avatar name={conversation.name} src={conversation.avatar} size={40} online={conversation.online} />
          <span className="min-w-0">
            <span className="block truncate text-[15px] font-semibold leading-5 text-messenger-text">{conversation.name}</span>
            {status && <span className="block truncate text-[13px] leading-4 text-messenger-muted">{status}</span>}
          </span>
        </button>
        <div className="ml-auto flex items-center gap-1">
          <button type="button" aria-label="Start a voice call" className={headerButton}>
            <PhoneIcon className="h-5 w-5" fill="currentColor" strokeWidth={0} />
          </button>
          <button type="button" aria-label="Start a video call" className={headerButton}>
            <VideoIcon className="h-[22px] w-[22px]" fill="currentColor" strokeWidth={0} />
          </button>
          <button
            type="button"
            aria-label="Conversation information"
            aria-pressed={infoOpen}
            onClick={onToggleInfo}
            className={`${headerButton} hidden xl:flex`}>
            
            <InfoIcon className="h-[22px] w-[22px]" fill={infoOpen ? 'currentColor' : 'none'} stroke={infoOpen ? '#fff' : 'currentColor'} strokeWidth={2.2} />
          </button>
        </div>
      </header>

      <MessengerMessageList key={conversation.id} conversation={conversation} isTyping={isTyping} onReact={onReact} />
      <MessengerComposer onSend={onSend} />
    </section>);

}