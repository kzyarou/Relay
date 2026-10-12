import React from 'react';
import { EllipsisIcon, ImagesIcon, LayoutGridIcon, PanelLeftIcon, SearchIcon, SparkleIcon, SquarePenIcon } from 'lucide-react';
import { useSession } from '../../contexts/SessionContext';
import type { Conversation } from '../../types/chat';
import { initials } from '../../utils/session';

interface ChatGPTSidebarProps {
  conversations: Conversation[];
  activeId: string;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onClose: () => void;
}

const itemClass =
'flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-sm text-gpt-text transition-colors duration-150 hover:bg-gpt-hover';

export function ChatGPTSidebar({ conversations, activeId, onSelect, onNewChat, onClose }: ChatGPTSidebarProps) {
  const { state } = useSession();
  const profileName = state.receiverName ?? 'You';
  const history = conversations.filter((c) => c.messages.length > 0);

  return (
    <div className="flex h-full w-[260px] flex-col bg-gpt-sidebar">
      <div className="flex h-14 shrink-0 items-center justify-between px-2">
        <button
          type="button"
          aria-label="Home"
          onClick={onNewChat}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gpt-text transition-colors duration-150 hover:bg-gpt-hover">
          
          <SparkleIcon className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gpt-muted transition-colors duration-150 hover:bg-gpt-hover">
          
          <PanelLeftIcon className="h-5 w-5" />
        </button>
      </div>

      <nav className="thin-scroll flex-1 overflow-y-auto px-1.5 pb-3" aria-label="Chat history">
        <button type="button" onClick={onNewChat} className={itemClass}>
          <SquarePenIcon className="h-[18px] w-[18px]" />
          New chat
        </button>
        <button type="button" className={itemClass}>
          <SearchIcon className="h-[18px] w-[18px]" />
          Search chats
        </button>
        <button type="button" className={itemClass}>
          <ImagesIcon className="h-[18px] w-[18px]" />
          Library
        </button>
        <button type="button" className={`${itemClass} mt-4`}>
          <LayoutGridIcon className="h-[18px] w-[18px]" />
          GPTs
        </button>

        <h2 className="mt-5 px-2.5 pb-1 text-sm text-gpt-muted">Chats</h2>
        {history.length === 0 && <p className="px-2.5 py-1 text-sm text-gpt-placeholder">No chats yet</p>}
        <ul>
          {history.map((c) => {
            const active = c.id === activeId;
            return (
              <li key={c.id} className="group relative">
                <button
                  type="button"
                  onClick={() => onSelect(c.id)}
                  aria-current={active ? 'true' : undefined}
                  className={`flex h-9 w-full items-center rounded-lg pl-2.5 pr-9 text-left text-sm text-gpt-text transition-colors duration-150 ${
                  active ? 'bg-gpt-active' : 'hover:bg-gpt-hover'}`
                  }>
                  
                  <span className="truncate">{c.name}</span>
                </button>
                <button
                  type="button"
                  aria-label={`Options for ${c.name}`}
                  className={`absolute right-1 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-gpt-muted transition-opacity duration-150 hover:text-gpt-text group-hover:opacity-100 ${
                  active ? 'opacity-100' : 'opacity-0 focus-visible:opacity-100'}`
                  }>
                  
                  <EllipsisIcon className="h-4 w-4" />
                </button>
              </li>);

          })}
        </ul>
      </nav>

      <div className="shrink-0 px-1.5 py-2">
        <button type="button" className="flex w-full items-center gap-2.5 rounded-lg p-2 text-left transition-colors duration-150 hover:bg-gpt-hover">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#5E5BE6] text-xs font-semibold text-white">
            {initials(profileName)}
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-sm text-gpt-text">{profileName}</span>
            <span className="block text-xs text-gpt-muted">Plus</span>
          </span>
        </button>
      </div>
    </div>);

}