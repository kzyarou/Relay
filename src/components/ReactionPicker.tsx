import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SmilePlusIcon } from 'lucide-react';
import { reactionEmojis } from '../data/reactions';

interface ReactionPickerProps {
  /** Emoji currently chosen by whoever is reacting. Picking it again removes it. */
  selected?: string;
  onPick: (emoji: string) => void;
  /** Which edge of the trigger the emoji tray lines up with. */
  side: 'left' | 'right';
  className?: string;
}

const EASE = [0.23, 1, 0.32, 1] as const;

export function ReactionPicker({ selected, onPick, side, className = '' }: ReactionPickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div
      ref={ref}
      className={`relative shrink-0 transition-opacity duration-150 ${
      open ? 'opacity-100' : 'opacity-0 focus-within:opacity-100 group-hover:opacity-100'} ${
      className}`}>
      
      <button
        type="button"
        aria-label={selected ? `Change reaction (${selected})` : 'React to message'}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex h-7 w-7 items-center justify-center rounded-full text-messenger-muted transition-colors duration-150 hover:bg-messenger-hover hover:text-messenger-text">
        
        <SmilePlusIcon className="h-[18px] w-[18px]" />
      </button>
      <AnimatePresence>
        {open &&
        <motion.div
          role="menu"
          aria-label="Reactions"
          initial={{ opacity: 0, scale: 0.96, y: 4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 4 }}
          transition={{ duration: 0.15, ease: EASE }}
          style={{ transformOrigin: side === 'left' ? 'bottom left' : 'bottom right' }}
          className={`absolute bottom-full z-20 mb-1 flex items-center gap-0.5 rounded-full bg-white p-1 shadow-[0_2px_12px_rgba(0,0,0,0.15)] ${
          side === 'left' ? 'left-0' : 'right-0'}`
          }>
          
            {reactionEmojis.map((emoji) => {
            const active = emoji === selected;
            return (
              <button
                key={emoji}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                aria-label={active ? `Remove ${emoji} reaction` : `React with ${emoji}`}
                onClick={() => {
                  onPick(emoji);
                  setOpen(false);
                }}
                className={`flex h-9 w-9 items-center justify-center rounded-full text-[22px] leading-none transition-[transform,background-color] duration-150 hover:scale-110 hover:bg-messenger-hover ${
                active ? 'bg-messenger-divider' : ''}`
                }>
                
                  {emoji}
                </button>);

          })}
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}