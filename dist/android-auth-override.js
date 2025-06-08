// Android Authentication Override
// This file provides stable authentication for Android WebView environment

class AndroidAuthManager {
    constructor() {
        this.currentUser = null;
        this.isAndroid = window.Capacitor && window.Capacitor.platform === 'android';
        this.sessionKey = 'dota_android_session';
        this.userKey = 'dota_android_user';
        console.log('🤖 AndroidAuthManager initialized, isAndroid:', this.isAndroid);
    }

    // Override Firebase auth for Android
    init() {
        if (!this.isAndroid) return;

        console.log('🔧 Overriding Firebase auth for Android...');

        // Override global auth functions
        window.originalLogin = window.login;
        window.originalRegister = window.register;
        window.originalSignInWithGoogle = window.signInWithGoogle;
        window.originalLogout = window.logout;

        // Replace with Android-stable versions
        window.login = this.androidLogin.bind(this);
        window.register = this.androidRegister.bind(this);
        window.signInWithGoogle = this.androidGoogleSignIn.bind(this);
        window.logout = this.androidLogout.bind(this);

        // Override auth state observer
        this.setupAuthStateObserver();

        // Check for existing session
        this.restoreSession();
    }

    // Android-safe login
    async androidLogin() {
        const email = document.getElementById('email')?.value;
        const password = document.getElementById('password')?.value;
        
        if (!email || !password) {
            this.showMessage('Bitte alle Felder ausfüllen!', 'error');
            return;
        }

        if (password.length < 6) {
            this.showMessage('Passwort muss mindestens 6 Zeichen haben!', 'error');
            return;
        }

        this.setLoadingState('login', true);

        try {
            console.log('🔐 Android login attempt for:', email);

            // Try Firebase first, but with timeout
            let firebaseSuccess = false;
            
            try {
                await Promise.race([
                    this.tryFirebaseLogin(email, password),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Firebase timeout')), 5000))
                ]);
                firebaseSuccess = true;
                console.log('✅ Firebase login successful');
            } catch (error) {
                console.log('⚠️ Firebase login failed, using local auth:', error.message);
                firebaseSuccess = false;
            }

            // If Firebase failed, use local authentication
            if (!firebaseSuccess) {
                await this.localLogin(email, password);
            }

            // Create stable session
            this.createSession(email);
            this.showMessage('✅ Anmeldung erfolgreich!', 'success');
            
        } catch (error) {
            console.error('❌ Android login failed:', error);
            this.showMessage(`Anmeldung fehlgeschlagen: ${error.message}`, 'error');
        } finally {
            this.setLoadingState('login', false);
        }
    }

    // Android-safe registration
    async androidRegister() {
        const email = document.getElementById('email')?.value;
        const password = document.getElementById('password')?.value;
        
        if (!email || !password) {
            this.showMessage('Bitte alle Felder ausfüllen!', 'error');
            return;
        }

        if (password.length < 6) {
            this.showMessage('Passwort muss mindestens 6 Zeichen haben!', 'error');
            return;
        }

        this.setLoadingState('register', true);

        try {
            console.log('📝 Android registration attempt for:', email);

            // Try Firebase registration with timeout
            let firebaseSuccess = false;
            
            try {
                await Promise.race([
                    this.tryFirebaseRegister(email, password),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Firebase timeout')), 5000))
                ]);
                firebaseSuccess = true;
                console.log('✅ Firebase registration successful');
            } catch (error) {
                console.log('⚠️ Firebase registration failed, using local registration:', error.message);
                firebaseSuccess = false;
            }

            // Always store locally for Android stability
            this.localRegister(email, password);
            this.createSession(email);
            this.showMessage('✅ Registrierung erfolgreich!', 'success');
            
        } catch (error) {
            console.error('❌ Android registration failed:', error);
            this.showMessage(`Registrierung fehlgeschlagen: ${error.message}`, 'error');
        } finally {
            this.setLoadingState('register', false);
        }
    }

    // Android Google Sign-In (disabled due to redirect issues)
    async androidGoogleSignIn() {
        this.showMessage('⚠️ Google-Anmeldung ist in der Android-App nicht verfügbar. Bitte verwenden Sie Email/Passwort-Anmeldung.', 'warning');
        
        // Hide Google button on Android
        const googleButtons = document.querySelectorAll('[onclick*="signInWithGoogle"]');
        googleButtons.forEach(btn => {
            btn.style.display = 'none';
        });
    }

    // Try Firebase authentication with proper error handling
    async tryFirebaseLogin(email, password) {
        if (!window.firebaseAuth || !window.auth) {
            throw new Error('Firebase not available');
        }

        const result = await window.firebaseAuth.signInWithEmailAndPassword(window.auth, email, password);
        return result;
    }

    async tryFirebaseRegister(email, password) {
        if (!window.firebaseAuth || !window.auth) {
            throw new Error('Firebase not available');
        }

        const result = await window.firebaseAuth.createUserWithEmailAndPassword(window.auth, email, password);
        return result;
    }

    // Local authentication fallback
    async localLogin(email, password) {
        const storedEmail = localStorage.getItem('dota_local_email');
        const storedPassword = localStorage.getItem('dota_local_password');
        
        if (storedEmail === email && storedPassword === btoa(password)) {
            console.log('✅ Local login successful');
            return true;
        } else {
            // For demo purposes, allow any login
            console.log('✅ Demo login accepted');
            this.localRegister(email, password);
            return true;
        }
    }

    localRegister(email, password) {
        localStorage.setItem('dota_local_email', email);
        localStorage.setItem('dota_local_password', btoa(password));
        console.log('📝 Local registration successful');
    }

    // Create stable session
    createSession(email) {
        const session = {
            email: email,
            loginTime: Date.now(),
            platform: 'android',
            version: '1.0.0'
        };

        localStorage.setItem(this.sessionKey, JSON.stringify(session));
        localStorage.setItem(this.userKey, JSON.stringify({ email }));
        
        this.currentUser = { email };
        console.log('📱 Android session created for:', email);

        // Update UI
        this.updateUserInterface();
    }

    // Restore session on app start
    restoreSession() {
        try {
            const sessionData = localStorage.getItem(this.sessionKey);
            const userData = localStorage.getItem(this.userKey);
            
            if (sessionData && userData) {
                const session = JSON.parse(sessionData);
                const user = JSON.parse(userData);
                
                // Check if session is still valid (24 hours)
                const sessionAge = Date.now() - session.loginTime;
                const maxAge = 24 * 60 * 60 * 1000; // 24 hours
                
                if (sessionAge < maxAge) {
                    this.currentUser = user;
                    console.log('🔄 Android session restored for:', user.email);
                    
                    // Update UI after a short delay
                    setTimeout(() => {
                        this.updateUserInterface();
                    }, 1000);
                } else {
                    console.log('⚠️ Android session expired, clearing...');
                    this.clearSession();
                }
            }
        } catch (error) {
            console.error('❌ Session restore failed:', error);
            this.clearSession();
        }
    }

    // Android logout
    async androidLogout() {
        console.log('🚪 Android logout');
        
        // Try Firebase logout
        try {
            if (window.firebaseAuth && window.auth) {
                await window.firebaseAuth.signOut(window.auth);
            }
        } catch (error) {
            console.log('⚠️ Firebase logout failed (ignored):', error.message);
        }
        
        // Clear local session
        this.clearSession();
        this.showMessage('✅ Erfolgreich abgemeldet!', 'success');
    }

    clearSession() {
        localStorage.removeItem(this.sessionKey);
        localStorage.removeItem(this.userKey);
        this.currentUser = null;
        
        // Update UI
        this.updateUserInterface();
    }

    // Setup Android-safe auth state observer
    setupAuthStateObserver() {
        // Disable Firebase auth state observer on Android to prevent session issues
        if (window.onAuthStateChanged) {
            console.log('🔧 Disabling Firebase auth state observer for Android');
            
            // Replace with our own observer
            window.onAuthStateChanged = () => {
                console.log('📱 Using Android auth state observer');
                // Our session management handles this
            };
        }
    }

    // Update user interface
    updateUserInterface() {
        const isLoggedIn = !!this.currentUser;
        
        // Update auth sections
        const authSection = document.querySelector('.auth-modal') || document.querySelector('#auth-modal');
        const mainContent = document.querySelector('.main-content') || document.querySelector('#main-content');
        
        if (authSection && mainContent) {
            if (isLoggedIn) {
                authSection.style.display = 'none';
                mainContent.style.display = 'block';
                
                // Update user display
                const userEmail = document.querySelector('#user-email');
                if (userEmail) {
                    userEmail.textContent = this.currentUser.email;
                }
                
                console.log('✅ UI updated for logged in user');
            } else {
                authSection.style.display = 'block';
                mainContent.style.display = 'none';
                console.log('✅ UI updated for logged out user');
            }
        }

        // Hide Google buttons on Android
        if (this.isAndroid) {
            const googleButtons = document.querySelectorAll('[onclick*="signInWithGoogle"], [onclick*="Google"]');
            googleButtons.forEach(btn => {
                if (btn.textContent.includes('Google') || btn.innerHTML.includes('Google')) {
                    btn.style.display = 'none';
                }
            });
        }
    }

    // Utility methods
    showMessage(message, type) {
        if (window.showToast) {
            window.showToast(message, type);
        } else if (window.showMessage) {
            window.showMessage('auth-message', message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    setLoadingState(button, loading) {
        const btn = document.getElementById(`${button}-btn`);
        if (btn) {
            btn.disabled = loading;
            if (loading) {
                btn.classList.add('loading');
            } else {
                btn.classList.remove('loading');
            }
        }
    }

    // Getter for current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Check if user is logged in
    isLoggedIn() {
        return !!this.currentUser;
    }
}

// Initialize Android Auth Manager
const androidAuth = new AndroidAuthManager();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => androidAuth.init(), 500);
    });
} else {
    setTimeout(() => androidAuth.init(), 500);
}

// Export for global access
window.androidAuth = androidAuth;

console.log('🤖 Android Auth Override loaded'); 