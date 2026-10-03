export type Skin = 'messenger' | 'chatgpt';

export type Sender = 'me' | 'them';

/** One reaction per side: the receiver ('me') and the person the controller speaks as ('them'). */
export type Reactions = Partial<Record<Sender, string>>;

export interface Message {
  id: string;
  sender: Sender;
  text: string;
  time: number;
  /** True while a freshly received reply hasn't finished its reveal animation. */
  animate?: boolean;
  reactions?: Reactions;
}

export interface Conversation {
  id: string;
  name: string;
  avatar?: string;
  online?: boolean;
  lastActive?: string;
  unread?: boolean;
  isGroup?: boolean;
  messages: Message[];
}