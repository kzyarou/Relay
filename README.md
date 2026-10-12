# Relay

A real-time messaging app that syncs conversations between a controller and receiver using Firebase Realtime Database.

## Getting Started

1. Run `npm install`
2. Run `npm run dev`

## Firebase Setup

This app uses Firebase Realtime Database for syncing conversations. You'll need to set up a Firebase project and configure it:

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Realtime Database for the project

### 2. Configure Firebase

Update the Firebase config in `src/utils/firebase.ts` with your project's credentials:

```typescript
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
  databaseURL: 'https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT_ID.firebasestorage.app',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
  measurementId: 'YOUR_MEASUREMENT_ID'
};
```

### 3. Set Database Rules

In Firebase Console, go to Realtime Database → Rules and set:

```json
{
  "rules": {
    ".read": true,
    ".write": true,
    "sessions": {
      ".read": true,
      ".write": true
    }
  }
}
```

This allows public read/write access to the `sessions` path for development. For production, consider implementing proper authentication.

## How It Works

### Syncing

- Both controller and receiver connect to the same Firebase Realtime Database
- Session state is stored at `sessions/{code}/state` as a JSON string
- Changes are applied atomically using Firebase transactions
- Real-time subscriptions keep both sides in sync

### Connection Flow

1. **Controller**: Generates a session code and creates the session in Firebase
2. **Receiver**: Enters the same code and waits for the session to exist
3. Once connected, both sides can send messages and see updates in real-time

### Session State

Each session stores:
- `messenger`: Array of Messenger conversations
- `chatgpt`: Array of ChatGPT conversations  
- `typing`: Array of typing indicators (format: `{skin}:{conversationId}`)
- `receiverName`: Display name of the receiver
- `receiverSkin`: Which skin the receiver is using

## Running Locally

1. Make sure Firebase is configured as above
2. Run `npm install` to install dependencies
3. Run `npm run dev` to start the development server
4. Open the app in multiple tabs/devices to test controller/receiver sync

## Deployment

When deploying (e.g., to Vercel), ensure:
- Firebase config is set for production environment
- Database rules allow access from your deployed domain
- Analytics cookies are configured for your domain (already handled in `firebase.ts`)
