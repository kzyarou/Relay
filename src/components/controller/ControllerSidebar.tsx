import React from 'react';
import { MessageCircleIcon, SparkleIcon, SquarePenIcon, UserPlusIcon } from 'lucide-react';
import { Avatar } from '../Avatar';
import type { Conversation, Skin } from '../../types/chat';
import { stripMarkdown, typingKey } from '../../utils/session';
import { formatListTime } from '../../utils/time';

interface ControllerSidebarProps {
  skin: Skin;
  onSkinChange: (skin: Skin) => void;
  conversations: Record<Skin, Conversation[]>;
  activeId: string;
  typing: string[];
  receiverName: string;
  onSelect: (id: string) => void;
  onAdd: () => void;
  className?: string;
}

const TABS: {value: Skin;label: string;Icon: typeof MessageCircleIcon;}[] = [
{ value: 'messenger', label: 'Messenger', Icon: MessageCircleIcon },
{ value: 'chatgpt', label: 'ChatGPT', Icon: SparkleIcon }];


export function ControllerSidebar({
  skin,
  onSkinChange,
  conversations,
  activeId,
  typing,
  receiverName,
  onSelect,
  onAdd,
  className = ''
}: ControllerSidebarProps) {
  const list = conversations[skin];
  const AddIcon = skin === 'messenger' ? UserPlusIcon : SquarePenIcon;

  return (
    <aside
      aria-label="Conversations"
      className={`${className} w-full shrink-0 flex-col border-r border-gpt-border bg-gpt-sidebar md:w-[320px]`}>
      
      <div role="tablist" aria-label="App" className="m-3 grid grid-cols-2 gap-1 rounded-xl bg-gpt-hover p-1">
        {TABS.map(({ value, label, Icon }) => {
          const selected = value === skin;
          const waiting = conversations[value].filter((c) => c.messages[c.messages.length - 1]?.sender === 'me').length;
          return (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onSkinChange(value)}
              className={`flex h-8 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg text-[13px] font-medium transition-colors duration-150 ${
              selected ? 'bg-white text-gpt-text shadow-[0_1px_2px_rgba(0,0,0,0.08)]' : 'text-gpt-muted hover:text-gpt-text'}`
              }>
              
              <Icon className="h-3.5 w-3.5" />
              {label}
              {waiting > 0 &&
              <span
                aria-label={`${waiting} awaiting reply`}
                className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-messenger-blue px-1 text-[11px] font-semibold text-white">
                
                  {waiting}
                </span>
              }
            </button>);

        })}
      </div>

      <div className="px-2 pb-1">
        <button
          type="button"
          onClick={onAdd}
          className="flex h-10 w-full items-center gap-3 rounded-xl px-2.5 text-[14px] font-medium transition-colors duration-150 hover:bg-gpt-hover">
          
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gpt-text text-white">
            <AddIcon className="h-3.5 w-3.5" />
          </span>
          {skin === 'messenger' ? 'Add person' : 'New ChatGPT chat'}
        </button>
      </div>

      <ul className="thin-scroll flex-1 overflow-y-auto px-2 pb-3">
        {list.length === 0 &&
        <li className="px-3 py-8 text-center text-[13px] leading-5 text-gpt-muted">
            {skin === 'messenger' ?
          'No people yet. Add someone and they’ll appear in the receiver’s Messenger.' :
          'No ChatGPT chats yet. Start one here, or wait for the receiver to ask something.'}
          </li>
        }
        {list.map((c) => {
          const last = c.messages[c.messages.length - 1];
          const needsReply = last?.sender === 'me';
          const active = c.id === activeId;
          const isTyping = typing.includes(typingKey(skin, c.id));
          const preview = !last ?
          'No messages yet' :
          `${last.sender === 'them' ? 'You: ' : ''}${stripMarkdown(last.text)}`;
          return (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => onSelect(c.id)}
                aria-current={active ? 'true' : undefined}
                className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors duration-150 ${
                active ? 'bg-gpt-active' : 'hover:bg-gpt-hover'}`
                }>
                
                {skin === 'messenger' ?
                <Avatar name={c.name} src={c.avatar} size={40} /> :

                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gpt-border bg-white">
                    <SparkleIcon className="h-4 w-4" />
                  </span>
                }
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className={`truncate text-[14px] ${needsReply ? 'font-semibold' : 'font-medium'}`}>{c.name}</span>
                    {last && <span className="ml-auto shrink-0 text-xs text-gpt-muted">{formatListTime(last.time)}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`truncate text-[13px] ${needsReply ? 'font-medium text-gpt-text' : 'text-gpt-muted'}`}>
                      
                      {isTyping ? 'You’re typing…' : preview}
                    </span>
                    {needsReply &&
                    <span aria-label="Awaiting your reply" className="ml-auto h-2 w-2 shrink-0 rounded-full bg-messenger-blue" />
                    }
                  </div>
                </div>
              </button>
            </li>);

        })}
      </ul>
    </aside>);

}