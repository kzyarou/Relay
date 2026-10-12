import React, { useState } from 'react';
import { CheckIcon, CopyIcon, LogOutIcon, MessageCircleIcon, SparkleIcon } from 'lucide-react';
import type { Skin } from '../../types/chat';

interface ControllerHeaderProps {
  code: string;
  userName: string;
  receiverName?: string;
  receiverSkin: Skin;
  onReceiverSkinChange: (skin: Skin) => void;
  onSignOut: () => void;
}

const SCREEN_OPTIONS: {value: Skin;label: string;Icon: typeof MessageCircleIcon;}[] = [
{ value: 'messenger', label: 'Messenger', Icon: MessageCircleIcon },
{ value: 'chatgpt', label: 'ChatGPT', Icon: SparkleIcon }];


export function ControllerHeader({
  code,
  userName,
  receiverName,
  receiverSkin,
  onReceiverSkinChange,
  onSignOut
}: ControllerHeaderProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-gpt-border bg-white px-4">
      <div className="flex min-w-0 items-center gap-3">
        <span className="text-[15px] font-semibold">Controller</span>
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? 'Session code copied' : `Copy session code ${code}`}
          className="flex h-8 items-center gap-2 rounded-lg border border-gpt-border px-2.5 text-[13px] transition-colors duration-150 hover:bg-gpt-hover">
          
          <span className="text-gpt-muted">Session</span>
          <span className="font-mono font-medium tracking-[0.15em]">{code}</span>
          {copied ? <CheckIcon className="h-3.5 w-3.5" /> : <CopyIcon className="h-3.5 w-3.5 text-gpt-muted" />}
        </button>
        <span className="hidden items-center gap-1.5 truncate text-[13px] text-gpt-muted sm:flex">
          <span
            aria-hidden="true"
            className={`h-2 w-2 shrink-0 rounded-full ${receiverName ? 'bg-messenger-online' : 'bg-gpt-placeholder'}`} />
          
          {receiverName ? `${receiverName} joined` : 'Waiting for a receiver to join'}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <div className="flex items-center gap-2">
          <span id="receiver-screen-label" className="hidden text-[13px] text-gpt-muted lg:inline">
            Receiver sees
          </span>
          <div
            role="radiogroup"
            aria-labelledby="receiver-screen-label"
            aria-label="App shown to the receiver"
            className="flex items-center gap-0.5 rounded-lg bg-gpt-hover p-0.5">
            
            {SCREEN_OPTIONS.map(({ value, label, Icon }) => {
              const selected = value === receiverSkin;
              return (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={label}
                  title={`Show ${label} to the receiver`}
                  onClick={() => onReceiverSkinChange(value)}
                  className={`flex h-7 items-center gap-1.5 whitespace-nowrap rounded-md px-2 text-[13px] font-medium transition-colors duration-150 ${
                  selected ? 'bg-white text-gpt-text shadow-[0_1px_2px_rgba(0,0,0,0.08)]' : 'text-gpt-muted hover:text-gpt-text'}`
                  }>
                  
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden md:inline">{label}</span>
                </button>);

            })}
          </div>
        </div>
        <span aria-hidden="true" className="mx-1 hidden h-4 w-px bg-gpt-border md:block" />
        <span className="hidden text-[13px] text-gpt-muted xl:inline">{userName}</span>
        <button
          type="button"
          onClick={onSignOut}
          className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[13px] font-medium transition-colors duration-150 hover:bg-gpt-hover">
          
          <LogOutIcon className="h-3.5 w-3.5" />
          Sign out
        </button>
      </div>
    </header>);

}