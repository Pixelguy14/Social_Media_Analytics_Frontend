# Frontend Engineering Documentation: DataTracker & InkToChat

This document provides a comprehensive overview of the architectural decisions, security measures, and data optimizations implemented in the DataTracker and InkToChat distributed frontend.

---

## 1. Core Architecture & Technologies

The application is built as a **Single Page Application (SPA)** using **Vite** for optimized build cycles and **React** for declarative UI management. 

### Technology Stack:
- **Framework**: React 18+ (Hooks-based architecture).
- **Styling**: Tailwind CSS 4.0 using the `@theme` directive for high-fidelity custom design systems.
- **State Management**: 
    - **Zustand**: Handles ephemeral, high-frequency state (InkToChat lobby sessions).
    - **React Context**: Handles stable, long-lived state (DataTracker Authentication).
- **Communication**: Axios with centralized interceptors for security and global error handling.

---

## 2. Infrastructure & Distributed Design Concepts

The frontend is designed to act as a **Thin Client** in a distributed system, relying on both a custom **Go Backend** and **Firebase** for real-time synchronization.

- **Distributed Presence**: Implemented using **Firebase Realtime Database (RTDB)** and `onDisconnect` hooks. This ensures that even if a browser tab crashes, the user's "Online" status is cleaned up across all clients globally within seconds.
- **Heterogeneous Data Storage**: 
    - **RTDB**: Used for ephemeral presence and real-time lobby counts (low latency, high frequency).
    - **Firestore**: Used for persistent message streams and complex querying (document-oriented).
    - **Go Backend**: Acts as the "Gatekeeper" and "Processor" for authentication, bloom-filter validations, and binary drawing processing.

---

## 3. Data-Intensive Code & Optimizations

One of the project's primary engineering challenges was the replication of high-fidelity, low-bandwidth drawing mechanics.

- **1-Bit Canvas Compression**:
    - The canvas is exactly 256x192 pixels.
    - Instead of sending 49,152 raw pixels or heavy PNG strings, we treat each pixel as a single bit.
    - **Packing**: Pixels are grouped into 8-bit bytes (Uint8Array).
    - **Result**: The entire drawing is reduced to a fixed **6,144-byte binary blob**.
    - **Processing**: The `CanvasComponent.jsx` handles bit-wise transformations to convert the HTML5 Canvas `ImageData` into this packed format before transmission via POST body to the Go backend.

---

## 4. Security Measures & Auth Infrastructure

- **Content Security Policy (CSP)**: A strict meta-tag policy restricts script execution only to 'self' and whitelists only necessary Firebase/Google Font domains.
- **403 Forbidden Awareness**: The Axios interceptor in `api.js` globally catches authorization failures, providing a unified UI response (SweetAlert2) to unauthorized access attempts.
- **XSS Prevention**:
    - Automatic HTML escaping via React/JSX.
    - **Sanitization**: Server responses are "cleaned" in the browser state; sensitive fields like `passwordHash` are stripped before any state persistence (`localStorage`).
- **Identity Obfuscation**: Displayed "Trace IDs" are annotated with a shift towards UUIDs to mitigate IDOR (Insecure Direct Object Reference) risks commonly found in sequential integer-based systems.
- **Build-Time Isolation**: Environment variables used for build-time constants are clearly documented to prevent runtime leakage and ensure deterministic builds.

---

## 5. Firebase Design Principles

We leverage Firebase as a real-time transport layer rather than just a database.

- **Rule Set Logic**: The backend (Go) issues **Custom Tokens** to the frontend based on the "Handshake" protocol. This allows the frontend to interact directly with Firebase using the principle of **Least Privilege**.
- **Real-time Synchronization**: Use of `onSnapshot` (Firestore) and `onValue` (RTDB) listeners allows for a reactive UI that stays in sync across thousands of concurrent clients without manual polling.

---

## 6. API Integration & Error Handling

- **Gatekeeper Pattern**: All new-user creation undergoes a "Handshake" with the Go backend, which uses a Bloom Filter to efficiently check for username collisions at scale.
- **Intercept-Driven Logic**: 
    - **401 Unauthorized**: Automatically triggers a local session wipe and redirect to the landing page.
    - **Generic Errors**: Centralized toast notifications via SweetAlert2 provide professional, non-blocking user feedback.

---
