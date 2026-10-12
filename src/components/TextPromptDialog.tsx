import React, { useEffect, useId, useState } from 'react';
import { DialogShell } from './DialogShell';

interface TextPromptDialogProps {
  open: boolean;
  title: string;
  label: string;
  placeholder?: string;
  initialValue?: string;
  submitLabel: string;
  /** Messenger-blue primary button for dialogs shown inside the Messenger UI. */
  accent?: 'neutral' | 'messenger';
  onSubmit: (value: string) => void;
  onClose: () => void;
}

export function TextPromptDialog({
  open,
  title,
  label,
  placeholder,
  initialValue = '',
  submitLabel,
  accent = 'neutral',
  onSubmit,
  onClose
}: TextPromptDialogProps) {
  const id = useId();
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setValue(initialValue);
      setError('');
    }
  }, [open, initialValue]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = value.trim();
    if (!clean) {
      setError(`${label} can’t be empty.`);
      return;
    }
    onSubmit(clean);
    onClose();
  };

  return (
    <DialogShell open={open} onClose={onClose} labelledBy={`${id}-title`}>
      <form onSubmit={submit} noValidate>
        <h2 id={`${id}-title`} className="text-[17px] font-semibold">
          {title}
        </h2>
        <label htmlFor={`${id}-input`} className="mb-2 mt-4 block text-sm font-medium">
          {label}
        </label>
        <input
          id={`${id}-input`}
          autoFocus
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError('');
          }}
          placeholder={placeholder}
          maxLength={60}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`h-11 w-full rounded-xl border bg-white px-3.5 text-[15px] placeholder:text-gpt-placeholder focus:outline-none focus:ring-2 focus:ring-black/20 ${
          error ? 'border-red-500' : 'border-gpt-border'}`
          } />
        
        {error &&
        <p id={`${id}-error`} className="mt-1.5 text-[13px] text-red-600">
            {error}
          </p>
        }
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-lg px-3.5 text-sm font-medium transition-colors duration-150 hover:bg-gpt-hover">
            
            Cancel
          </button>
          <button
            type="submit"
            className={`h-9 rounded-lg px-3.5 text-sm font-medium text-white transition-[opacity,transform] duration-150 hover:opacity-90 active:scale-[0.98] ${
            accent === 'messenger' ? 'bg-messenger-blue' : 'bg-gpt-text'}`
            }>
            
            {submitLabel}
          </button>
        </div>
      </form>
    </DialogShell>);

}