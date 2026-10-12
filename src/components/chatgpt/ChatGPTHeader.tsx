import React from 'react';
import { ChevronDownIcon, EllipsisIcon, MenuIcon, PanelLeftIcon, ShareIcon, SquarePenIcon } from 'lucide-react';

interface ChatGPTHeaderProps {
  sidebarOpen: boolean;
  isEmpty: boolean;
  onOpenSidebar: () => void;
  onOpenMobileSidebar: () => void;
  onNewChat: () => void;
}

const iconButton =
'flex h-9 w-9 items-center justify-center rounded-lg text-gpt-muted transition-colors duration-150 hover:bg-gpt-hover';

export function ChatGPTHeader({ sidebarOpen, isEmpty, onOpenSidebar, onOpenMobileSidebar, onNewChat }: ChatGPTHeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between px-2 md:px-3">
      <div className="flex items-center gap-0.5">
        <button type="button" aria-label="Open sidebar" onClick={onOpenMobileSidebar} className={`${iconButton} md:hidden`}>
          <MenuIcon className="h-5 w-5" />
        </button>
        {!sidebarOpen &&
        <div className="hidden items-center gap-0.5 md:flex">
            <button type="button" aria-label="Open sidebar" onClick={onOpenSidebar} className={iconButton}>
              <PanelLeftIcon className="h-5 w-5" />
            </button>
            <button type="button" aria-label="New chat" onClick={onNewChat} className={iconButton}>
              <SquarePenIcon className="h-5 w-5" />
            </button>
          </div>
        }
        <button
          type="button"
          className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-lg text-gpt-text transition-colors duration-150 hover:bg-gpt-hover">
          
          ChatGPT
          <ChevronDownIcon className="h-4 w-4 text-gpt-muted" />
        </button>
      </div>

      <div className="flex items-center gap-1">
        {!isEmpty &&
        <button
          type="button"
          className="flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-gpt-text transition-colors duration-150 hover:bg-gpt-hover">
          
            <ShareIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Share</span>
          </button>
        }
        <button type="button" aria-label="Conversation options" className={iconButton}>
          <EllipsisIcon className="h-5 w-5" />
        </button>
      </div>
    </header>);

}