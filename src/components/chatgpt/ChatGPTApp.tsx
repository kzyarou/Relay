import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChatGPTComposer } from './ChatGPTComposer';
import { ChatGPTHeader } from './ChatGPTHeader';
import { ChatGPTSidebar } from './ChatGPTSidebar';
import { ChatGPTThread } from './ChatGPTThread';
import { useChat } from '../../hooks/useChat';
import { createId } from '../../utils/id';

const EASE = [0.23, 1, 0.32, 1] as const;

export function ChatGPTApp() {
  const chat = useChat('chatgpt', { retitleNewConversations: true, createOnSend: true });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebar, setMobileSidebar] = useState(false);

  const active = chat.active;
  const isEmpty = !active || active.messages.length === 0;
  const busy = chat.isTyping || !!active?.messages.some((m) => m.animate);

  const newChat = () => {
    setMobileSidebar(false);
    if (active && active.messages.length === 0) return;
    chat.startConversation({ id: createId(), name: 'New chat', messages: [] });
  };

  const sidebar = (onClose: () => void) =>
  <ChatGPTSidebar
    conversations={chat.conversations}
    activeId={chat.activeId}
    onSelect={(id) => {
      chat.select(id);
      setMobileSidebar(false);
    }}
    onNewChat={newChat}
    onClose={onClose} />;



  return (
    <div className="flex h-full w-full bg-white text-gpt-text">
      <AnimatePresence initial={false}>
        {sidebarOpen &&
        <motion.aside
          key="sidebar"
          initial={{ width: 0 }}
          animate={{ width: 260 }}
          exit={{ width: 0 }}
          transition={{ duration: 0.2, ease: EASE }}
          className="hidden shrink-0 overflow-hidden border-r border-black/5 md:block">
          
            {sidebar(() => setSidebarOpen(false))}
          </motion.aside>
        }
      </AnimatePresence>

      <AnimatePresence>
        {mobileSidebar &&
        <>
            <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={() => setMobileSidebar(false)}
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            aria-hidden="true" />
          
            <motion.aside
            key="mobile-sidebar"
            initial={{ x: -260 }}
            animate={{ x: 0 }}
            exit={{ x: -260 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="fixed inset-y-0 left-0 z-50 md:hidden">
            
              {sidebar(() => setMobileSidebar(false))}
            </motion.aside>
          </>
        }
      </AnimatePresence>

      <main className="flex min-w-0 flex-1 flex-col">
        <ChatGPTHeader
          sidebarOpen={sidebarOpen}
          isEmpty={isEmpty}
          onOpenSidebar={() => setSidebarOpen(true)}
          onOpenMobileSidebar={() => setMobileSidebar(true)}
          onNewChat={newChat} />
        

        {isEmpty || !active ?
        <div className="flex flex-1 flex-col items-center justify-center px-4 pb-[14vh]">
            <h1 className="mb-7 text-center text-[28px] font-normal leading-tight text-gpt-text">
              What’s on your mind today?
            </h1>
            <div className="w-full max-w-3xl">
              <ChatGPTComposer key={chat.activeId} busy={busy} onSend={chat.send} autoFocus />
            </div>
          </div> :

        <>
            <ChatGPTThread
            key={active.id}
            conversation={active}
            isTyping={chat.isTyping}
            onSettle={chat.settleMessage} />
          
            <div className="mx-auto w-full max-w-3xl shrink-0 px-4 md:px-6">
              <ChatGPTComposer busy={busy} onSend={chat.send} />
              <p className="py-2.5 text-center text-xs text-gpt-muted">
                ChatGPT can make mistakes. Check important info.
              </p>
            </div>
          </>
        }
      </main>
    </div>);

}