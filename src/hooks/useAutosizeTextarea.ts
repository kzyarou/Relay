import { RefObject, useLayoutEffect } from 'react';

export function useAutosizeTextarea(ref: RefObject<HTMLTextAreaElement>, value: string, maxHeight = 200) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
    el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }, [ref, value, maxHeight]);
}