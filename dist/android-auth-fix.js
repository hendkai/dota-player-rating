// Android Auth Fix for Capacitor
// This file handles Google Authentication specifically for Android WebView

import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { getAuth, signInWithCredential, GoogleAuthProvider } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Initialize Google Auth for Android
async function initializeGoogleAuthForAndroid() {
    try {
        await GoogleAuth.initialize({
            clientId: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
            scopes: ['profile', 'email'],
            grantOfflineAccess: true,
        });
        console.log('Google Auth initialized for Android');
    } catch (error) {
        console.error('Failed to initialize Google Auth:', error);
    }
}

// Override the original Google sign-in function for Android
window.signInWithGoogleAndroid = async function() {
    try {
        showLoading('Signing in with Google...');
        
        // Use native Google Auth plugin
        const googleUser = await GoogleAuth.signIn();
        
        if (googleUser && googleUser.authentication) {
            // Create Firebase credential
            const credential = GoogleAuthProvider.credential(
                googleUser.authentication.idToken,
                googleUser.authentication.accessToken
            );
            
            // Sign in to Firebase with the credential
            const auth = getAuth();
            const result = await signInWithCredential(auth, credential);
            
            // Update UI
            if (result.user) {
                console.log('Android Google sign-in successful:', result.user);
                closeModal();
                hideLoading();
                showToast('Welcome back! Signed in successfully.', 'success');
                updateUserInterface();
            }
        }
    } catch (error) {
        console.error('Android Google sign-in failed:', error);
        hideLoading();
        
        let errorMessage = 'Google sign-in failed. Please try again.';
        
        if (error.message.includes('popup')) {
            errorMessage = 'Google sign-in popup was blocked. Please check popup settings.';
        } else if (error.message.includes('network')) {
            errorMessage = 'Network error. Please check your internet connection.';
        }
        
        showToast(errorMessage, 'error');
    }
};

// Check if we're running in Capacitor/Android
function isCapacitorApp() {
    return window.Capacitor && window.Capacitor.platform !== 'web';
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (isCapacitorApp()) {
        initializeGoogleAuthForAndroid();
        
        // Replace the original Google sign-in function
        window.signInWithGoogle = window.signInWithGoogleAndroid;
        console.log('Using Android-optimized Google Auth');
    }
});

export { initializeGoogleAuthForAndroid, isCapacitorApp }; 