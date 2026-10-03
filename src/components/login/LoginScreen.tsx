import React, { useState } from 'react';
import { ArrowRightIcon, RefreshCwIcon } from 'lucide-react';
import { loginRoles } from '../../data/loginRoles';
import type { Role, SessionUser } from '../../types/session';
import { generateSessionCode, normalizeCode, sessionExists, createInitialState } from '../../utils/session';
import { createSession } from '../../utils/firebaseSession';

interface LoginScreenProps {
  onSignIn: (user: SessionUser) => void;
}

interface FormErrors {
  name?: string;
  code?: string;
}

export function LoginScreen({ onSignIn }: LoginScreenProps) {
  const [role, setRole] = useState<Role>('controller');
  const [name, setName] = useState('');
  const [controllerCode, setControllerCode] = useState(generateSessionCode);
  const [receiverCode, setReceiverCode] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const code = role === 'controller' ? controllerCode : receiverCode;
  const setCode = role === 'controller' ? setControllerCode : setReceiverCode;
  const roleTitle = loginRoles.find((r) => r.value === role)?.title ?? '';

  const chooseRole = (next: Role) => {
    setRole(next);
    setErrors({});
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    const normalized = normalizeCode(code);
    const next: FormErrors = {};
    if (!trimmed) next.name = 'Enter a display name.';
    if (normalized.length < 4) next.code = 'Session codes are at least 4 characters.';else
    if (role === 'receiver' && await sessionExists(normalized) === false)
    next.code = 'No session with that code yet. Ask the controller to sign in first.';
    setErrors(next);
    if (next.name || next.code) return;

    setIsSubmitting(true);

    try {
      console.log('Starting sign-in process...', { role, code: normalized, name: trimmed });

      // Create session in Firebase if controller
      if (role === 'controller') {
        console.log('Creating session in Firebase...');
        await createSession(normalized, createInitialState());
        console.log('Session created successfully');
      }

      console.log('Calling onSignIn...');
      onSignIn({ role, name: trimmed, code: normalized });
      console.log('Sign-in complete');
    } catch (error) {
      console.error('Sign in error:', error);
      setErrors({ code: `Failed to connect: ${error instanceof Error ? error.message : 'Unknown error'}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-gpt-sidebar px-4 py-12 text-gpt-text">
      <div className="w-full max-w-[460px]">
        <h1 className="text-[28px] font-semibold leading-tight tracking-tight">Sign in</h1>
        <p className="mt-2 text-[15px] text-gpt-muted">
          Choose your side of the conversation. Both sides join with the same session code.
        </p>

        <form onSubmit={submit} noValidate className="mt-8 space-y-6">
          <fieldset>
            <legend className="mb-2 text-sm font-medium">I’m signing in as</legend>
            <div role="radiogroup" aria-label="Role" className="grid gap-3 sm:grid-cols-2">
              {loginRoles.map(({ value, title, description, Icon }) => {
                const selected = role === value;
                return (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => chooseRole(value)}
                    className={`flex flex-col rounded-2xl border bg-white p-4 text-left transition-[border-color,box-shadow] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 ${
                    selected ?
                    'border-gpt-text shadow-[0_0_0_1px_#0D0D0D]' :
                    'border-gpt-border hover:border-gpt-placeholder'}`
                    }>
                    
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-150 ${
                      selected ? 'bg-gpt-text text-white' : 'bg-gpt-bubble text-gpt-text'}`
                      }>
                      
                      <Icon className="h-[18px] w-[18px]" />
                    </span>
                    <span className="mt-3 text-[15px] font-semibold">{title}</span>
                    <span className="mt-1 text-[13px] leading-5 text-gpt-muted">{description}</span>
                  </button>);

              })}
            </div>
          </fieldset>

          <div>
            <label htmlFor="display-name" className="mb-2 block text-sm font-medium">
              Display name
            </label>
            <input
              id="display-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={role === 'controller' ? 'e.g. Stephen Harry' : 'e.g. Cedrick James'}
              autoComplete="nickname"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'display-name-error' : undefined}
              className={`h-11 w-full rounded-xl border bg-white px-3.5 text-[15px] placeholder:text-gpt-placeholder focus:outline-none focus:ring-2 focus:ring-black/20 ${
              errors.name ? 'border-red-500' : 'border-gpt-border'}`
              } />
            
            {errors.name &&
            <p id="display-name-error" className="mt-1.5 text-[13px] text-red-600">
                {errors.name}
              </p>
            }
          </div>

          <div>
            <label htmlFor="session-code" className="mb-2 block text-sm font-medium">
              Session code
            </label>
            <div className="relative">
              <input
                id="session-code"
                value={code}
                onChange={(e) => setCode(normalizeCode(e.target.value))}
                placeholder={role === 'controller' ? '' : 'Enter the controller’s code'}
                autoComplete="off"
                spellCheck={false}
                aria-invalid={!!errors.code}
                aria-describedby={errors.code ? 'session-code-error' : 'session-code-hint'}
                className={`h-11 w-full rounded-xl border bg-white px-3.5 font-mono text-[15px] tracking-[0.2em] placeholder:font-sans placeholder:tracking-normal placeholder:text-gpt-placeholder focus:outline-none focus:ring-2 focus:ring-black/20 ${
                role === 'controller' ? 'pr-11' : ''} ${
                errors.code ? 'border-red-500' : 'border-gpt-border'}`} />
              
              {role === 'controller' &&
              <button
                type="button"
                onClick={() => setControllerCode(generateSessionCode())}
                aria-label="Generate a new code"
                title="Generate a new code"
                className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-gpt-muted transition-colors duration-150 hover:bg-gpt-hover hover:text-gpt-text">
                
                  <RefreshCwIcon className="h-4 w-4" />
                </button>
              }
            </div>
            {errors.code ?
            <p id="session-code-error" className="mt-1.5 text-[13px] text-red-600">
                {errors.code}
              </p> :

            <p id="session-code-hint" className="mt-1.5 text-[13px] text-gpt-muted">
                {role === 'controller' ?
              'Share this with the receiver. Reusing a code picks up where you left off.' :
              'Use the code shown on the controller’s screen.'}
              </p>
            }
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gpt-text text-[15px] font-medium text-white transition-[background-color,transform] duration-150 hover:bg-black active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed">

            {isSubmitting ? 'Signing in...' : `Continue as ${roleTitle}`}
            {!isSubmitting && <ArrowRightIcon className="h-4 w-4" />}
          </button>
        </form>

        <p className="mt-6 text-center text-[13px] leading-5 text-gpt-muted">
          Trying it alone? Open this page in a second tab and sign in as the other role with the same code.
        </p>
      </div>
    </main>);

}