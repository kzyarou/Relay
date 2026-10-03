import React from 'react';
import { ArchiveIcon, InboxIcon, MessageCircleIcon, StoreIcon } from 'lucide-react';
import { Avatar } from '../Avatar';
import { useSession } from '../../contexts/SessionContext';

const ITEMS = [
{ label: 'Chats', Icon: MessageCircleIcon, active: true },
{ label: 'Marketplace', Icon: StoreIcon, active: false },
{ label: 'Requests', Icon: InboxIcon, active: false },
{ label: 'Archive', Icon: ArchiveIcon, active: false }];


export function MessengerRail() {
  const { state } = useSession();
  return (
    <nav aria-label="Messenger" className="hidden w-[60px] shrink-0 flex-col items-center gap-1 py-3 lg:flex">
      {ITEMS.map(({ label, Icon, active }) =>
      <button
        key={label}
        type="button"
        aria-label={label}
        aria-current={active ? 'page' : undefined}
        className={`flex h-11 w-11 items-center justify-center rounded-lg transition-colors duration-150 ${
        active ? 'bg-messenger-surface text-messenger-text' : 'text-messenger-muted hover:bg-messenger-hover'}`
        }>
        
          <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 2} />
        </button>
      )}
      <div className="mt-auto">
        <Avatar name={state.receiverName ?? 'You'} size={36} />
      </div>
    </nav>);

}