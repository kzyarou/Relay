import React from 'react';
import { ReceiverView } from './components/ReceiverView';
import { ControllerConsole } from './components/controller/ControllerConsole';
import { LoginScreen } from './components/login/LoginScreen';
import { SessionProvider } from './contexts/SessionContext';
import { useSignedInUser } from './hooks/useSignedInUser';

type AppSkin = 'messenger' | 'chatgpt';

interface AppProps {
  /** App the receiver lands on until the controller picks one. */
  initialSkin?: AppSkin;
}

export function App({ initialSkin = 'messenger' }: AppProps) {
  const { user, signIn, signOut } = useSignedInUser();

  if (!user) return <LoginScreen onSignIn={signIn} />;

  return (
    <SessionProvider key={user.code} code={user.code}>
      {user.role === 'controller' ?
      <ControllerConsole user={user} onSignOut={signOut} /> :

      <ReceiverView user={user} initialSkin={initialSkin} onSignOut={signOut} />
      }
    </SessionProvider>);

}