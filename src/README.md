# Multi-UI Chat Interface

A two-role chat simulator built with React, TypeScript, Tailwind CSS, and Framer Motion.

One person, the **Controller**, writes as every contact in a Messenger-style app and as the AI in a ChatGPT-style app. A second person, the **Receiver**, uses what look like ordinary **Messenger** and **ChatGPT** interfaces. Every message, typing indicator, profile photo, and reaction syncs live between the two screens.

Sessions are stored in **Firebase Realtime Database** (project `enya-9b04a`) and sync live across devices and browsers. The controller and receiver can be on different machines.

> **Before deploying:** in the Firebase console, open Realtime Database → Rules and allow access to `sessions` (see [Firebase setup](#firebase-setup)). With the default locked rules, both roles land on "Couldn't connect to the session".

---

## Table of contents

1. [Quick start](#quick-start)
2. [How it works](#how-it-works)
3. [Roles](#roles)
   - [Signing in](#signing-in)
   - [Controller console](#controller-console)
   - [Receiver view](#receiver-view)
4. [Feature reference](#feature-reference)
   - [Messenger](#messenger)
   - [ChatGPT](#chatgpt)
   - [Profile photos](#profile-photos)
   - [Reactions](#reactions)
   - [Typing indicators](#typing-indicators)
   - [Read receipts and unread state](#read-receipts-and-unread-state)
   - [Suggested replies](#suggested-replies)
   - [Hidden app switcher](#hidden-app-switcher)
5. [Keyboard shortcuts](#keyboard-shortcuts)
6. [Architecture](#architecture)
   - [Tech stack](#tech-stack)
   - [Project structure](#project-structure)
   - [Data model](#data-model)
   - [Session sync](#session-sync)
   - [Session API](#session-api)
   - [Storage keys](#storage-keys)
   - [Firebase setup](#firebase-setup)
7. [Configuration](#configuration)
8. [Styling and design tokens](#styling-and-design-tokens)
9. [Accessibility](#accessibility)
10. [Motion](#motion)
11. [Limitations](#limitations)
12. [Troubleshooting](#troubleshooting)
13. [Extending the project](#extending-the-project)

---

## Quick start

1. Open the app. The sign-in screen appears.
2. Choose **Controller**, enter a display name, and note the generated **session code** (for example `K7PQ2M`). Sign in — this creates the session in Firebase.
3. Open the app on **another device, browser, or tab**.
4. Choose **Receiver**, enter a display name, type the same session code, and sign in. If the controller hasn't signed in yet, the receiver sees *"Waiting for session …"* and joins automatically once they do.
5. On the controller's screen, click **Add person**, give them a name, and send a message. It appears in the Receiver's Messenger right away.

### Local development

```bash
npm install        # installs firebase 11.10.0 along with the rest of package.json
npm run dev
```

---

## How it works

```
┌────────────────────────┐                       ┌────────────────────────┐
│   Controller device    │                       │    Receiver device     │
│  ControllerConsole     │                       │  ReceiverView          │
└───────────┬────────────┘                       └───────────┬────────────┘
            │  SessionProvider                SessionProvider│
            │  mutate() → runTransaction ──┐  ┌── onValue ───┤
            │                              ▼  │              │
            │        Firebase RTDB: sessions/{CODE}/state    │
            └── onValue ◄──────────────────────────────────── ┘
```

Both sides render a `SessionProvider` keyed by the session code. It subscribes to `sessions/{CODE}/state` with `onValue`, and every change from either side goes through a single `mutate()` function that runs a Firebase **transaction**:

1. Firebase hands the transaction the latest server state, so neither side overwrites a newer change from the other.
2. A pure update function is applied. Returning the same object aborts the write.
3. The result is written atomically. Both sides receive it through their `onValue` subscription (the writer sees it immediately as an optimistic local event).

---

## Roles

### Signing in

`components/login/LoginScreen.tsx`

| Field | Controller | Receiver |
| --- | --- | --- |
| Role | "Controller": write as every contact and as the AI | "Receiver": use Messenger and ChatGPT as normal |
| Display name | Required | Required. Shown in the Messenger rail, ChatGPT profile, and controller header |
| Session code | Generated automatically, with a regenerate button. The session is created in Firebase on **Continue** (button shows *"Starting session…"*) | Typed in. If no session exists yet, the receiver waits on a *"Waiting for session {CODE}"* screen and joins automatically |

**Validation messages**

- Empty name: *"Enter a display name."*
- Code shorter than 4 characters after normalization: *"Session codes are at least 4 characters."*
- Controller can't reach Firebase: *"Couldn't reach the server. Check your connection and try again."*

**Connection states** (rendered by `SessionProvider` before the app appears)

- *Joining session {CODE}* — waiting for the first snapshot.
- *Waiting for session {CODE}* — receiver only; the controller hasn't created it yet. Offers **Use a different code**.
- *Couldn't connect to the session* — subscription or write was rejected (usually database rules). Offers **Try again** and **Sign out**.

Codes are normalized to uppercase letters and digits only, with a maximum of 8 characters. Generated codes are 6 characters and skip easily confused characters (`0/O`, `1/I`).

The signed-in user is kept in `sessionStorage`, so **each tab can hold a different role** and reloading a tab keeps you signed in.

### Controller console

`components/controller/ControllerConsole.tsx`

The controller's workspace has three areas.

**Header** (`ControllerHeader.tsx`)
- The session code, with a copy button.
- Receiver presence: *"{name} joined"* with a green dot, or *"Waiting for a receiver to join"*.
- **Receiver sees**: a Messenger / ChatGPT toggle that switches which app is on the receiver's screen, live.
- A **Sign out** button.

**Sidebar** (`ControllerSidebar.tsx`)
- Messenger / ChatGPT tabs. Each tab shows a count of conversations **awaiting your reply** (threads where the receiver sent the last message).
- An **Add person** button (Messenger) or **New ChatGPT chat** button (ChatGPT).
- The conversation list, with relative time, a *"You're typing…"* state, and bold text plus a dot for threads awaiting a reply.

**Thread** (`ControllerThread.tsx`)
- Header: the avatar (click to change the photo in Messenger), the name, and the role you're writing as (*"You're speaking as Maya in Messenger"* or *"You're responding as ChatGPT"*).
- Actions: **Photo** (Messenger only), **Rename**, and **Remove** / **Delete**.
- Messages: the receiver's messages appear on the left in grey. Yours appear on the right in Messenger blue, or as rendered markdown cards for ChatGPT.
- A **Delivered** / **Seen** status under your last message.
- Reactions (Messenger only). See [Reactions](#reactions).

**Composer** (`ControllerComposer.tsx`)
- *"Replying as {persona}"* label.
- Auto-growing textarea. **Enter** sends and **Shift + Enter** adds a new line.
- **Suggest reply** fills in a canned reply based on the receiver's last message.
- While you type, the receiver sees a typing indicator. See [Typing indicators](#typing-indicators).

**Dialogs**
- Add person / New ChatGPT chat: a name or title prompt.
- Rename: a prompt pre-filled with the current name.
- Photo: upload, paste a link, or remove. See [Profile photos](#profile-photos).
- Remove / Delete: a confirmation. *"The conversation and all its messages will disappear for you and for {receiver}."*

### Receiver view

`components/ReceiverView.tsx`

The receiver sees a full-screen Messenger **or** ChatGPT interface with no visible controller tools. Both apps stay mounted the whole time. Switching only toggles which one is visible, so each keeps its scroll position and state.

The visible app comes from `state.receiverSkin`, which the controller's toggle or the [hidden switcher](#hidden-app-switcher) sets. If neither has been used, it falls back to the `initialSkin` prop on `App`.

---

## Feature reference

### Messenger

`components/messenger/*`

| Area | Details |
| --- | --- |
| Rail | Chats (active), plus Marketplace, Requests, and Archive (visual only). The receiver's avatar sits at the bottom. |
| Sidebar | "Chats" heading, a compose button, a *Search Messenger* field, and All / Unread / Groups filters. Each list row shows the avatar, the last message preview, *"Typing…"*, an unread dot, and a relative time. |
| Empty states | *"No chats yet"* with a **New message** button, or *"No chats found"* when a search has no matches. |
| Conversation | Grouped bubbles with Messenger's corner shapes, time separators after 30-minute gaps, emoji-only messages shown large, a "Seen" avatar under the receiver's last message, and a profile intro at the top. |
| Composer | Plus / image / sticker / GIF icons that hide once you start typing. The *"Aa"* field grows as you type. **Enter** sends. The send button turns into a 👍 like when the field is empty. |
| Info panel | Shown on extra-large screens. Profile header, quick actions, and collapsible sections (visual only). |
| New chat | The receiver can start a chat with any name. The controller sees it immediately and can reply as that person. |

### ChatGPT

`components/chatgpt/*`

| Area | Details |
| --- | --- |
| Sidebar | Collapses with an animated width change on desktop and slides in on mobile. New chat, Search chats, Library, GPTs, chat history, and a profile footer with a "Plus" label. |
| Empty state | *"What's on your mind today?"* with the composer centered. |
| Sending | Sending with no chat open creates one. A new chat named "New chat" is retitled automatically from the first message (up to 38 characters). |
| Thinking | While the controller types, a pulsing *"ChatGPT is thinking"* indicator appears. |
| Replies | Revealed with a typewriter effect: random 3–6 character chunks every 16 ms. When the reveal finishes, the message is marked settled, so reloading doesn't replay it. The effect is skipped when the system's reduce-motion setting is on. |
| Markdown | `### headings`, `-` / `*` bullet lists, numbered lists, paragraphs, and `**bold**`. |
| Actions | After the reveal: copy (removes markdown, shows "Copied" for 1.5 s), 👍 / 👎, read aloud, and retry. Only copy does anything; the rest are visual. |
| Scrolling | Sticks to the bottom only when you're already within 80 px of it, so reading older messages isn't interrupted. |

### Profile photos

`components/controller/PhotoDialog.tsx`, `utils/image.ts`

The controller can give any Messenger contact a profile photo.

1. Open the contact's thread and click the avatar (a camera appears on hover) or the **Photo** button.
2. Choose one of these:
   - **Upload photo**: pick any image file. It's center-cropped to a square, resized to 256 × 256, and saved as a JPEG (quality 0.85, transparent areas filled white). This keeps the synced session small.
   - **Paste an image link**: enter an `http(s)://` URL and click **Use link** or press Enter.
   - **Remove photo**: go back to colored initials.
3. Check the preview and click **Save photo**.

**Error states**
- Not an image file: *"Choose an image file (JPG, PNG, GIF or WebP)."*
- File can't be decoded: *"That image couldn't be read. Try another file."*
- Link isn't a URL: *"Enter a link that starts with http:// or https://"*
- Link doesn't load an image: *"That link didn't load an image. Check the address and try again."* Saving is turned off until this is fixed.

The photo appears everywhere the contact shows up for the receiver: the chat list, the conversation header, bubble avatars, the typing bubble, "Seen" receipts, and the info panel.

### Reactions

`components/ReactionPicker.tsx`, `components/ReactionBadge.tsx`, `data/reactions.ts`

Both roles can react to any message in a Messenger conversation.

- Hover over a message to show a 😊+ button beside it. Click it to open the tray: ❤️ 😆 😮 😢 😠 👍.
- **One reaction per side per message.** The receiver reacts as themselves and the controller reacts as the contact.
- Picking a different emoji replaces your reaction. Picking the same emoji again removes it.
- Reactions show as a small white pill on the bubble's bottom corner. If both sides used the same emoji, it shows once; if both sides reacted, a count of **2** appears.
- Hover over the pill (or use a screen reader) for a description such as *"Maya reacted ❤️, You reacted 😆"*.
- The tray closes when you click outside it or press **Escape**.

To change the available emojis, edit `data/reactions.ts`.

### Typing indicators

- When the controller types in a thread, a typing key (`"{skin}:{conversationId}"`) is added to `state.typing`.
- The receiver sees a three-dot bubble in Messenger, *"Typing…"* in the chat list, or *"ChatGPT is thinking"* in ChatGPT.
- The indicator clears when the message is sent, when the field is emptied, or after **4 seconds** of no typing.
- The controller's composer announces *"Receiver sees you typing…"* to screen readers.

### Read receipts and unread state

- A message from the controller marks its conversation `unread`.
- When the receiver has that conversation open, it's marked read automatically.
- The controller's thread shows **Delivered** (still unread) or **Seen** (read) under its last message.

### Suggested replies

`data/replies.ts`, `utils/replies.ts`

The controller's **Suggest reply** button fills in a canned reply based on the receiver's last message:

- **Messenger**: chosen from greeting, question, or general reply lists, depending on whether the message looks like a greeting or ends with `?`.
- **ChatGPT**: a short greeting for short greetings. Otherwise, one of three structured markdown templates (headings, numbered steps, bullets) that work in the topic of the message.

You can edit the suggestion before sending it.

### Hidden app switcher

The receiver can switch apps or sign out without any visible control on screen:

- Press **Cmd/Ctrl + Shift + K**, or
- **Triple-tap** the invisible 24 × 24 px spot in the bottom-left corner (within 600 ms).

This opens a floating pill (centered at the top on desktop, bottom-right on mobile) with Messenger / ChatGPT buttons and a sign-out button.

---

## Keyboard shortcuts

| Where | Shortcut | Action |
| --- | --- | --- |
| Any composer | Enter | Send |
| Any composer | Shift + Enter | New line |
| Photo dialog link field | Enter | Use link |
| Any dialog / reaction tray | Escape | Close |
| Receiver | Cmd/Ctrl + Shift + K | Toggle the hidden app switcher |

---

## Architecture

### Tech stack

| Package | Version | Purpose |
| --- | --- | --- |
| react / react-dom | 18.3.1 | UI |
| firebase | 11.10.0 | Realtime Database session sync + Analytics |
| framer-motion | 11.18.2 | Animation (dialogs, bubbles, reaction tray, switcher) |
| lucide-react | 0.577.0 | Icons |
| date-fns | 4.1.0 | Relative times and date separators |
| tailwind-merge | 2.6.1 | Class merging |
| @radix-ui/react-icons | 1.3.2 | Installed; not central |
| react-router-dom | 6.30.2 | Installed but unused. The app has no routes. |
| Tailwind CSS | v3 | Styling (`tailwind.config.js`) |

### Project structure

```
App.tsx                         Picks login / controller / receiver; wraps SessionProvider
index.tsx                       Mounts <App /> and imports index.css
index.css                       Tailwind imports, full-height root, .thin-scroll
tailwind.config.js              messenger.* and gpt.* color tokens

contexts/
  SessionContext.tsx            Shared session state + all mutations + connection states

hooks/
  useChat.ts                    Receiver-side chat state (selection, send, react, settle)
  useSignedInUser.ts            Signed-in user in sessionStorage (signIn / signOut)
  useAutosizeTextarea.ts        Grows textareas up to a max height

types/
  chat.ts                       Skin, Sender, Reactions, Message, Conversation
  session.ts                    Role, SessionUser, SessionState

utils/
  firebase.ts                   Firebase config, app, database, analytics
  sessionStore.ts               ensureSession / subscribeToSession / mutateSession
  session.ts                    Initial state, codes, typing keys, titles, signed-in user
  image.ts                      Image crop/resize to data URL, link validation
  markdown.ts                   Minimal markdown parser for ChatGPT replies
  replies.ts                    Suggested reply generators
  time.ts                       List times and thread separators
  id.ts                         createId()

data/
  loginRoles.ts                 Role copy for the sign-in screen
  reactions.ts                  Reaction emoji set
  replies.ts                    Canned Messenger replies

components/
  Avatar.tsx                    Photo or colored initials, optional online dot
  DialogShell.tsx               Animated modal with backdrop + Escape
  TextPromptDialog.tsx          Single-field prompt dialog
  ConfirmDialog.tsx             Destructive confirmation dialog
  ReactionPicker.tsx            Hover trigger + emoji tray
  ReactionBadge.tsx             Reaction pill on a bubble
  ReceiverView.tsx              Receiver shell, hidden switcher triggers
  SkinSwitcher.tsx              Floating Messenger/ChatGPT pill
  login/LoginScreen.tsx
  controller/                   Console, Header, Sidebar, Thread, Composer, PhotoDialog
  messenger/                    App, Rail, Sidebar, Chat, MessageList, Composer,
                                TypingBubble, InfoPanel
  chatgpt/                      App, Sidebar, Header, Thread, Composer,
                                AssistantMessage, MarkdownBlocks
```

### Data model

```ts
type Skin = 'messenger' | 'chatgpt';
type Sender = 'me' | 'them';               // 'me' = receiver, 'them' = contact / ChatGPT
type Reactions = Partial<Record<Sender, string>>;

interface Message {
  id: string;
  sender: Sender;
  text: string;
  time: number;                            // epoch ms
  animate?: boolean;                       // ChatGPT reply still revealing
  reactions?: Reactions;
}

interface Conversation {
  id: string;
  name: string;
  avatar?: string;                         // data URL or http(s) URL
  online?: boolean;
  lastActive?: string;
  unread?: boolean;
  isGroup?: boolean;
  messages: Message[];
}

interface SessionState {
  messenger: Conversation[];               // newest activity first
  chatgpt: Conversation[];
  typing: string[];                        // "{skin}:{conversationId}"
  receiverName?: string;
  receiverSkin?: Skin;
}
```

`sender` is always from the **receiver's** point of view. A message the controller sends is `'them'`, and a message the receiver sends is `'me'`.

### Session sync

- **Writes**: every mutation runs `runTransaction` on `sessions/{CODE}/state`, applies a pure function to the latest server copy, and aborts if nothing changed (same object returned).
- **Reads**: both sides update from a live `onValue` subscription. Children only render after the first snapshot, so transactions always start from a loaded cache.
- **Creation**: only the controller creates sessions (`ensureSession`, which never overwrites an existing one). Receivers just listen.
- **Format**: state is stored as a single JSON **string**, because Realtime Database drops empty arrays and `undefined` fields from object trees.
- **Ordering**: a conversation moves to the top of its list when a message is appended.
- **Remounting**: `SessionProvider` is keyed by the session code, so switching sessions gives you a clean state.

### Session API

Available through `useSession()`:

| Method | Description |
| --- | --- |
| `appendMessage(skin, conversationId, message, { retitle? })` | Adds a message, moves the conversation to the top, sets `unread` for controller messages, clears that conversation's typing state, and can auto-title "New chat". |
| `startConversation(skin, conversation)` | Adds a conversation at the top. |
| `renameConversation(skin, id, name)` | Trims the name; ignores empty or unchanged names. |
| `removeConversation(skin, id)` | Deletes the conversation and its typing state. |
| `markRead(skin, id)` | Clears `unread`. |
| `settleMessage(skin, messageId)` | Clears `animate` once a ChatGPT reveal finishes. |
| `setTyping(skin, id, typing)` | Adds or removes the typing key. |
| `setAvatar(skin, id, avatar \| undefined)` | Sets or clears a contact's photo. |
| `setReaction(skin, id, messageId, by, emoji)` | Sets `by`'s reaction; the same emoji again removes it. |
| `setReceiverName(name)` | Set by the receiver on sign-in. |
| `setReceiverSkin(skin)` | Switches the receiver's visible app. |

### Storage keys

| Storage | Key | Contents |
| --- | --- | --- |
| Firebase RTDB | `sessions/{CODE}/state` | Full `SessionState` as a JSON string |
| `sessionStorage` | `chat-session-user` | `{ role, name, code }` for this tab |

Sessions start empty.

### Firebase setup

Config lives in `utils/firebase.ts`. The Realtime Database needs rules that allow reading and writing sessions. A minimal set:

```json
{
  "rules": {
    "sessions": { "$code": { ".read": true, ".write": true } }
  }
}
```

This lets anyone who knows a code read and write that session — tighten it (for example with Firebase Auth) before real use. Analytics only starts where supported and pins its cookie to the exact hostname, so shared hosts like `*.vercel.app` don't reject it.

---

## Configuration

`App` accepts one optional prop, which can be adjusted in the Controls panel:

| Prop | Type | Default | Effect |
| --- | --- | --- | --- |
| `initialSkin` | `'messenger' \| 'chatgpt'` | `'messenger'` | The receiver's starting app before the controller or hidden switcher picks one. |

---

## Styling and design tokens

Colors are defined in `tailwind.config.js`:

| Token | Value | Use |
| --- | --- | --- |
| `messenger-blue` | `#0084FF` | Outgoing bubbles, accents |
| `messenger-bubble` | `#F0F0F0` | Incoming bubbles |
| `messenger-surface` | `#F0F2F5` | Inputs, buttons |
| `messenger-hover` | `#F2F2F2` | Hover backgrounds |
| `messenger-text` / `-muted` | `#050505` / `#65676B` | Text |
| `messenger-online` | `#31A24C` | Online dot, presence |
| `messenger-divider` / `-dot` | `#E4E6EB` / `#90949C` | Dividers, typing dots |
| `gpt-text` / `-muted` / `-placeholder` | `#0D0D0D` / `#5D5D5D` / `#8F8F8F` | Text |
| `gpt-sidebar` / `-hover` / `-active` | `#F9F9F9` / `#EFEFEF` / `#E3E3E3` | Surfaces |
| `gpt-bubble` / `-border` | `#F4F4F4` / `#E5E5E5` | User bubbles, borders |

The controller console uses the `gpt-*` palette, so it reads as a neutral tool. `index.css` sets a system font stack and adds `.thin-scroll` for slim scrollbars.

---

## Accessibility

- Semantic landmarks (`header`, `nav`, `section`, `main`) and labelled regions for each conversation.
- Dialogs use `role="dialog"`, `aria-modal`, `aria-labelledby`, autofocus, and close on Escape.
- Toggles use `role="radiogroup"` / `role="radio"` with `aria-checked`.
- The reaction tray is a `role="menu"` of `menuitemradio` buttons. Reaction pills have descriptive `aria-label`s.
- The reaction trigger stays visible while it has keyboard focus (`focus-within`), so it can be reached without a mouse.
- Form errors use `aria-invalid` and `aria-describedby`; photo errors use `role="alert"`.
- Typing status is announced through `aria-live`.
- The ChatGPT reveal respects `prefers-reduced-motion`.

---

## Motion

Animations use Framer Motion with the curve `cubic-bezier(0.23, 1, 0.32, 1)`:

| Element | Duration |
| --- | --- |
| Message entry | 200 ms, fade + 8 px rise |
| Dialogs | 200 ms, fade + scale from 0.96 |
| Reaction tray | 150 ms, fade + scale from 0.96 |
| Reaction pill | 150 ms |
| Hover / color changes | 150 ms |

---

## Limitations

- **Whole-state writes.** Every change rewrites the full session JSON. Uploaded photos are compressed (usually 15–40 KB each), but sessions with many photos sync more slowly.
- **Visual-only chrome.** Calls, Marketplace, info-panel sections, ChatGPT voice and retry buttons, and similar controls are visual only.
- **Reactions are Messenger-only**, and each side gets one reaction per message.
- **No authentication.** Anyone with the session code can join.

---

## Troubleshooting

| Problem | Fix |
| --- | --- |
| Receiver stuck on *"Waiting for session"* | The controller hasn't signed in with that exact code yet, or the code has a typo. |
| *"Couldn't connect to the session"* | Check the Realtime Database rules (see [Firebase setup](#firebase-setup)) and the network. |
| Deployed site behaves differently from this README | Make sure the deployment is built from these files — older builds used a different sync layer. |
| A pasted photo link won't save | The URL has to point directly to an image, and the host has to allow it to be embedded. Try uploading the file instead. |
| The receiver needs to switch apps | Press Cmd/Ctrl + Shift + K or triple-tap the bottom-left corner. The controller can also use **Receiver sees** in the header. |
| Start completely fresh | Use a new session code, or delete `sessions/{CODE}` in the Firebase console. |

---

## Extending the project

- **More reaction emojis**: edit `data/reactions.ts`.
- **More canned replies**: edit `data/replies.ts` and the templates in `utils/replies.ts`.
- **A real backend**: replace the storage and broadcast calls in `contexts/SessionContext.tsx` (`mutate` and the subscription effect) with your realtime transport. The rest of the app only talks to `useSession()`, so nothing else has to change.
- **A new app**: add a value to `Skin`, a new list to `SessionState`, a receiver app under `components/<skin>/`, and a tab in the controller sidebar and header toggle.
- **Group chats**: `Conversation.isGroup` already exists. Adding per-message author names to `Message` would complete it.
