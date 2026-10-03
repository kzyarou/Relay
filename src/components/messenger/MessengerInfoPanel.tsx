import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BanIcon,
  BellIcon,
  BellOffIcon,
  ChevronDownIcon,
  FileIcon,
  FlagIcon,
  ImagesIcon,
  LinkIcon,
  PaletteIcon,
  PencilIcon,
  PinIcon,
  SearchIcon,
  SmileIcon,
  UserIcon } from
'lucide-react';
import { Avatar } from '../Avatar';
import type { Conversation } from '../../types/chat';

interface MessengerInfoPanelProps {
  conversation: Conversation;
  className?: string;
}

const SECTIONS = [
{ title: 'Chat info', items: [{ label: 'View pinned messages', Icon: PinIcon }] },
{
  title: 'Customize chat',
  items: [
  { label: 'Change theme', Icon: PaletteIcon },
  { label: 'Change emoji', Icon: SmileIcon },
  { label: 'Edit nicknames', Icon: PencilIcon }]

},
{
  title: 'Media, files and links',
  items: [
  { label: 'Media', Icon: ImagesIcon },
  { label: 'Files', Icon: FileIcon },
  { label: 'Links', Icon: LinkIcon }]

},
{
  title: 'Privacy & support',
  items: [
  { label: 'Mute notifications', Icon: BellOffIcon },
  { label: 'Block', Icon: BanIcon },
  { label: 'Report', Icon: FlagIcon }]

}];


const QUICK_ACTIONS = [
{ label: 'Profile', Icon: UserIcon },
{ label: 'Mute', Icon: BellIcon },
{ label: 'Search', Icon: SearchIcon }];


export function MessengerInfoPanel({ conversation, className = '' }: MessengerInfoPanelProps) {
  const [open, setOpen] = useState<string[]>(['Customize chat']);
  const toggle = (title: string) =>
  setOpen((prev) => prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]);

  return (
    <aside
      className={`${className} thin-scroll w-[320px] shrink-0 flex-col overflow-y-auto border-l border-messenger-divider px-2 pb-4`}
      aria-label="Conversation details">
      
      <div className="flex flex-col items-center pb-4 pt-6 text-center">
        <Avatar name={conversation.name} src={conversation.avatar} size={72} online={conversation.online} />
        <p className="mt-3 text-[17px] font-semibold text-messenger-text">{conversation.name}</p>
        <p className="text-[13px] text-messenger-muted">
          {conversation.online ? 'Active now' : conversation.lastActive ? `Active ${conversation.lastActive}` : ''}
        </p>
        <div className="mt-4 flex gap-6">
          {QUICK_ACTIONS.map(({ label, Icon }) =>
          <button key={label} type="button" className="flex flex-col items-center gap-1.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-messenger-surface text-messenger-text transition-colors duration-150 hover:bg-messenger-divider">
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <span className="text-[13px] text-messenger-text">{label}</span>
            </button>
          )}
        </div>
      </div>

      {SECTIONS.map((section) => {
        const expanded = open.includes(section.title);
        return (
          <div key={section.title}>
            <button
              type="button"
              aria-expanded={expanded}
              onClick={() => toggle(section.title)}
              className="flex h-11 w-full items-center justify-between rounded-lg px-2 text-[15px] font-semibold text-messenger-text transition-colors duration-150 hover:bg-messenger-hover">
              
              {section.title}
              <ChevronDownIcon
                className={`h-5 w-5 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
                strokeWidth={2.4} />
              
            </button>
            <AnimatePresence initial={false}>
              {expanded &&
              <motion.ul
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                className="overflow-hidden">
                
                  {section.items.map(({ label, Icon }) =>
                <li key={label}>
                      <button
                    type="button"
                    className="flex h-11 w-full items-center gap-3 rounded-lg px-2 text-[15px] font-medium text-messenger-text transition-colors duration-150 hover:bg-messenger-hover">
                    
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-messenger-surface">
                          <Icon className="h-4 w-4" />
                        </span>
                        {label}
                      </button>
                    </li>
                )}
                </motion.ul>
              }
            </AnimatePresence>
          </div>);

      })}
    </aside>);

}