# InkToChat & DataTracker Frontend

A high-fidelity, distributed Single Page Application (SPA) built with **React** and **Vite**. This platform serves a dual-modality purpose:

1.  **DataTracker**: A professional, account-based analytics suite for persistent identity.
2.  **InkToChat**: A "Zero-Friction" real-time replication of the vintage Nintendo DS Pictochat experience, featuring real-time drawing and presence.

---

## 🎨 InkToChat Core Features

- **Zero-Friction Entry**: Simple username-based "handshake" protocol with bloom-filter validation.
- **1-Bit Canvas Engine**: A pixel-perfect 256x192 drawing board that respects retro hardware constraints.
- **Real-Time Presence**: Intelligent session tracking across 4 persistent lobbies (A, B, C, D) via Firebase `onDisconnect` synchronization.
- **Optimized Data Transfer**: Drawings are bit-packed into a **6KB binary blob** (49,152 bits) to minimize latency and server load.
- **Circular Buffer History**: Smart message management that maintains a "sliding window" of the latest 100 entries per room.

---

## Architecture & Design

The project implements a **Component-Based Architecture** focused on distributed state synchronization.

- **State Orchestration**:
    *   **Zustand (`store/useAppStore.js`)**: Manages ephemeral InkToChat state (Usernames, active rooms, and server-issued custom tokens).
    *   **React Context (`context/AuthContext.jsx`)**: Manages persistent DataTracker sessions (JWT lifecycle, user sanitization).
- **Communication Protocol**:
    *   **Axios Interceptors**: Centralized handling of `401 Unauthorized` and `403 Forbidden` responses for robust security.
    *   **Env-Driven Configuration**: Fully portable deployment via `VITE_` infrastructure.

---

## 🛡️ Security Posture

- **Content Security Policy (CSP)**: Hardened meta-tag implementation restricting script execution and unauthorized cross-origin requests.
- **XSS Mitigation**: 100% reliance on JSX auto-escaping and zero-use of `dangerouslySetInnerHTML`.
- **Identity Obfuscation**: Displayed IDs are sanitized to prevent enumeration/IDOR risks.
- **Sanitized Persistence**: User objects are stripped of sensitive fields (e.g., password hashes) before being stored in local caching.

---

## Installation and Setup

### 1. Install Dependencies
Navigate to the project directory and install the required packages:
```bash
cd datatracker-ui
npm install
```

### 2. Configuration
Copy `.env.example` to `.env` and fill in your Firebase Web and API configuration.

```bash
cp .env.example .env
```

### 3. Development
```bash
cd datatracker-ui
npm run dev
```
The application typically launches at `http://localhost:5173`. Ensure your Go Backend is running on port **8081** for the Gatekeeper and Drawing endpoints to function.