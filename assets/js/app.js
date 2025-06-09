/**
 * Main Application Module
 * Initializes the app and handles authentication state changes
 */

import { auth } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

/**
 * Load Main App Content
 */
export function loadMainAppContent() {
    console.log('🏗️ loadMainAppContent started');
    
    try {
        const mainAppHTML = `
            <!-- Dashboard -->
            <div class="card">
                <h2>📊 Community Dashboard</h2>
                
                <!-- Community Mission Statement -->
                <div style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.05)); border: 1px solid var(--success-color); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                    <h3 style="color: var(--success-color); margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                        🌟 Building a Positive Dota Community
                    </h3>
                    <p style="color: var(--text-secondary); margin-bottom: 12px; font-size: 0.95rem;">
                        Our platform is dedicated to fostering positive interactions and constructive feedback in the Dota 2 community. 
                        By highlighting good sportsmanship and helping players improve, we create better matches for everyone.
                    </p>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; font-size: 0.9rem;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="color: var(--success-color);">🤝</span>
                            <span style="color: var(--text-secondary);">Promote teamwork and collaboration</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="color: var(--success-color);">📈</span>
                            <span style="color: var(--text-secondary);">Help players improve their skills</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="color: var(--success-color);">🛡️</span>
                            <span style="color: var(--text-secondary);">Reduce toxic behavior</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="color: var(--success-color);">🎮</span>
                            <span style="color: var(--text-secondary);">Create better gaming experiences</span>
                        </div>
                    </div>
                </div>
                
                <!-- Quick Stats -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px;">
                    <div style="background: var(--glass-bg); border-radius: 12px; padding: 16px; border: 1px solid var(--border-color); text-align: center;">
                        <div style="font-size: 2rem; margin-bottom: 8px;">⭐</div>
                        <div style="color: var(--text-primary); font-weight: 600;">Community Rating</div>
                        <div style="color: var(--text-secondary); font-size: 0.9rem;">4.2/5.0 Average</div>
                    </div>
                    <div style="background: var(--glass-bg); border-radius: 12px; padding: 16px; border: 1px solid var(--border-color); text-align: center;">
                        <div style="font-size: 2rem; margin-bottom: 8px;">📊</div>
                        <div style="color: var(--text-primary); font-weight: 600;">Total Reviews</div>
                        <div style="color: var(--text-secondary); font-size: 0.9rem;">Growing Daily</div>
                    </div>
                    <div style="background: var(--glass-bg); border-radius: 12px; padding: 16px; border: 1px solid var(--border-color); text-align: center;">
                        <div style="font-size: 2rem; margin-bottom: 8px;">👥</div>
                        <div style="color: var(--text-primary); font-weight: 600;">Active Users</div>
                        <div style="color: var(--text-secondary); font-size: 0.9rem;">Join the Community</div>
                    </div>
                </div>
                
                <!-- Navigation Tabs -->
                <div style="display: flex; gap: 8px; margin-bottom: 24px; flex-wrap: wrap; border-bottom: 1px solid var(--border-color); padding-bottom: 16px;">
                    <button class="tab active" onclick="switchToTab('search')">🔍 Search Players</button>
                    <button class="tab" onclick="switchToTab('leaderboard')">🏆 Leaderboard</button>
                    <button class="tab" onclick="switchToTab('analytics')">📊 Analytics</button>
                    <button class="tab" onclick="switchToTab('reviews')">💬 My Reviews</button>
                    <div id="admin-tab" class="hidden">
                        <button class="tab" onclick="switchToTab('admin')">⚙️ Admin</button>
                    </div>
                </div>
                
                <!-- Tab Contents -->
                <div id="search-content" class="tab-content active">
                    <h3 style="color: var(--text-primary); margin-bottom: 16px;">🔍 Player Search</h3>
                    <div style="display: grid; gap: 16px;">
                        <div class="form-group">
                            <label for="search-player">Enter Player Name or Steam Profile URL</label>
                            <input type="text" id="search-player" class="form-input" 
                                placeholder="Player name, Steam ID, or steamcommunity.com profile URL"
                                onkeydown="handleSearchKeydown(event)"
                                oninput="handleSearchInput()">
                        </div>
                        
                        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                            <button class="btn" onclick="searchPlayer()">
                                <span id="search-loading" class="hidden">
                                    <span class="loading-spinner"></span>
                                </span>
                                <span id="search-text">🔍 Search Player</span>
                            </button>
                            <button class="btn btn-secondary" onclick="showRecentSearches()">📝 Recent Searches</button>
                            <button class="btn btn-secondary" onclick="showPopularPlayers()">🌟 Popular Players</button>
                        </div>
                        
                        <div id="search-suggestions" class="hidden"></div>
                        <div id="search-results"></div>
                    </div>
                </div>
                
                <div id="leaderboard-content" class="tab-content hidden">
                    <h3 style="color: var(--text-primary); margin-bottom: 16px;">🏆 Community Leaderboard</h3>
                    <p style="color: var(--text-secondary); margin-bottom: 20px;">Top-rated players in our community</p>
                    <div id="leaderboard-results">
                        <div style="text-align: center; padding: 40px 0; color: var(--text-muted);">
                            🚧 Leaderboard feature coming soon!<br>
                            <small>Rate more players to help us build comprehensive rankings</small>
                        </div>
                    </div>
                </div>
                
                <div id="analytics-content" class="tab-content hidden">
                    <h3 style="color: var(--text-primary); margin-bottom: 16px;">📊 Community Analytics</h3>
                    <div id="analytics-results">
                        <div style="text-align: center; padding: 40px 0; color: var(--text-muted);">
                            📈 Analytics dashboard loading...<br>
                            <small>Community insights and trends</small>
                        </div>
                    </div>
                </div>
                
                <div id="reviews-content" class="tab-content hidden">
                    <h3 style="color: var(--text-primary); margin-bottom: 16px;">💬 My Reviews</h3>
                    <div id="my-reviews-results">
                        <div style="text-align: center; padding: 40px 0; color: var(--text-muted);">
                            📝 Loading your reviews...<br>
                            <small>Your contributions to the community</small>
                        </div>
                    </div>
                </div>
                
                <div id="admin-content" class="tab-content hidden">
                    <h3 style="color: var(--text-primary); margin-bottom: 16px;">⚙️ Admin Panel</h3>
                    <div id="admin-results">
                        <div style="text-align: center; padding: 40px 0; color: var(--text-muted);">
                            🔐 Loading admin panel...<br>
                            <small>Community management tools</small>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const mainApp = document.getElementById('main-app');
        if (mainApp) {
            mainApp.innerHTML = mainAppHTML;
            
            // Initialize tabs
            if (typeof initializeTabs === 'function') {
                initializeTabs();
            }
            
            console.log('✅ Main app content loaded successfully');
        } else {
            console.error('❌ Main app container not found');
        }
        
    } catch (error) {
        console.error('❌ Error loading main app content:', error);
    }
}

/**
 * Initialize the application
 */
export function initializeApp() {
    console.log('🚀 Initializing Dota Player Rating App...');
    
    try {
        // Initialize theme
        if (typeof initializeTheme === 'function') {
            initializeTheme();
        }
        
        // Detect and handle browser extension conflicts
        const hasExtensionConflict = typeof lockdown !== 'undefined' || 
                                   window.location.href.includes('SES') ||
                                   document.documentElement.innerHTML.includes('SES_UNCAUGHT_EXCEPTION');
        
        if (hasExtensionConflict) {
            console.warn('⚠️ Browser extension conflict detected - implementing workarounds');
            
            // Add extension conflict warning to UI
            setTimeout(() => {
                if (typeof showToast === 'function') {
                    showToast('Browser extension detected. If you experience issues, try disabling security extensions or use incognito mode.', 'warning');
                }
            }, 2000);
        }
        
        // Set up auth state observer with enhanced error handling
        onAuthStateChanged(auth, (user) => {
            try {
                if (user) {
                    console.log('👤 User authenticated:', user.email);
                    
                    // Update global user reference
                    globalThis.currentUser = user;
                    
                    // Show main app and hide auth section
                    if (typeof showMainApp === 'function') {
                        showMainApp();
                    }
                    if (typeof updateUserInfo === 'function') {
                        updateUserInfo(user);
                    }
                    if (typeof startSessionMonitoring === 'function') {
                        startSessionMonitoring();
                    }
                    
                } else {
                    console.log('🔐 User not authenticated');
                    globalThis.currentUser = null;
                    
                    // Show auth section and hide main app
                    if (typeof showAuthSection === 'function') {
                        showAuthSection();
                    }
                    if (typeof stopSessionMonitoring === 'function') {
                        stopSessionMonitoring();
                    }
                }
            } catch (authError) {
                console.error('❌ Auth state change error:', authError);
                if (typeof showToast === 'function') {
                    showToast('Authentication error. Please refresh the page.', 'error');
                }
            }
        }, (error) => {
            console.error('❌ Auth observer error:', error);
            if (typeof showToast === 'function') {
                showToast('Authentication service error. Please refresh the page.', 'error');
            }
        });
        
        console.log('✅ App initialization complete');
        
    } catch (error) {
        console.error('❌ App initialization failed:', error);
        
        // Fallback error handling
        setTimeout(() => {
            if (typeof showToast === 'function') {
                showToast('App initialization error. Please refresh the page and try again.', 'error');
            } else {
                alert('App initialization error. Please refresh the page and try again.');
            }
        }, 1000);
    }
}

/**
 * DOM Content Loaded Event Handler
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 Setting up event listeners...');
    
    // Initialize the app
    initializeApp();
    
    // Google Sign In Button
    const googleBtn = document.getElementById('google-signin-btn');
    if (googleBtn && typeof signInWithGoogle === 'function') {
        googleBtn.addEventListener('click', signInWithGoogle);
        console.log('✅ Google sign-in button event listener attached');
    } else {
        console.warn('⚠️ Google sign-in button not found or function not available');
    }
});

// Export functions to global scope for compatibility
globalThis.loadMainAppContent = loadMainAppContent;
globalThis.initializeApp = initializeApp; 