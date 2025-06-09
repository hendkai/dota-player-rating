/**
 * Firebase Configuration and Initialization
 * Dota Player Rating - Modular JavaScript Architecture
 */

// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, GoogleAuthProvider } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCJEjyJFqyWrHaUcbnfdKe6wK68OJxh7v8",
    authDomain: "dota-player-rating.firebaseapp.com",
    projectId: "dota-player-rating",
    storageBucket: "dota-player-rating.firebasestorage.app",
    messagingSenderId: "954918119341",
    appId: "1:954918119341:web:6b489bc72855fd9f2f6324"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Auth Providers
export const googleProvider = new GoogleAuthProvider();

// Global Variables
export let currentUser = null;

// Make currentUser globally accessible for compatibility
globalThis.currentUser = null;

// API Configuration
export const OPENDOTA_BASE_URL = 'https://api.opendota.com/api';
export let lastRequestTime = 0;
export const MIN_REQUEST_INTERVAL = 1000; // 1 second between requests

// Rate limiting for reports - prevent spam reporting
export let lastReportTime = 0;
export const MIN_REPORT_INTERVAL = 30000; // 30 seconds between reports

// Export Firebase app for other modules
export default app; 