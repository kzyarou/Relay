import React from 'react';
import { motion } from 'framer-motion';
import type { Reactions, Sender } from '../types/chat';

interface ReactionBadgeProps {
  reactions?: Reactions;
  /** Display names for each side, used in the accessible description. */
  labels: Record<Sender, string>;
  className?: string;
}

const ORDER: Sender[] = ['them', 'me'];

export function ReactionBadge({ reactions, labels, className = '' }: ReactionBadgeProps) {
  const entries = ORDER.flatMap((by) => {
    const emoji = reactions?.[by];
    return emoji ? [{ by, emoji }] : [];
  });
  if (entries.length === 0) return null;

  const unique = Array.from(new Set(entries.map((e) => e.emoji)));
  const description = entries.map((e) => `${labels[e.by]} reacted ${e.emoji}`).join(', ');

  return (
    <motion.span
      role="img"
      aria-label={description}
      title={description}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
      className={`absolute -bottom-3.5 z-10 flex h-[22px] items-center gap-px rounded-full bg-white px-1 text-[13px] leading-none shadow-[0_1px_3px_rgba(0,0,0,0.2)] ${className}`}>
      
      {unique.map((emoji) =>
      <span key={emoji} aria-hidden="true">
          {emoji}
        </span>
      )}
      {entries.length > 1 &&
      <span aria-hidden="true" className="px-0.5 text-[11px] font-medium text-messenger-muted">
          {entries.length}
        </span>
      }
    </motion.span>);

}