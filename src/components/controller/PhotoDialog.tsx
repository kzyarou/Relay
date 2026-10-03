import React, { useEffect, useId, useRef, useState } from 'react';
import { Loader2Icon, Trash2Icon, UploadIcon } from 'lucide-react';
import { Avatar } from '../Avatar';
import { DialogShell } from '../DialogShell';
import { isImageLink, resizeImageFile } from '../../utils/image';

interface PhotoDialogProps {
  open: boolean;
  name: string;
  currentSrc?: string;
  onSave: (src: string | undefined) => void;
  onClose: () => void;
}

export function PhotoDialog({ open, name, currentSrc, onSave, onClose }: PhotoDialogProps) {
  const id = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [src, setSrc] = useState<string | undefined>(currentSrc);
  const [link, setLink] = useState('');
  const [processing, setProcessing] = useState(false);
  const [broken, setBroken] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setSrc(currentSrc);
    setLink(currentSrc && isImageLink(currentSrc) ? currentSrc : '');
    setProcessing(false);
    setBroken(false);
    setError('');
  }, [open, currentSrc]);

  const choose = (next: string | undefined) => {
    setSrc(next);
    setBroken(false);
    setError('');
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Choose an image file (JPG, PNG, GIF or WebP).');
      return;
    }
    setProcessing(true);
    setError('');
    try {
      choose(await resizeImageFile(file));
      setLink('');
    } catch {
      setError('That image couldn’t be read. Try another file.');
    } finally {
      setProcessing(false);
    }
  };

  const applyLink = () => {
    const clean = link.trim();
    if (!clean) return;
    if (!isImageLink(clean)) {
      setError('Enter a link that starts with http:// or https://');
      return;
    }
    choose(clean);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (processing || broken) return;
    onSave(src);
    onClose();
  };

  const unchanged = src === currentSrc;

  return (
    <DialogShell open={open} onClose={onClose} labelledBy={`${id}-title`}>
      <form onSubmit={submit} noValidate>
        <h2 id={`${id}-title`} className="text-[17px] font-semibold">
          Photo for {name}
        </h2>
        <p className="mt-1 text-[13px] text-gpt-muted">The receiver sees this everywhere {name} appears in Messenger.</p>

        <div className="mt-5 flex items-center gap-4">
          <span className="relative flex h-20 w-20 shrink-0 items-center justify-center">
            {src && !broken ?
            <img
              src={src}
              alt={`Preview of ${name}’s photo`}
              onError={() => {
                setBroken(true);
                setError('That link didn’t load an image. Check the address and try again.');
              }}
              className="h-20 w-20 rounded-full object-cover" /> :


            <Avatar name={name} size={80} />
            }
            {processing &&
            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-white/70">
                <Loader2Icon className="h-5 w-5 animate-spin" aria-label="Processing photo" />
              </span>
            }
          </span>
          <div className="flex flex-col items-start gap-1.5">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={processing}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-gpt-border px-3 text-sm font-medium transition-colors duration-150 hover:bg-gpt-hover disabled:opacity-50">
              
              <UploadIcon className="h-4 w-4" />
              Upload photo
            </button>
            {src &&
            <button
              type="button"
              onClick={() => {
                choose(undefined);
                setLink('');
              }}
              className="flex h-8 items-center gap-1.5 rounded-lg px-2 text-[13px] font-medium text-gpt-muted transition-colors duration-150 hover:bg-gpt-hover hover:text-red-600">
              
                <Trash2Icon className="h-3.5 w-3.5" />
                Remove photo
              </button>
            }
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" tabIndex={-1} aria-hidden="true" />
        </div>

        <label htmlFor={`${id}-link`} className="mb-2 mt-5 block text-sm font-medium">
          Or paste an image link
        </label>
        <div className="flex gap-2">
          <input
            id={`${id}-link`}
            type="url"
            value={link}
            onChange={(e) => {
              setLink(e.target.value);
              if (error) setError('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                applyLink();
              }
            }}
            placeholder="https://…"
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
            className={`h-10 min-w-0 flex-1 rounded-xl border bg-white px-3 text-[14px] placeholder:text-gpt-placeholder focus:outline-none focus:ring-2 focus:ring-black/20 ${
            error ? 'border-red-500' : 'border-gpt-border'}`
            } />
          
          <button
            type="button"
            onClick={applyLink}
            disabled={!link.trim()}
            className="h-10 shrink-0 rounded-xl border border-gpt-border px-3 text-sm font-medium transition-colors duration-150 hover:bg-gpt-hover disabled:opacity-50">
            
            Use link
          </button>
        </div>
        {error &&
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-[13px] text-red-600">
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
            disabled={processing || broken || unchanged}
            className="h-9 rounded-lg bg-gpt-text px-3.5 text-sm font-medium text-white transition-[opacity,transform] duration-150 hover:opacity-90 active:scale-[0.98] disabled:opacity-40">
            
            Save photo
          </button>
        </div>
      </form>
    </DialogShell>);

}