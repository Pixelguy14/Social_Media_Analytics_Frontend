# DataTracker Frontend

A modern, responsive Single Page Application (SPA) for social media analytics, built with **React** and **Vite**. This project focuses on speed, modularity, and a premium user experience.

*Developed in collaboration with **Google Antigravity**.*

## Table of Contents

- [Project Overview](#project-overview)
- [Architecture & Design](#architecture--design)
  - [Component-Based Architecture](#component-based-architecture)
  - [Tech Stack](#tech-stack)
- [Installation and Setup](#installation-and-setup)
- [Running the Application](#running-the-application)

---

## Project Overview

This frontend serves as the UI layer for the DataTracker system, connecting to a Go backend. It is designed to provide a seamless user experience for managing profiles, viewing analytics, and performing administrative tasks.

---

## Architecture & Design

Unlike traditional N-Tier backend architectures, this frontend utilizes a **Component-Based Architecture**. This approach decomposes the user interface into independent, reusable pieces ("components") that manage their own state and rendering, while leveraging a central "Service" layer for global state.

### Component-Based Structure

We have organized the codebase to separate "Logic", "Views", and "UI Elements":

1.  **Context Layer (The "Service" Layer)**
    *   **`src/context/AuthContext.jsx`**: Acts as the application's brain for user sessions. It manages the global state (User, Token), handles persistence via `localStorage`, and exposes methods like `login()`, `register()`, and `logout()` to the rest of the app. This isolates complex logic from the UI.

2.  **Pages Layer (The "Views")**
    *   **`src/pages/AuthPage.jsx`**: Manages the entry experience, toggling between Login and Registration forms.
    *   **`src/pages/Dashboard.jsx`**: The main hub for authenticated users. It acts as a "smart container," orchestrating data flow between the Context and visual components.

3.  **Components Layer (The "UI Elements")**
    *   **`src/components/Layout.jsx`**: Provides the structural shell (Navigation, Responsive Wrapping) to ensure consistency across pages.
    *   **`src/components/ProfileCard.jsx`**: A reusable card component for displaying and editing user details.
    *   **`src/components/AdminPanel.jsx`**: A dedicated administrative interface for user management (Role Editing, User Deletion), conditionally rendered based on permissions.

### Tech Stack

-   **Core Framework:** **React 18** + **Vite** (for instant server start and HMR).
-   **Styling:** **Tailwind CSS (v4)**. We use utility-first CSS for rapid, responsive UI development without standard CSS file bloat.
-   **State Management:** **React Context API**.
-   **Form Handling:** **React Hook Form**. Eliminates manual state management for inputs and provides robust validation.
-   **Network:** **Axios**. Used for communicating with the Go backend.
-   **UI Feedback:** **SweetAlert2**. Provides beautiful, promise-based popup modals for user interactions (e.g., "Are you sure you want to delete this?").

---

## Installation and Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or newer)
- [npm](https://www.npmjs.com/)

### 1. Install Dependencies

Navigate to the project directory and install the required packages:

```bash
cd datatracker-ui
npm install
```

### 2. Configuration

Ensure the application is configured to point to your running backend. By default, it looks for the API at `http://localhost:8081/api`.

---

## Running the Application

To start the development server:

```bash
npm run dev
```

The application will typically launch at `http://localhost:5173` (or similar).
localhost:5173 is the default address for the Vite development server.