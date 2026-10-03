import React, { useState } from 'react';
import { ControllerComposer } from './ControllerComposer';
import { ControllerHeader } from './ControllerHeader';
import { ControllerSidebar } from './ControllerSidebar';
import { ControllerThread } from './ControllerThread';
import { PhotoDialog } from './PhotoDialog';
import { ConfirmDialog } from '../ConfirmDialog';
import { TextPromptDialog } from '../TextPromptDialog';
import { useSession } from '../../contexts/SessionContext';
import type { Skin } from '../../types/chat';
import type { SessionUser } from '../../types/session';
import { createId } from '../../utils/id';
import { typingKey } from '../../utils/session';

interface ControllerConsoleProps {
  user: SessionUser;
  onSignOut: () => void;
}

type DialogState = 'add' | 'rename' | 'remove' | 'photo' | null;

export function ControllerConsole({ user, onSignOut }: ControllerConsoleProps) {
  const session = useSession();
  const { state } = session;
  const [skin, setSkin] = useState<Skin>('messenger');
  const [activeIds, setActiveIds] = useState<Record<Skin, string>>({ messenger: '', chatgpt: '' });
  const [mobileView, setMobileView] = useState<'list' | 'thread'>('list');
  const [dialog, setDialog] = useState<DialogState>(null);

  const conversations = state[skin];
  const active = conversations.find((c) => c.id === activeIds[skin]) ?? conversations[0];
  const receiverName = state.receiverName ?? 'Receiver';
  const isMessenger = skin === 'messenger';

  const select = (id: string) => {
    setActiveIds((prev) => ({ ...prev, [skin]: id }));
    setMobileView('thread');
  };

  const add = (name: string) => {
    const id = createId();
    session.startConversation(skin, { id, name, messages: [], ...(isMessenger ? { online: true } : {}) });
    select(id);
  };

  const send = (text: string) => {
    if (!active) return;
    session.appendMessage(skin, active.id, {
      id: createId(),
      sender: 'them',
      text,
      time: Date.now(),
      animate: skin === 'chatgpt'
    });
  };

  return (
    <div className="flex h-screen w-full flex-col bg-white text-gpt-text">
      <ControllerHeader
        code={session.code}
        userName={user.name}
        receiverName={state.receiverName}
        receiverSkin={state.receiverSkin ?? 'messenger'}
        onReceiverSkinChange={session.setReceiverSkin}
        onSignOut={onSignOut} />
      
      <div className="flex min-h-0 flex-1">
        <ControllerSidebar
          className={mobileView === 'thread' && active ? 'hidden md:flex' : 'flex'}
          skin={skin}
          onSkinChange={setSkin}
          conversations={{ messenger: state.messenger, chatgpt: state.chatgpt }}
          activeId={active?.id ?? ''}
          typing={state.typing}
          receiverName={receiverName}
          onSelect={select}
          onAdd={() => setDialog('add')} />
        
        {active ?
        <section
          aria-label={`Conversation: ${active.name}`}
          className={`${mobileView === 'list' ? 'hidden md:flex' : 'flex'} min-w-0 flex-1 flex-col`}>
          
            <ControllerThread
            skin={skin}
            conversation={active}
            receiverName={receiverName}
            onBack={() => setMobileView('list')}
            onRename={() => setDialog('rename')}
            onRemove={() => setDialog('remove')}
            onChangePhoto={() => setDialog('photo')}
            onReact={(messageId, emoji) => session.setReaction(skin, active.id, messageId, 'them', emoji)} />
          
            <ControllerComposer
            key={`${skin}:${active.id}`}
            skin={skin}
            conversation={active}
            typingVisible={state.typing.includes(typingKey(skin, active.id))}
            onSend={send}
            onTypingChange={(typing) => session.setTyping(skin, active.id, typing)} />
          
          </section> :

        <div className="hidden flex-1 flex-col items-center justify-center px-6 text-center md:flex">
            <p className="text-[17px] font-semibold">{isMessenger ? 'Add your first person' : 'No ChatGPT chats yet'}</p>
            <p className="mt-1 max-w-sm text-[14px] text-gpt-muted">
              {isMessenger ?
            `Give them any name — ${receiverName} will see a new chat with them in Messenger.` :
            `Start a chat with a title, or wait for ${receiverName} to ask ChatGPT something.`}
            </p>
            <button
            type="button"
            onClick={() => setDialog('add')}
            className="mt-5 h-10 rounded-xl bg-gpt-text px-4 text-[14px] font-medium text-white transition-[background-color,transform] duration-150 hover:bg-black active:scale-[0.98]">
            
              {isMessenger ? 'Add person' : 'New ChatGPT chat'}
            </button>
          </div>
        }
      </div>

      <TextPromptDialog
        open={dialog === 'add'}
        title={isMessenger ? 'Add a person' : 'New ChatGPT chat'}
        label={isMessenger ? 'Name' : 'Chat title'}
        placeholder={isMessenger ? 'e.g. Maya Rodriguez' : 'e.g. Weekend trip ideas'}
        submitLabel={isMessenger ? 'Add person' : 'Create chat'}
        onSubmit={add}
        onClose={() => setDialog(null)} />
      
      <TextPromptDialog
        open={dialog === 'rename' && !!active}
        title={isMessenger ? 'Rename person' : 'Rename chat'}
        label={isMessenger ? 'Name' : 'Chat title'}
        initialValue={active?.name ?? ''}
        submitLabel="Save"
        onSubmit={(name) => active && session.renameConversation(skin, active.id, name)}
        onClose={() => setDialog(null)} />
      
      <PhotoDialog
        open={dialog === 'photo' && !!active && isMessenger}
        name={active?.name ?? ''}
        currentSrc={active?.avatar}
        onSave={(src) => active && session.setAvatar(skin, active.id, src)}
        onClose={() => setDialog(null)} />
      
      <ConfirmDialog
        open={dialog === 'remove' && !!active}
        title={isMessenger ? `Remove ${active?.name ?? 'this person'}?` : 'Delete this chat?'}
        description={`The conversation and all its messages will disappear for you and for ${receiverName}.`}
        confirmLabel={isMessenger ? 'Remove' : 'Delete'}
        onConfirm={() => {
          if (!active) return;
          session.removeConversation(skin, active.id);
          setMobileView('list');
        }}
        onClose={() => setDialog(null)} />
      
    </div>);

}