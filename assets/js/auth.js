/**
 * Authentication Module
 * Handles user login, registration, and session management
 */

import { auth, googleProvider } from './firebase-config.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, signInWithPopup } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Session monitoring variables
let sessionCheckInterval = null;

/**
 * Google Sign In
 */
export async function signInWithGoogle() {
    try {
        console.log('Attempting Google sign in...');
        
        // Check if browser extensions are interfering
        if (typeof lockdown !== 'undefined') {
            console.warn('SES/Lockdown detected - this may interfere with authentication');
        }
        
        const result = await signInWithPopup(auth, googleProvider);
        console.log('Google sign in successful:', result.user);
        
        if (typeof showToast === 'function') {
            showToast('Successfully signed in with Google!', 'success');
        }
    } catch (error) {
        console.error('Google sign in error:', error);
        let errorMessage = 'Google sign-in failed!';
        
        if (error.code === 'auth/popup-closed-by-user') {
            errorMessage = 'Sign-in was cancelled.';
        } else if (error.code === 'auth/popup-blocked') {
            errorMessage = 'Pop-up was blocked. Please allow pop-ups and try again.';
        } else if (error.code === 'auth/network-request-failed') {
            errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.code === 'auth/internal-error') {
            errorMessage = 'Internal error. Please try again later.';
        } else if (error.message && error.message.includes('lockdown')) {
            errorMessage = 'Browser extension conflict detected. Please disable security extensions and try again.';
        }
        
        if (typeof showMessage === 'function') {
            showMessage('auth-message', errorMessage, 'error');
        } else {
            alert(errorMessage);
        }
        console.log('Full error details:', error);
    }
}

/**
 * User Registration
 */
export async function register() {
    const emailElement = document.getElementById('email');
    const passwordElement = document.getElementById('password');
    
    if (!emailElement || !passwordElement) {
        console.error('Registration form elements not found');
        alert('Registration form not properly loaded. Please refresh the page.');
        return;
    }
    
    const email = emailElement.value;
    const password = passwordElement.value;
    
    if (!email || !password) {
        if (typeof showMessage === 'function') {
            showMessage('auth-message', 'Please fill in all fields!', 'error');
        } else {
            alert('Please fill in all fields!');
        }
        return;
    }

    if (password.length < 6) {
        if (typeof showMessage === 'function') {
            showMessage('auth-message', 'Password must be at least 6 characters!', 'error');
        } else {
            alert('Password must be at least 6 characters!');
        }
        return;
    }

    if (typeof setLoadingState === 'function') {
        setLoadingState('register', true);
    }

    try {
        await createUserWithEmailAndPassword(auth, email, password);
        if (typeof showToast === 'function') {
            showToast('Account created successfully!', 'success');
        }
    } catch (error) {
        console.error('Registration error:', error);
        let errorMessage = 'Registration failed!';
        
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'This email is already registered!';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Please enter a valid email address!';
        } else if (error.code === 'auth/weak-password') {
            errorMessage = 'Password is too weak!';
        }
        
        if (typeof showMessage === 'function') {
            showMessage('auth-message', errorMessage, 'error');
        } else {
            alert(errorMessage);
        }
    } finally {
        if (typeof setLoadingState === 'function') {
            setLoadingState('register', false);
        }
    }
}

/**
 * User Login
 */
export async function login() {
    const emailElement = document.getElementById('email');
    const passwordElement = document.getElementById('password');
    
    if (!emailElement || !passwordElement) {
        console.error('Login form elements not found');
        alert('Login form not properly loaded. Please refresh the page.');
        return;
    }
    
    const email = emailElement.value;
    const password = passwordElement.value;
    
    if (!email || !password) {
        if (typeof showMessage === 'function') {
            showMessage('auth-message', 'Please fill in all fields!', 'error');
        } else {
            alert('Please fill in all fields!');
        }
        return;
    }

    if (typeof setLoadingState === 'function') {
        setLoadingState('login', true);
    }

    try {
        console.log('Attempting email/password sign in...');
        await signInWithEmailAndPassword(auth, email, password);
        console.log('Email sign in successful');
        
        if (typeof showToast === 'function') {
            showToast('Successfully signed in!', 'success');
        }
    } catch (error) {
        console.error('Login error:', error);
        let errorMessage = 'Sign in failed!';
        
        if (error.code === 'auth/user-not-found') {
            errorMessage = 'No account found with this email!';
        } else if (error.code === 'auth/wrong-password') {
            errorMessage = 'Incorrect password!';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Please enter a valid email address!';
        } else if (error.code === 'auth/too-many-requests') {
            errorMessage = 'Too many failed attempts. Please try again later.';
        } else if (error.code === 'auth/invalid-credential') {
            errorMessage = 'Invalid email or password!';
        } else if (error.message && error.message.includes('lockdown')) {
            errorMessage = 'Browser extension conflict detected. Please disable security extensions and try again.';
        }
        
        if (typeof showMessage === 'function') {
            showMessage('auth-message', errorMessage, 'error');
        } else {
            alert(errorMessage);
        }
    } finally {
        if (typeof setLoadingState === 'function') {
            setLoadingState('login', false);
        }
    }
}

/**
 * User Logout
 */
export async function logout() {
    try {
        await signOut(auth);
        if (typeof showToast === 'function') {
            showToast('Successfully signed out!', 'success');
        }
    } catch (error) {
        console.error('Logout error:', error);
    }
}

/**
 * Session Monitoring
 */
export function startSessionMonitoring() {
    if (sessionCheckInterval) {
        clearInterval(sessionCheckInterval);
    }
    
    sessionCheckInterval = setInterval(async () => {
        try {
            await ensureValidSession();
        } catch (error) {
            console.error('Session check failed:', error);
            if (typeof showToast === 'function') {
                showToast('Session expired. Please sign in again.', 'error');
            }
            logout();
        }
    }, 300000); // Check every 5 minutes
    
    console.log('📊 Session monitoring started');
}

export function stopSessionMonitoring() {
    if (sessionCheckInterval) {
        clearInterval(sessionCheckInterval);
        sessionCheckInterval = null;
        console.log('📊 Session monitoring stopped');
    }
}

/**
 * Ensure Valid Session
 */
export async function ensureValidSession() {
    if (typeof globalThis.currentUser === 'undefined' || !globalThis.currentUser) {
        throw new Error('No user session found');
    }
    
    const currentUser = globalThis.currentUser;
    
    try {
        // Mobile-specific session validation
        if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            try {
                const token = await currentUser.getIdToken(true);
                if (!token) {
                    throw new Error('No valid user session');
                }
            } catch (error) {
                console.error('Mobile session validation failed:', error);
                throw new Error('No valid user session');
            }
        } else {
            // Desktop: Enhanced token validation with retry logic
            try {
                // Try to get the current token first (without forcing refresh)
                const token = await currentUser.getIdToken(false);
                if (token) {
                    console.log('✅ Desktop session valid (cached token):', currentUser.email);
                    return true;
                }
            } catch (tokenError) {
                console.log('Cached token failed, trying refresh...', tokenError);
                
                // If cached token fails, try to refresh
                try {
                    await currentUser.getIdToken(true);
                    console.log('✅ Desktop session valid (refreshed token):', currentUser.email);
                    return true;
                } catch (refreshError) {
                    console.error('Token refresh failed:', refreshError);
                    throw refreshError;
                }
            }
        }
    } catch (error) {
        console.error('Session validation failed:', error);
        
        // More specific error handling
        if (error.code === 'auth/network-request-failed') {
            throw new Error('Network connection error. Please check your internet connection.');
        } else if (error.code === 'auth/too-many-requests') {
            throw new Error('Too many requests. Please wait a moment and try again.');
        } else if (error.code === 'auth/user-token-expired') {
            throw new Error('Session expired');
        } else {
            throw new Error('Session validation failed');
        }
    }
}

// Export functions to global scope for compatibility
globalThis.signInWithGoogle = signInWithGoogle;
globalThis.register = register;
globalThis.login = login;
globalThis.logout = logout;
globalThis.startSessionMonitoring = startSessionMonitoring;
globalThis.stopSessionMonitoring = stopSessionMonitoring;
globalThis.ensureValidSession = ensureValidSession; 