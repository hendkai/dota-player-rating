/**
 * Database Module
 * Handles Firestore operations and data management
 */

import { db } from './firebase-config.js';
import { collection, getDocs, query, where, orderBy, limit } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

/**
 * View player reviews
 */
export async function viewPlayerReviews(playerId) {
    console.log('Loading reviews for player:', playerId);
    
    const modalHTML = `
        <div id="player-reviews-modal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>💬 Player Reviews</h2>
                    <button class="close-btn" onclick="closePlayerReviews()">&times;</button>
                </div>
                <div class="modal-body">
                    <div id="reviews-loading">Loading reviews...</div>
                    <div id="reviews-content" class="hidden">
                        <div id="reviews-list"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    try {
        const reviewsQuery = query(
            collection(db, 'ratings'),
            where('playerId', '==', playerId),
            orderBy('timestamp', 'desc'),
            limit(20)
        );
        
        const querySnapshot = await getDocs(reviewsQuery);
        const reviews = [];
        
        querySnapshot.forEach((doc) => {
            reviews.push({ id: doc.id, ...doc.data() });
        });
        
        displayReviews(reviews);
        
    } catch (error) {
        console.error('Error loading reviews:', error);
        document.getElementById('reviews-content').innerHTML = `
            <div class="error-message">
                <h3>⚠️ Unable to load reviews</h3>
                <p>Please try again later.</p>
            </div>
        `;
        document.getElementById('reviews-content').classList.remove('hidden');
    }
    
    document.getElementById('reviews-loading').classList.add('hidden');
}

/**
 * Display reviews
 */
function displayReviews(reviews) {
    const reviewsList = document.getElementById('reviews-list');
    if (!reviewsList) return;
    
    if (reviews.length === 0) {
        reviewsList.innerHTML = '<p>No reviews yet. Be the first to review this player!</p>';
    } else {
        const avgRating = reviews.reduce((sum, review) => sum + review.overallRating, 0) / reviews.length;
        
        const reviewsHTML = reviews.map(review => {
            const stars = '⭐'.repeat(review.overallRating);
            const date = new Date(review.timestamp.toDate ? review.timestamp.toDate() : review.timestamp);
            
            return `
                <div class="review-item">
                    <div class="review-header">
                        <span class="review-rating">${stars}</span>
                        <span class="reviewer-name">${review.reviewerName}</span>
                        <span class="review-date">${date.toLocaleDateString()}</span>
                    </div>
                    ${review.comment ? `<p class="review-comment">${review.comment}</p>` : ''}
                </div>
            `;
        }).join('');
        
        reviewsList.innerHTML = `
            <div class="reviews-summary">
                <h3>Average Rating: ${avgRating.toFixed(1)}/5 (${reviews.length} reviews)</h3>
            </div>
            ${reviewsHTML}
        `;
    }
    
    document.getElementById('reviews-content').classList.remove('hidden');
}

/**
 * Close player reviews modal
 */
export function closePlayerReviews() {
    const modal = document.getElementById('player-reviews-modal');
    if (modal) {
        modal.remove();
    }
}

/**
 * Load user reviews
 */
export async function loadReviews() {
    const resultsContainer = document.getElementById('my-reviews-results');
    if (!resultsContainer) return;
    
    if (!globalThis.currentUser) {
        resultsContainer.innerHTML = '<p>Please sign in to view your reviews.</p>';
        return;
    }
    
    try {
        const reviewsQuery = query(
            collection(db, 'ratings'),
            where('reviewerId', '==', globalThis.currentUser.uid),
            orderBy('timestamp', 'desc'),
            limit(20)
        );
        
        const querySnapshot = await getDocs(reviewsQuery);
        const reviews = [];
        
        querySnapshot.forEach((doc) => {
            reviews.push({ id: doc.id, ...doc.data() });
        });
        
        if (reviews.length === 0) {
            resultsContainer.innerHTML = '<p>You haven\'t submitted any reviews yet.</p>';
        } else {
            const reviewsHTML = reviews.map(review => {
                const stars = '⭐'.repeat(review.overallRating);
                const date = new Date(review.timestamp.toDate ? review.timestamp.toDate() : review.timestamp);
                
                return `
                    <div class="user-review-item">
                        <h4>${review.playerName} ${stars}</h4>
                        <p>${date.toLocaleDateString()}</p>
                        ${review.comment ? `<p>"${review.comment}"</p>` : ''}
                    </div>
                `;
            }).join('');
            
            resultsContainer.innerHTML = `
                <h3>Your Reviews (${reviews.length})</h3>
                ${reviewsHTML}
            `;
        }
        
    } catch (error) {
        console.error('Error loading user reviews:', error);
        resultsContainer.innerHTML = '<p>Error loading reviews.</p>';
    }
}

// Export functions to global scope for compatibility
globalThis.viewPlayerReviews = viewPlayerReviews;
globalThis.closePlayerReviews = closePlayerReviews;
globalThis.loadReviews = loadReviews; 