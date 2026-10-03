import React from 'react';

interface AvatarProps {
  name: string;
  src?: string;
  size?: number;
  online?: boolean;
}

const INITIAL_COLORS = ['#E4A11B', '#0084FF', '#E0245E', '#31A24C', '#7B61FF'];

export function Avatar({ name, src, size = 40, online = false }: AvatarProps) {
  const dot = size >= 48 ? 14 : size >= 36 ? 12 : 10;
  const ring = size >= 48 ? 3 : 2;
  const initials = name.
  split(' ').
  map((part) => part[0]).
  slice(0, 2).
  join('').
  toUpperCase();
  const color = INITIAL_COLORS[name.length % INITIAL_COLORS.length];

  return (
    <span className="relative inline-flex shrink-0" style={{ width: size, height: size }}>
      {src ?
      <img src={src} alt="" className="h-full w-full rounded-full object-cover" draggable={false} /> :

      <span
        aria-hidden="true"
        className="flex h-full w-full items-center justify-center rounded-full font-semibold text-white"
        style={{ backgroundColor: color, fontSize: Math.max(10, size * 0.36) }}>
        
          {initials}
        </span>
      }
      {online &&
      <span
        aria-label="Online"
        className="absolute bottom-0 right-0 rounded-full bg-messenger-online"
        style={{ width: dot, height: dot, boxShadow: `0 0 0 ${ring}px #fff` }} />

      }
    </span>);

}