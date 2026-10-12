import React, { useId } from 'react';
import { DialogShell } from './DialogShell';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDialog({ open, title, description, confirmLabel, onConfirm, onClose }: ConfirmDialogProps) {
  const id = useId();

  return (
    <DialogShell open={open} onClose={onClose} labelledBy={`${id}-title`}>
      <h2 id={`${id}-title`} className="text-[17px] font-semibold">
        {title}
      </h2>
      <p className="mt-2 text-sm leading-5 text-gpt-muted">{description}</p>
      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          autoFocus
          onClick={onClose}
          className="h-9 rounded-lg px-3.5 text-sm font-medium transition-colors duration-150 hover:bg-gpt-hover">
          
          Cancel
        </button>
        <button
          type="button"
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className="h-9 rounded-lg bg-red-600 px-3.5 text-sm font-medium text-white transition-[background-color,transform] duration-150 hover:bg-red-700 active:scale-[0.98]">
          
          {confirmLabel}
        </button>
      </div>
    </DialogShell>);

}