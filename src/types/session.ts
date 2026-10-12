import type { Conversation, Skin } from './chat';

export type Role = 'controller' | 'receiver';

export interface SessionUser {
  role: Role;
  name: string;
  /** Shared code that links a controller and a receiver to the same conversations. */
  code: string;
}

export interface SessionState {
  messenger: Conversation[];
  chatgpt: Conversation[];
  /** `${skin}:${conversationId}` keys where the controller is currently composing. */
  typing: string[];
  receiverName?: string;
  /** Which app the receiver is looking at. Set by the controller or the receiver's hidden menu. */
  receiverSkin?: Skin;
}