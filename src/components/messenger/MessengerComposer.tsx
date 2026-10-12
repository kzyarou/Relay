import React, { FormEvent, KeyboardEvent, useRef, useState } from 'react';
import { CirclePlusIcon, ImageIcon, SendHorizontalIcon, SmileIcon, StickerIcon, ThumbsUpIcon } from 'lucide-react';
import { useAutosizeTextarea } from '../../hooks/useAutosizeTextarea';

interface MessengerComposerProps {
  onSend: (text: string) => void;
}

const iconButton =
'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-messenger-blue transition-colors duration-150 hover:bg-messenger-hover';

export function MessengerComposer({ onSend }: MessengerComposerProps) {
  const [value, setValue] = useState('');
  const ref = useRef<HTMLTextAreaElement>(null);
  useAutosizeTextarea(ref, value, 120);
  const hasText = value.trim().length > 0;

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    if (!hasText) return;
    onSend(value);
    setValue('');
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <form onSubmit={submit} className="flex items-end gap-1 px-2 py-3">
      <button type="button" aria-label="Open more actions" className={iconButton}>
        <CirclePlusIcon className="h-5 w-5" strokeWidth={2.2} />
      </button>
      {!hasText &&
      <>
          <button type="button" aria-label="Attach a file" className={iconButton}>
            <ImageIcon className="h-5 w-5" strokeWidth={2.2} />
          </button>
          <button type="button" aria-label="Choose a sticker" className={iconButton}>
            <StickerIcon className="h-5 w-5" strokeWidth={2.2} />
          </button>
          <button type="button" aria-label="Choose a GIF" className={`${iconButton} hidden sm:flex`}>
            <span className="flex h-[18px] w-[22px] items-center justify-center rounded-[4px] bg-messenger-blue text-[9px] font-bold text-white">
              GIF
            </span>
          </button>
        </>
      }

      <div className="flex min-h-9 flex-1 items-end rounded-[20px] bg-messenger-surface">
        <label htmlFor="messenger-input" className="sr-only">
          Message
        </label>
        <textarea
          id="messenger-input"
          ref={ref}
          rows={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Aa"
          className="max-h-[120px] flex-1 resize-none bg-transparent py-2 pl-3 text-[15px] leading-5 text-messenger-text placeholder:text-messenger-muted focus:outline-none" />
        
        <button type="button" aria-label="Choose an emoji" className={`${iconButton} h-9 w-9`}>
          <SmileIcon className="h-5 w-5" strokeWidth={2.2} />
        </button>
      </div>

      {hasText ?
      <button type="submit" aria-label="Press Enter to send" className={iconButton}>
          <SendHorizontalIcon className="h-5 w-5" fill="currentColor" />
        </button> :

      <button type="button" aria-label="Send a like" onClick={() => onSend('👍')} className={iconButton}>
          <ThumbsUpIcon className="h-5 w-5" fill="currentColor" />
        </button>
      }
    </form>);

}