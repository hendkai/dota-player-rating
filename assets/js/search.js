/**
 * Search Module
 * Handles player search, OpenDota API integration, and search suggestions
 */

import { OPENDOTA_BASE_URL, MIN_REQUEST_INTERVAL, lastRequestTime } from './firebase-config.js';

// Search variables
let searchTimeout = null;
let recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');

/**
 * Rate-limited API request
 */
async function makeRateLimitedRequest(url) {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
        const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
        await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    lastRequestTime = Date.now();
    return fetch(url);
}

/**
 * Handle search input with debouncing
 */
export function handleSearchInput() {
    const input = document.getElementById('search-player');
    if (!input) return;
    
    const query = input.value.trim();
    
    // Clear previous timeout
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }
    
    // Hide suggestions if query is too short
    if (query.length < 2) {
        hideSuggestions();
        return;
    }
    
    // Debounce the search
    searchTimeout = setTimeout(() => {
        showSuggestions(query);
    }, 300);
}

/**
 * Handle search keydown events
 */
export function handleSearchKeydown(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        searchPlayer();
    } else if (event.key === 'Escape') {
        hideSuggestions();
    }
}

/**
 * Show search suggestions
 */
function showSuggestions(query) {
    const suggestionsContainer = document.getElementById('search-suggestions');
    if (!suggestionsContainer) return;
    
    // Filter recent searches
    const matchingSearches = recentSearches.filter(search => 
        search.playerName.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);
    
    if (matchingSearches.length === 0) {
        hideSuggestions();
        return;
    }
    
    const suggestionsHTML = matchingSearches.map(search => `
        <div class="suggestion-item" onclick="selectSuggestion('${search.playerName}')">
            <div class="suggestion-name">${search.playerName}</div>
            <div class="suggestion-meta">Last searched: ${new Date(search.timestamp).toLocaleDateString()}</div>
        </div>
    `).join('');
    
    suggestionsContainer.innerHTML = `
        <div class="suggestions-list">
            <div class="suggestions-header">Recent searches</div>
            ${suggestionsHTML}
        </div>
    `;
    
    suggestionsContainer.classList.remove('hidden');
}

/**
 * Hide search suggestions
 */
function hideSuggestions() {
    const suggestionsContainer = document.getElementById('search-suggestions');
    if (suggestionsContainer) {
        suggestionsContainer.classList.add('hidden');
    }
}

/**
 * Select a suggestion
 */
export function selectSuggestion(suggestion) {
    const input = document.getElementById('search-player');
    if (input) {
        input.value = suggestion;
        hideSuggestions();
        searchPlayer();
    }
}

/**
 * Search for player
 */
export async function searchPlayer() {
    const input = document.getElementById('search-player');
    const resultsContainer = document.getElementById('search-results');
    
    if (!input || !resultsContainer) {
        console.error('Search elements not found');
        return;
    }
    
    const query = input.value.trim();
    if (!query) {
        if (typeof showToast === 'function') {
            showToast('Please enter a player name or Steam ID', 'error');
        }
        return;
    }
    
    // Show loading state
    if (typeof setLoadingState === 'function') {
        setLoadingState('search', true);
    }
    
    try {
        hideSuggestions();
        console.log('Searching for:', query);
        
        // Search using OpenDota API
        const searchResponse = await makeRateLimitedRequest(
            `${OPENDOTA_BASE_URL}/search?q=${encodeURIComponent(query)}`
        );
        
        if (!searchResponse.ok) {
            throw new Error(`Search failed: ${searchResponse.status}`);
        }
        
        const searchResults = await searchResponse.json();
        
        if (!searchResults || searchResults.length === 0) {
            resultsContainer.innerHTML = `
                <div class="error-message">
                    <h3>❌ Player not found</h3>
                    <p>Could not find player "${query}". Please check the name or Steam profile URL.</p>
                </div>
            `;
            return;
        }
        
        const playerData = searchResults[0];
        
        // Add to recent searches
        addToRecentSearches(playerData.personaname || query, playerData.account_id);
        
        // Display player results
        displayPlayerResults(playerData);
        
    } catch (error) {
        console.error('Search error:', error);
        resultsContainer.innerHTML = `
            <div class="error-message">
                <h3>⚠️ Search failed</h3>
                <p>Unable to search for player. Please try again.</p>
            </div>
        `;
    } finally {
        if (typeof setLoadingState === 'function') {
            setLoadingState('search', false);
        }
    }
}

/**
 * Display player search results
 */
function displayPlayerResults(playerData) {
    const resultsContainer = document.getElementById('search-results');
    if (!resultsContainer) return;
    
    const playerName = playerData.personaname || 'Unknown Player';
    const playerId = playerData.account_id;
    const avatar = playerData.avatarfull || playerData.avatar || '/assets/icons/default-avatar.png';
    
    resultsContainer.innerHTML = `
        <div class="player-result">
            <div class="player-header">
                <img src="${avatar}" alt="${playerName}" class="player-avatar" 
                     onerror="this.src='/assets/icons/default-avatar.png'">
                <div class="player-info">
                    <h3>${playerName}</h3>
                    <p class="player-id">Steam ID: ${playerId}</p>
                    <div class="player-actions">
                        <button class="btn" onclick="showRatingForm('${playerId}', '${playerName.replace(/'/g, "\\'")}')">
                            ⭐ Rate Player
                        </button>
                        <button class="btn btn-secondary" onclick="viewPlayerReviews('${playerId}')">
                            💬 View Reviews
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Add to recent searches
 */
function addToRecentSearches(playerName, playerId) {
    const searchEntry = {
        playerName,
        playerId,
        timestamp: Date.now()
    };
    
    // Remove existing entry if present
    recentSearches = recentSearches.filter(search => search.playerId !== playerId);
    
    // Add to beginning
    recentSearches.unshift(searchEntry);
    
    // Keep only last 10 searches
    recentSearches = recentSearches.slice(0, 10);
    
    // Save to localStorage
    localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
}

/**
 * Show recent searches
 */
export function showRecentSearches() {
    const resultsContainer = document.getElementById('search-results');
    if (!resultsContainer) return;
    
    if (recentSearches.length === 0) {
        resultsContainer.innerHTML = `
            <div class="info-message">
                <h3>📝 No recent searches</h3>
                <p>Your recent player searches will appear here.</p>
            </div>
        `;
        return;
    }
    
    const searchesHTML = recentSearches.map(search => `
        <div class="recent-search-item">
            <div class="search-info">
                <h4>${search.playerName}</h4>
                <p class="search-meta">ID: ${search.playerId} • ${new Date(search.timestamp).toLocaleString()}</p>
            </div>
        </div>
    `).join('');
    
    resultsContainer.innerHTML = `
        <div class="recent-searches">
            <h3>📝 Recent Searches</h3>
            <div class="searches-list">
                ${searchesHTML}
            </div>
        </div>
    `;
}

/**
 * Show popular players (placeholder)
 */
export function showPopularPlayers() {
    const resultsContainer = document.getElementById('search-results');
    if (!resultsContainer) return;
    
    resultsContainer.innerHTML = `
        <div class="info-message">
            <h3>🌟 Popular Players</h3>
            <p>This feature will show community favorites and highly-rated players.</p>
            <p class="coming-soon">Coming soon!</p>
        </div>
    `;
}

// Export functions to global scope for compatibility
globalThis.handleSearchInput = handleSearchInput;
globalThis.handleSearchKeydown = handleSearchKeydown;
globalThis.selectSuggestion = selectSuggestion;
globalThis.searchPlayer = searchPlayer;
globalThis.showRecentSearches = showRecentSearches;
globalThis.showPopularPlayers = showPopularPlayers; 