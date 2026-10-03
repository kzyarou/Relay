import React from 'react';
import { motion } from 'framer-motion';
import { LogOutIcon, MessageCircleIcon, SparkleIcon } from 'lucide-react';
import type { Skin } from '../types/chat';

interface SkinSwitcherProps {
  value: Skin;
  onChange: (skin: Skin) => void;
  onSignOut?: () => void;
}

const OPTIONS: {value: Skin;label: string;Icon: typeof MessageCircleIcon;}[] = [
{ value: 'messenger', label: 'Messenger', Icon: MessageCircleIcon },
{ value: 'chatgpt', label: 'ChatGPT', Icon: SparkleIcon }];


export function SkinSwitcher({ value, onChange, onSignOut }: SkinSwitcherProps) {
  return (
    <div className="fixed bottom-[88px] right-3 z-50 flex items-center gap-0.5 rounded-full border border-black/10 bg-white/90 p-1 shadow-[0_4px_16px_rgba(0,0,0,0.08)] backdrop-blur md:bottom-auto md:right-auto md:left-1/2 md:top-3 md:-translate-x-1/2">
      <div role="radiogroup" aria-label="Chat interface" className="flex items-center gap-0.5">
        {OPTIONS.map(({ value: option, label, Icon }) => {
          const active = option === value;
          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={label}
              onClick={() => onChange(option)}
              className="relative flex h-7 items-center rounded-full px-2.5 text-[13px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 sm:px-3">
              
              {active &&
              <motion.span
                layoutId="skin-pill"
                className="absolute inset-0 rounded-full bg-gpt-text"
                transition={{ type: 'spring', duration: 0.3, bounce: 0.15 }} />

              }
              <span
                className={`relative z-10 flex items-center gap-1.5 whitespace-nowrap transition-colors duration-150 ${
                active ? 'text-white' : 'text-gpt-muted hover:text-gpt-text'}`
                }>
                
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{label}</span>
              </span>
            </button>);

        })}
      </div>
      {onSignOut &&
      <>
          <span aria-hidden="true" className="mx-0.5 h-4 w-px bg-black/10" />
          <button
          type="button"
          onClick={onSignOut}
          aria-label="Sign out"
          title="Sign out"
          className="flex h-7 w-7 items-center justify-center rounded-full text-gpt-muted transition-colors duration-150 hover:bg-gpt-hover hover:text-gpt-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30">
          
            <LogOutIcon className="h-3.5 w-3.5" />
          </button>
        </>
      }
    </div>);

}