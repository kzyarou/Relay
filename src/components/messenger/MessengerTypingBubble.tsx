import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Avatar } from '../Avatar';

interface MessengerTypingBubbleProps {
  name: string;
  avatar?: string;
}

export function MessengerTypingBubble({ name, avatar }: MessengerTypingBubbleProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
      style={{ transformOrigin: 'bottom left' }}
      className="mt-2 flex items-end gap-2">
      
      <Avatar name={name} src={avatar} size={28} />
      <div
        role="status"
        aria-label={`${name} is typing`}
        className="flex h-9 items-center gap-[3px] rounded-[18px] bg-messenger-bubble px-3">
        
        {[0, 1, 2].map((i) =>
        <motion.span
          key={i}
          className="h-2 w-2 rounded-full bg-messenger-dot"
          animate={reduce ? { opacity: 0.7 } : { opacity: [0.35, 1, 0.35], y: [0, -3, 0] }}
          transition={reduce ? undefined : { duration: 1.2, repeat: Infinity, delay: i * 0.18, ease: 'easeInOut' }} />

        )}
      </div>
    </motion.div>);

}