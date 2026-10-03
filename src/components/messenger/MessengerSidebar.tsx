import React, { useMemo, useState } from 'react';
import { MoreHorizontalIcon, SearchIcon, SquarePenIcon } from 'lucide-react';
import { Avatar } from '../Avatar';
import type { Conversation } from '../../types/chat';
import { formatListTime } from '../../utils/time';

interface MessengerSidebarProps {
  conversations: Conversation[];
  activeId: string;
  typingIds: string[];
  onSelect: (id: string) => void;
  onNewChat: () => void;
  className?: string;
}

type Filter = 'All' | 'Unread' | 'Groups';
const FILTERS: Filter[] = ['All', 'Unread', 'Groups'];

export function MessengerSidebar({
  conversations,
  activeId,
  typingIds,
  onSelect,
  onNewChat,
  className = ''
}: MessengerSidebarProps) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('All');

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return conversations.filter((c) => {
      if (q && !c.name.toLowerCase().includes(q)) return false;
      if (filter === 'Unread') return !!c.unread;
      if (filter === 'Groups') return !!c.isGroup;
      return true;
    });
  }, [conversations, query, filter]);

  return (
    <aside
      className={`${className} w-full shrink-0 flex-col border-r border-messenger-divider md:w-[320px] lg:w-[360px]`}
      aria-label="Chats">
      
      <div className="flex items-center justify-between px-4 pb-2 pt-3">
        <h1 className="text-2xl font-bold text-messenger-text">Chats</h1>
        <div className="flex gap-2">
          <button
            type="button"
            aria-label="Options"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-messenger-surface text-messenger-text transition-colors duration-150 hover:bg-messenger-divider">
            
            <MoreHorizontalIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="New message"
            onClick={onNewChat}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-messenger-surface text-messenger-text transition-colors duration-150 hover:bg-messenger-divider">
            
            <SquarePenIcon className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>

      <div className="px-4 pb-2">
        <label className="flex h-9 items-center gap-2 rounded-full bg-messenger-surface px-3">
          <SearchIcon className="h-4 w-4 text-messenger-muted" />
          <span className="sr-only">Search Messenger</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Messenger"
            className="w-full bg-transparent text-[15px] text-messenger-text placeholder:text-messenger-muted focus:outline-none" />
          
        </label>
      </div>

      <div className="flex gap-2 px-4 pb-2" role="tablist" aria-label="Filter chats">
        {FILTERS.map((f) =>
        <button
          key={f}
          type="button"
          role="tab"
          aria-selected={filter === f}
          onClick={() => setFilter(f)}
          className={`h-9 rounded-full px-3 text-[15px] font-semibold transition-colors duration-150 ${
          filter === f ? 'bg-[#EBF5FF] text-[#0064D1]' : 'text-messenger-text hover:bg-messenger-hover'}`
          }>
          
            {f}
          </button>
        )}
      </div>

      <ul className="thin-scroll flex-1 overflow-y-auto px-2 pb-2">
        {visible.length === 0 &&
        <li className="px-4 py-10 text-center text-[15px] text-messenger-muted">
            {conversations.length === 0 ?
          <>
                <p>No chats yet</p>
                <button
              type="button"
              onClick={onNewChat}
              className="mt-3 h-9 rounded-md bg-[#EBF5FF] px-3 text-[15px] font-semibold text-[#0064D1] transition-colors duration-150 hover:bg-[#DCEBFF]">
              
                  New message
                </button>
              </> :

          'No chats found'
          }
          </li>
        }
        {visible.map((c) => {
          const last = c.messages[c.messages.length - 1];
          const typing = typingIds.includes(c.id);
          const active = c.id === activeId;
          const preview = last ? `${last.sender === 'me' ? 'You: ' : ''}${last.text}` : '';
          return (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => onSelect(c.id)}
                aria-current={active ? 'true' : undefined}
                className={`flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors duration-150 ${
                active ? 'bg-messenger-surface' : 'hover:bg-messenger-hover'}`
                }>
                
                <Avatar name={c.name} src={c.avatar} size={56} online={c.online} />
                <div className="min-w-0 flex-1">
                  <div className={`truncate text-[15px] text-messenger-text ${c.unread ? 'font-semibold' : 'font-normal'}`}>
                    {c.name}
                  </div>
                  <div
                    className={`flex text-[13px] ${
                    c.unread ? 'font-semibold text-messenger-text' : 'text-messenger-muted'}`
                    }>
                    
                    <span className="truncate">{typing ? 'Typing…' : preview}</span>
                    {last && !typing && <span className="shrink-0">&nbsp;·&nbsp;{formatListTime(last.time)}</span>}
                  </div>
                </div>
                {c.unread && <span className="h-3 w-3 shrink-0 rounded-full bg-messenger-blue" aria-label="Unread" />}
              </button>
            </li>);

        })}
      </ul>
    </aside>);

}