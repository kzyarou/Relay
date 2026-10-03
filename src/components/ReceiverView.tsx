import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SkinSwitcher } from './SkinSwitcher';
import { ChatGPTApp } from './chatgpt/ChatGPTApp';
import { MessengerApp } from './messenger/MessengerApp';
import { useSession } from '../contexts/SessionContext';
import type { Skin } from '../types/chat';
import type { SessionUser } from '../types/session';

interface ReceiverViewProps {
  user: SessionUser;
  initialSkin: Skin;
  onSignOut: () => void;
}

const TAP_WINDOW_MS = 600;

/**
 * The receiver sees a clean app with no visible switcher. The app is chosen by the controller,
 * or from a hidden menu: ⌘/Ctrl + Shift + K, or triple-tap the bottom-left corner.
 */
export function ReceiverView({ user, initialSkin, onSignOut }: ReceiverViewProps) {
  const { state, setReceiverName, setReceiverSkin } = useSession();
  const skin = state.receiverSkin ?? initialSkin;
  const [menuOpen, setMenuOpen] = useState(false);
  const taps = useRef<number[]>([]);

  useEffect(() => setReceiverName(user.name), [setReceiverName, user.name]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setMenuOpen((open) => !open);
      } else if (e.key === 'Escape') {
        setMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const onCornerTap = () => {
    const now = Date.now();
    taps.current = [...taps.current.filter((t) => now - t < TAP_WINDOW_MS), now];
    if (taps.current.length >= 3) {
      taps.current = [];
      setMenuOpen((open) => !open);
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-white">
      {/* Both interfaces stay mounted so each keeps its place when you switch. */}
      <motion.div
        initial={false}
        animate={{ opacity: skin === 'messenger' ? 1 : 0 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="h-full w-full"
        style={{ display: skin === 'messenger' ? 'block' : 'none' }}>
        
        <MessengerApp />
      </motion.div>
      <motion.div
        initial={false}
        animate={{ opacity: skin === 'chatgpt' ? 1 : 0 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="h-full w-full"
        style={{ display: skin === 'chatgpt' ? 'block' : 'none' }}>
        
        <ChatGPTApp />
      </motion.div>

      <div
        aria-hidden="true"
        onClick={onCornerTap}
        className="fixed bottom-0 left-0 z-40 h-6 w-6" />
      

      <AnimatePresence>
        {menuOpen &&
        <motion.div
          key="hidden-menu"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}>
          
            <SkinSwitcher
            value={skin}
            onChange={(next) => {
              setReceiverSkin(next);
              setMenuOpen(false);
            }}
            onSignOut={onSignOut} />
          
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}