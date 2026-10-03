import React, { useState } from 'react';
import { MessengerChat } from './MessengerChat';
import { MessengerInfoPanel } from './MessengerInfoPanel';
import { MessengerRail } from './MessengerRail';
import { MessengerSidebar } from './MessengerSidebar';
import { TextPromptDialog } from '../TextPromptDialog';
import { useChat } from '../../hooks/useChat';
import { createId } from '../../utils/id';

export function MessengerApp() {
  const chat = useChat('messenger');
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
  const [infoOpen, setInfoOpen] = useState(true);
  const [newChatOpen, setNewChatOpen] = useState(false);

  const startChat = (name: string) => {
    chat.startConversation({ id: createId(), name, online: true, messages: [] });
    setMobileView('chat');
  };

  return (
    <div className="flex h-full w-full bg-white text-messenger-text">
      <MessengerRail />
      <MessengerSidebar
        className={mobileView === 'chat' && chat.active ? 'hidden md:flex' : 'flex'}
        conversations={chat.conversations}
        activeId={chat.activeId}
        typingIds={chat.typingIds}
        onSelect={(id) => {
          chat.select(id);
          setMobileView('chat');
        }}
        onNewChat={() => setNewChatOpen(true)} />
      
      {chat.active ?
      <>
          <MessengerChat
          className={mobileView === 'list' ? 'hidden md:flex' : 'flex'}
          conversation={chat.active}
          isTyping={chat.isTyping}
          infoOpen={infoOpen}
          onSend={chat.send}
          onReact={chat.react}
          onBack={() => setMobileView('list')}
          onToggleInfo={() => setInfoOpen((o) => !o)} />
        
          {infoOpen && <MessengerInfoPanel conversation={chat.active} className="hidden xl:flex" />}
        </> :

      <div className="hidden flex-1 flex-col items-center justify-center gap-3 text-[15px] text-messenger-muted md:flex">
          No chats yet
          <button
          type="button"
          onClick={() => setNewChatOpen(true)}
          className="h-9 rounded-md bg-messenger-blue px-4 text-[15px] font-semibold text-white transition-opacity duration-150 hover:opacity-90">
          
            New message
          </button>
        </div>
      }

      <TextPromptDialog
        open={newChatOpen}
        title="New message"
        label="To"
        placeholder="Type a name"
        submitLabel="Start chat"
        accent="messenger"
        onSubmit={startChat}
        onClose={() => setNewChatOpen(false)} />
      
    </div>);

}