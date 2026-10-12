import { differenceInCalendarDays, format, isToday } from 'date-fns';

export function minutesAgo(minutes: number): number {
  return Date.now() - minutes * 60_000;
}

/** Compact time used in the Messenger chat list ("4m", "2h", "Mon"). */
export function formatListTime(time: number): string {
  const diffMin = Math.max(0, Math.round((Date.now() - time) / 60_000));
  if (diffMin < 1) return 'now';
  if (diffMin < 60) return `${diffMin}m`;
  const diffHours = Math.round(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const days = differenceInCalendarDays(Date.now(), time);
  if (days < 7) return format(time, 'EEE');
  return format(time, 'MMM d');
}

/** Centered time separator between message clusters. */
export function formatSeparator(time: number): string {
  if (isToday(time)) return format(time, 'h:mm a');
  if (differenceInCalendarDays(Date.now(), time) < 7) return format(time, 'EEE h:mm a');
  return format(time, 'MMM d, yyyy, h:mm a');
}