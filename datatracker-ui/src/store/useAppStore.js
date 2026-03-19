import { create } from 'zustand';

// SECURITY: firebaseToken is stored in localStorage for session persistence.
// This is readable by any script on the page (XSS risk). The CSP in index.html
// is the primary mitigation. For production, consider httpOnly cookie auth.
const useAppStore = create((set) => ({
    username: localStorage.getItem('inktochat_username') || null,
    room: null,
    firebaseToken: localStorage.getItem('inktochat_firebaseToken') || null,
    
    setUsername: (username) => {
        localStorage.setItem('inktochat_username', username);
        set({ username });
    },
    
    setRoom: (room) => set({ room }),
    
    setFirebaseToken: (token) => {
        localStorage.setItem('inktochat_firebaseToken', token);
        set({ firebaseToken: token });
    },
    
    logout: () => {
        localStorage.removeItem('inktochat_username');
        localStorage.removeItem('inktochat_firebaseToken');
        set({ username: null, room: null, firebaseToken: null });
    }
}));

export default useAppStore;
