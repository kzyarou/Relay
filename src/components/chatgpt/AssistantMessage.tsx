import React, { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { CheckIcon, CopyIcon, RefreshCwIcon, ThumbsDownIcon, ThumbsUpIcon, Volume2Icon } from 'lucide-react';
import { MarkdownBlocks } from './MarkdownBlocks';
import type { Message } from '../../types/chat';

interface AssistantMessageProps {
  message: Message;
  onSettle: (id: string) => void;
}

const actionButton =
'flex h-8 w-8 items-center justify-center rounded-lg text-gpt-muted transition-colors duration-150 hover:bg-gpt-hover hover:text-gpt-text';

export function AssistantMessage({ message, onSettle }: AssistantMessageProps) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(message.animate && !reduce ? 0 : message.text.length);
  const [copied, setCopied] = useState(false);
  const done = shown >= message.text.length;

  useEffect(() => {
    if (done) {
      if (message.animate) onSettle(message.id);
      return;
    }
    const t = window.setTimeout(() => {
      setShown((s) => Math.min(message.text.length, s + 3 + Math.floor(Math.random() * 4)));
    }, 16);
    return () => window.clearTimeout(t);
  }, [shown, done, message.animate, message.id, message.text.length, onSettle]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message.text.replace(/\*\*/g, ''));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="mt-5" aria-live={message.animate ? 'polite' : undefined}>
      <MarkdownBlocks text={message.text.slice(0, shown)} className="space-y-4 text-base leading-7 text-gpt-text" />

      {done &&
      <div className="-ml-2 mt-1 flex items-center">
          <button type="button" aria-label={copied ? 'Copied' : 'Copy'} onClick={copy} className={actionButton}>
            {copied ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
          </button>
          <button type="button" aria-label="Good response" className={actionButton}>
            <ThumbsUpIcon className="h-4 w-4" />
          </button>
          <button type="button" aria-label="Bad response" className={actionButton}>
            <ThumbsDownIcon className="h-4 w-4" />
          </button>
          <button type="button" aria-label="Read aloud" className={actionButton}>
            <Volume2Icon className="h-4 w-4" />
          </button>
          <button type="button" aria-label="Try again" className={actionButton}>
            <RefreshCwIcon className="h-4 w-4" />
          </button>
        </div>
      }
    </div>);

}