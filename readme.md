# InkToChat & DataTracker Frontend

A modern, responsive Single Page Application (SPA) built with **React** and **Vite**. This project serves as a dual-modality platform:
1.  **DataTracker**: A professional analytics suite with permanent accounts.
2.  **InkToChat**: A "Zero-Friction" replication of the Nintendo DS Pictochat experience.

*Developed in collaboration with **Google Antigravity**.*

---

## InkToChat (The Pictochat Experience)

InkToChat allows users to join real-time drawing lobbies with zero friction (no passwords). 

### Key Features:
- **Persistent Lobbies**: Rooms A, B, C, and D with live player counts.
- **1-Bit Canvas**: A pixel-perfect drawing board (256x192) restricted to black and white.
- **Binary Compression**: Drawings are compressed into a **49,152-bit** array before being sent to the Go backend to minimize storage and bandwidth costs.
- **Real-time Presence**: Automatic Join/Leave tracking via Firebase Realtime Database (`onDisconnect` hooks).
- **Circular Buffer**: Smart chat history that maintains exactly 100 messages per room, managed by the Go orchestration layer.

---

## Architecture & Design

The application follows a **Component-Based Architecture**, separating state management from the visual layer.

### Core Modules:
1.  **State Management (Zustand & Context)**
    *   **`store/useAppStore.js`**: Managed global state for InkToChat (Username, Session Tokens, Active Room).
    *   **`context/AuthContext.jsx`**: Handles legacy DataTracker sessions (JWT/Email/Password).
2.  **The View Layer (Pages)**
    *   **`AuthPage.jsx`**: A retro-styled entry point for claiming usernames via the Go "Gatekeeper" (Bloom Filter).
    *   **`LobbySelection.jsx`**: Real-time room navigator with live RTDB presence streams.
    *   **`ChatRoom.jsx`**: Dual-panel interface for real-time messaging and the drawing canvas.
    *   **`AdminDashboard.jsx`**: Monitors global metrics and Circular Buffer health.
3.  **The UI Toolkit (`src/components`)**
    *   **`CanvasComponent.jsx`**: Custom drawing logic with 1-bit compression engine.
    *   **`Panel.jsx` / `Button.jsx`**: High-fidelity Nintendo DS BIOS recreations using custom Tailwind v4 themes and dithered backgrounds.

---

## Installation and Setup

### 1. Install Dependencies
Navigate to the project directory and install the required packages:
```bash
cd datatracker-ui
npm install
```

### 2. Configuration (`.env`)
Copy `.env.example` to `.env` and fill in your **Public Firebase Web Configuration**. 

#### Where to get these values?
1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Select **Project Settings** (Gear icon ⚙️) -> **General**.
3.  Scroll to **Your apps** -> **Web App** -> **Config**.
4.  Copy the values into your `.env`:

```env
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-app
VITE_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_id
VITE_FIREBASE_APP_ID=your_app_id
# Required for Presence/Lobby counts:
VITE_FIREBASE_DATABASE_URL=https://your-app-default-rtdb.firebaseio.com/
```

---

## Running the Application

To start the development server:
```bash
npm run dev
```
The application typically launches at `http://localhost:5173`. Ensure your Go Backend is running on port **8081** for the Gatekeeper and Drawing endpoints to function.