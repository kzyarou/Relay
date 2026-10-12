import React, { useEffect, useRef } from 'react';
import { ArrowLeftIcon, CameraIcon, ImageIcon, PencilIcon, SparkleIcon, Trash2Icon } from 'lucide-react';
import { Avatar } from '../Avatar';
import { ReactionBadge } from '../ReactionBadge';
import { ReactionPicker } from '../ReactionPicker';
import { MarkdownBlocks } from '../chatgpt/MarkdownBlocks';
import type { Conversation, Skin } from '../../types/chat';
import { formatSeparator } from '../../utils/time';

interface ControllerThreadProps {
  skin: Skin;
  conversation: Conversation;
  receiverName: string;
  onBack: () => void;
  onRename: () => void;
  onRemove: () => void;
  onChangePhoto: () => void;
  onReact: (messageId: string, emoji: string) => void;
}

const headerAction =
'flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-[13px] font-medium text-gpt-muted transition-colors duration-150 hover:bg-gpt-hover hover:text-gpt-text';

export function ControllerThread({
  skin,
  conversation,
  receiverName,
  onBack,
  onRename,
  onRemove,
  onChangePhoto,
  onReact
}: ControllerThreadProps) {
  const endRef = useRef<HTMLDivElement>(null);
  const { messages } = conversation;
  const persona = skin === 'chatgpt' ? 'ChatGPT' : conversation.name;
  const last = messages[messages.length - 1];
  const reactable = skin === 'messenger';

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length, conversation.id]);

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-3 border-b border-gpt-border px-4 md:px-6">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to conversations"
          className="-ml-1 flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-150 hover:bg-gpt-hover md:hidden">
          
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        {skin === 'messenger' ?
        <button
          type="button"
          onClick={onChangePhoto}
          aria-label={`Change ${conversation.name}’s photo`}
          className="group/photo relative shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-2">
          
            <Avatar name={conversation.name} src={conversation.avatar} size={40} online={conversation.online} />
            <span
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity duration-150 group-hover/photo:opacity-100">
            
              <CameraIcon className="h-4 w-4" />
            </span>
          </button> :

        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gpt-text text-white">
            <SparkleIcon className="h-4 w-4" />
          </span>
        }
        <div className="min-w-0">
          <h2 className="truncate text-[15px] font-semibold">{conversation.name}</h2>
          <p className="truncate text-[13px] text-gpt-muted">
            {skin === 'messenger' ?
            `You’re speaking as ${conversation.name} in Messenger` :
            'You’re responding as ChatGPT'}
          </p>
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-1">
          {skin === 'messenger' &&
          <button type="button" onClick={onChangePhoto} className={headerAction} aria-label="Change photo">
              <ImageIcon className="h-4 w-4" />
              <span className="hidden lg:inline">Photo</span>
            </button>
          }
          <button type="button" onClick={onRename} className={headerAction} aria-label={skin === 'messenger' ? 'Rename person' : 'Rename chat'}>
            <PencilIcon className="h-4 w-4" />
            <span className="hidden lg:inline">Rename</span>
          </button>
          <button
            type="button"
            onClick={onRemove}
            className={`${headerAction} hover:text-red-600`}
            aria-label={skin === 'messenger' ? 'Remove person' : 'Delete chat'}>
            
            <Trash2Icon className="h-4 w-4" />
            <span className="hidden lg:inline">{skin === 'messenger' ? 'Remove' : 'Delete'}</span>
          </button>
        </div>
      </header>

      <div className="thin-scroll flex-1 overflow-y-auto">
        <ol className="mx-auto flex max-w-3xl flex-col px-4 py-6 md:px-8" aria-label={`Messages with ${receiverName}`}>
          {messages.length === 0 &&
          <li className="py-16 text-center text-[15px] text-gpt-muted">
              No messages yet. Send the first one as {persona}, or wait for {receiverName} to write.
            </li>
          }
          {messages.map((m, i) => {
            const prev = messages[i - 1];
            const startsCluster = !prev || prev.sender !== m.sender;
            const fromReceiver = m.sender === 'me';
            return (
              <li
                key={m.id}
                className={`flex flex-col ${fromReceiver ? 'items-start' : 'items-end'} ${
                startsCluster && i > 0 ? 'mt-5' : i > 0 ? 'mt-1' : ''}`
                }>
                
                {startsCluster &&
                <span className="mb-1 px-1 text-xs text-gpt-muted">
                    <span className="font-medium text-gpt-text">{fromReceiver ? receiverName : `You as ${persona}`}</span>
                    {' · '}
                    {formatSeparator(m.time)}
                  </span>
                }
                {fromReceiver || reactable ?
                <div
                  className={`group flex max-w-[85%] items-center gap-1 ${fromReceiver ? '' : 'flex-row-reverse'} ${
                  reactable && (m.reactions?.me || m.reactions?.them) ? 'mb-4' : ''}`
                  }>
                  
                    <div className="relative min-w-0">
                      <div
                      className={`whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-[15px] leading-snug ${
                      fromReceiver ? 'bg-gpt-bubble' : 'bg-messenger-blue text-white'}`
                      }>
                      
                        {m.text}
                      </div>
                      {reactable &&
                    <ReactionBadge
                      reactions={m.reactions}
                      labels={{ me: receiverName, them: `You as ${persona}` }}
                      className="right-1" />

                    }
                    </div>
                    {reactable &&
                  <ReactionPicker
                    side={fromReceiver ? 'left' : 'right'}
                    selected={m.reactions?.them}
                    onPick={(emoji) => onReact(m.id, emoji)} />

                  }
                  </div> :

                <div className="max-w-[88%] rounded-2xl border border-gpt-border bg-white px-4 py-3">
                    <MarkdownBlocks text={m.text} className="space-y-3 text-[15px] leading-6" />
                  </div>
                }
              </li>);

          })}
          {last?.sender === 'them' &&
          <li className="mt-1 px-1 text-right text-xs text-gpt-muted">{conversation.unread ? 'Delivered' : 'Seen'}</li>
          }
        </ol>
        <div ref={endRef} />
      </div>
    </>);

}