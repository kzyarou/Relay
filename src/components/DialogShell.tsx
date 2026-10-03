import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface DialogShellProps {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  children: React.ReactNode;
}

const EASE = [0.23, 1, 0.32, 1] as const;

export function DialogShell({ open, onClose, labelledBy, children }: DialogShellProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open &&
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
          aria-hidden="true"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="absolute inset-0 bg-black/40" />
        
          <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby={labelledBy}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.2, ease: EASE }}
          className="relative w-full max-w-sm rounded-2xl bg-white p-5 text-gpt-text shadow-[0_16px_48px_rgba(0,0,0,0.18)]">
          
            {children}
          </motion.div>
        </div>
      }
    </AnimatePresence>);

}