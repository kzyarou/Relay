import React, { FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { ArrowUpIcon, AudioLinesIcon, MicIcon, PlusIcon } from 'lucide-react';
import { useAutosizeTextarea } from '../../hooks/useAutosizeTextarea';

interface ChatGPTComposerProps {
  busy: boolean;
  onSend: (text: string) => void;
  autoFocus?: boolean;
}

export function ChatGPTComposer({ busy, onSend, autoFocus = false }: ChatGPTComposerProps) {
  const [value, setValue] = useState('');
  const ref = useRef<HTMLTextAreaElement>(null);
  useAutosizeTextarea(ref, value, 208);
  const hasText = value.trim().length > 0;

  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    if (!hasText || busy) return;
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
    <form onSubmit={submit} className="w-full">
      <div className="flex items-end gap-1 rounded-[28px] bg-white p-2.5 shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_4px_16px_rgba(0,0,0,0.06)]">
        <button
          type="button"
          aria-label="Add photos and files"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gpt-text transition-colors duration-150 hover:bg-gpt-hover">
          
          <PlusIcon className="h-5 w-5" />
        </button>
        <label htmlFor="chatgpt-input" className="sr-only">
          Ask anything
        </label>
        <textarea
          id="chatgpt-input"
          ref={ref}
          rows={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Ask anything"
          className="max-h-52 min-h-9 flex-1 resize-none bg-transparent px-1 py-[7px] text-base leading-6 text-gpt-text placeholder:text-gpt-placeholder focus:outline-none" />
        
        <button
          type="button"
          aria-label="Dictate"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gpt-text transition-colors duration-150 hover:bg-gpt-hover">
          
          <MicIcon className="h-5 w-5" />
        </button>
        {busy ?
        <button
          type="button"
          disabled
          aria-label="Generating response"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gpt-text">
          
            <span className="h-3 w-3 rounded-[2px] bg-white" />
          </button> :
        hasText ?
        <button
          type="submit"
          aria-label="Send prompt"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gpt-text text-white transition-opacity duration-150 hover:opacity-80">
          
            <ArrowUpIcon className="h-5 w-5" strokeWidth={2.4} />
          </button> :

        <button
          type="button"
          aria-label="Start voice mode"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gpt-text text-white transition-opacity duration-150 hover:opacity-80">
          
            <AudioLinesIcon className="h-[18px] w-[18px]" />
          </button>
        }
      </div>
    </form>);

}