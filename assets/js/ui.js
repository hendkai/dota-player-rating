/**
 * UI Utilities Module
 * Handles toasts, messages, loading states, and UI interactions
 */

/**
 * Show toast notification
 */
export function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) {
        console.warn('Toast element not found');
        return;
    }
    
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

/**
 * Show message in specific element
 */
export function showMessage(elementId, message, type = 'info') {
    const element = document.getElementById(elementId);
    if (!element) {
        console.warn(`Message element ${elementId} not found`);
        return;
    }
    
    element.innerHTML = `<div class="message ${type}">${message}</div>`;
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        if (element.innerHTML.includes(message)) {
            element.innerHTML = '';
        }
    }, 5000);
}

/**
 * Set loading state for buttons
 */
export function setLoadingState(action, isLoading) {
    const loadingElement = document.getElementById(`${action}-loading`);
    const textElement = document.getElementById(`${action}-text`);
    
    if (loadingElement && textElement) {
        if (isLoading) {
            loadingElement.classList.remove('hidden');
            textElement.classList.add('hidden');
        } else {
            loadingElement.classList.add('hidden');
            textElement.classList.remove('hidden');
        }
    }
}

/**
 * Theme Management
 */
export function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) {
        themeIcon.textContent = newTheme === 'light' ? '🌙' : '☀️';
    }
    localStorage.setItem('theme', newTheme);
    
    showToast(`Switched to ${newTheme} mode`, 'success');
}

/**
 * Initialize theme from localStorage
 */
export function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) {
        themeIcon.textContent = savedTheme === 'light' ? '🌙' : '☀️';
    }
}

/**
 * Tab Management
 */
export function switchToTab(tabName) {
    console.log('Switching to tab:', tabName);
    
    // Hide all tab contents
    const allTabContents = document.querySelectorAll('.tab-content');
    allTabContents.forEach(content => {
        content.classList.remove('active');
        content.classList.add('hidden');
    });
    
    // Remove active class from all tabs
    const allTabs = document.querySelectorAll('.tab');
    allTabs.forEach(tab => tab.classList.remove('active'));
    
    // Show selected tab content
    const selectedContent = document.getElementById(`${tabName}-content`);
    if (selectedContent) {
        selectedContent.classList.add('active');
        selectedContent.classList.remove('hidden');
    }
    
    // Mark selected tab as active
    const selectedTab = document.querySelector(`[onclick="switchToTab('${tabName}')"]`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
}

/**
 * Update user info display
 */
export function updateUserInfo(user) {
    const userMenu = document.getElementById('user-menu');
    const userAvatar = document.getElementById('user-avatar');
    const userName = document.getElementById('user-name');
    const userEmail = document.getElementById('user-email');
    
    if (userMenu && userAvatar && userName && userEmail) {
        userMenu.classList.remove('hidden');
        
        // Set avatar
        if (user.photoURL) {
            userAvatar.style.backgroundImage = `url(${user.photoURL})`;
            userAvatar.textContent = '';
        } else {
            userAvatar.style.backgroundImage = '';
            userAvatar.textContent = user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase();
        }
        
        // Set user details
        userName.textContent = user.displayName || 'User';
        userEmail.textContent = user.email;
    }
}

/**
 * Show/Hide sections
 */
export function showAuthSection() {
    const authSection = document.getElementById('auth-section');
    const mainApp = document.getElementById('main-app');
    const userMenu = document.getElementById('user-menu');
    
    if (authSection) authSection.classList.remove('hidden');
    if (mainApp) mainApp.classList.add('hidden');
    if (userMenu) userMenu.classList.add('hidden');
}

export function showMainApp() {
    const authSection = document.getElementById('auth-section');
    const mainApp = document.getElementById('main-app');
    
    if (authSection) authSection.classList.add('hidden');
    if (mainApp) mainApp.classList.remove('hidden');
    
    // Load main app content
    if (typeof loadMainAppContent === 'function') {
        loadMainAppContent();
    }
}

/**
 * Modal utilities
 */
export function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.remove();
    }
}

/**
 * Initialize tabs system
 */
export function initializeTabs() {
    console.log('🔄 Initializing tabs...');
    
    // Set default tab
    const defaultTab = document.querySelector('.tab[onclick]');
    if (defaultTab) {
        const defaultTabName = defaultTab.getAttribute('onclick').match(/switchToTab\('(.+?)'\)/)?.[1];
        if (defaultTabName) {
            switchToTab(defaultTabName);
        }
    }
}

/**
 * Discord community function
 */
export function openDiscord() {
    window.open('https://discord.gg/gDXytxM7gP', '_blank', 'noopener,noreferrer');
    showToast('Discord Community opening... 💬', 'success');
}

/**
 * Show email with anti-scraping protection
 */
export function showEmail() {
    const emailParts = ['hendrikkaiser', '@', 'posteo', '.', 'de'];
    const email = emailParts.join('');
    
    const contactElements = [
        document.getElementById('contact-email'),
        document.getElementById('contact-email-footer')
    ];
    
    contactElements.forEach(element => {
        if (element) {
            element.innerHTML = `<a href="mailto:${email}" style="color: var(--primary-color); text-decoration: underline;">${email}</a>`;
            element.onclick = null;
        }
    });
    
    showToast('Email address revealed!', 'success');
}

// Export functions to global scope for compatibility
globalThis.showToast = showToast;
globalThis.showMessage = showMessage;
globalThis.setLoadingState = setLoadingState;
globalThis.toggleTheme = toggleTheme;
globalThis.switchToTab = switchToTab;
globalThis.updateUserInfo = updateUserInfo;
globalThis.showAuthSection = showAuthSection;
globalThis.showMainApp = showMainApp;
globalThis.initializeTabs = initializeTabs;
globalThis.openDiscord = openDiscord;
globalThis.showEmail = showEmail; 