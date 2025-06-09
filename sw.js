// Service Worker for Dota Player Rating PWA - Version 1.0.1 (Cache Busting)
const SCRIPT_VERSION = '1.0.1';
const CACHE_NAME = `dota-rating-v${SCRIPT_VERSION}`;
const STATIC_CACHE_NAME = `dota-rating-static-v${SCRIPT_VERSION}`;
const DYNAMIC_CACHE_NAME = `dota-rating-dynamic-v${SCRIPT_VERSION}`;

// Resources to cache immediately
const STATIC_RESOURCES = [
    '/',
    '/index.html',
    '/site.webmanifest',
    '/favicon.ico',
    '/favicon-32x32.png',
    '/favicon-16x16.png',
    '/apple-touch-icon.png',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
    'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2'
];

// API endpoints that should be cached dynamically
const API_CACHE_PATTERNS = [
    /https:\/\/api\.opendota\.com\/api\/.*/,
    /https:\/\/firestore\.googleapis\.com\/.*/
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Caching static resources');
                return cache.addAll(STATIC_RESOURCES);
            })
            .then(() => {
                console.log('Service Worker: Static resources cached successfully');
                return self.skipWaiting(); // Force activation
            })
            .catch((error) => {
                console.error('Service Worker: Failed to cache static resources', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== STATIC_CACHE_NAME && 
                            cacheName !== DYNAMIC_CACHE_NAME &&
                            cacheName.startsWith('dota-rating-')) {
                            console.log('Service Worker: Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker: Activated successfully');
                return self.clients.claim();
            })
    );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip chrome-extension and other unsupported protocols
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        return;
    }
    
    // Handle different types of requests
    if (isStaticResource(request)) {
        // Cache first for static resources
        event.respondWith(cacheFirst(request));
    } else if (isAPIRequest(request)) {
        // Network first for API requests with cache fallback
        event.respondWith(networkFirst(request));
    } else if (isNavigationRequest(request)) {
        // Network first for navigation with offline fallback
        event.respondWith(navigationHandler(request));
    } else {
        // Default network first strategy
        event.respondWith(networkFirst(request));
    }
});

// Check if request is for static resources
function isStaticResource(request) {
    const url = new URL(request.url);
    return STATIC_RESOURCES.some(resource => 
        url.pathname === resource || request.url === resource
    ) || 
    url.pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf)$/);
}

// Check if request is for API
function isAPIRequest(request) {
    return API_CACHE_PATTERNS.some(pattern => pattern.test(request.url));
}

// Check if request is navigation
function isNavigationRequest(request) {
    return request.mode === 'navigate' || 
           (request.method === 'GET' && request.headers.get('accept').includes('text/html'));
}

// Cache First Strategy
async function cacheFirst(request) {
    try {
        const url = new URL(request.url);
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
            // Nicht unterstütztes Protokoll, nicht cachen
            return fetch(request);
        }
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.error('Cache First failed:', error);
        return new Response('Offline - Resource not available', { 
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// Network First Strategy
async function networkFirst(request) {
    try {
        const url = new URL(request.url);
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
            // Nicht unterstütztes Protokoll, nicht cachen
            return fetch(request);
        }
        
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log('Network failed, trying cache:', error);
        
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return offline page for failed requests
        return new Response(JSON.stringify({
            error: 'Offline',
            message: 'This feature requires an internet connection'
        }), {
            headers: { 'Content-Type': 'application/json' },
            status: 503
        });
    }
}

// Navigation Handler
async function navigationHandler(request) {
    try {
        const networkResponse = await fetch(request);
        return networkResponse;
    } catch (error) {
        console.log('Navigation failed, serving cached index:', error);
        
        const cachedResponse = await caches.match('/index.html');
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Fallback offline page
        return new Response(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Offline - Dota Player Rating</title>
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #0f1419; color: #f1f5f9; }
                    .offline-container { max-width: 500px; margin: 0 auto; }
                    .icon { font-size: 4rem; margin-bottom: 20px; }
                    h1 { color: #6366f1; margin-bottom: 20px; }
                    p { line-height: 1.6; margin-bottom: 30px; }
                    button { background: #6366f1; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 16px; }
                    button:hover { background: #5855eb; }
                </style>
            </head>
            <body>
                <div class="offline-container">
                    <div class="icon">📱</div>
                    <h1>You're Offline</h1>
                    <p>Dota Player Rating requires an internet connection. Please check your connection and try again.</p>
                    <button onclick="window.location.reload()">Try Again</button>
                </div>
            </body>
            </html>
        `, {
            headers: { 'Content-Type': 'text/html' },
            status: 503
        });
    }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
    console.log('Service Worker: Background sync triggered');
    
    if (event.tag === 'background-rating-sync') {
        event.waitUntil(syncRatings());
    }
});

// Push notification handling
self.addEventListener('push', (event) => {
    console.log('Service Worker: Push message received');
    
    const options = {
        body: event.data ? event.data.text() : 'New activity in Dota Player Rating!',
        icon: '/favicon-32x32.png',
        badge: '/favicon-32x32.png',
        tag: 'dota-rating-notification',
        requireInteraction: true,
        actions: [
            {
                action: 'view',
                title: 'View'
            },
            {
                action: 'dismiss',
                title: 'Dismiss'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('Dota Player Rating', options)
    );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
    console.log('Service Worker: Notification clicked');
    
    event.notification.close();
    
    if (event.action === 'view') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Sync ratings when back online
async function syncRatings() {
    try {
        // Implementation for syncing offline ratings
        console.log('Service Worker: Syncing offline data...');
        // This would sync any ratings made while offline
    } catch (error) {
        console.error('Service Worker: Sync failed', error);
    }
} 