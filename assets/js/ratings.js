/**
 * Ratings Module
 * Handles player rating forms, submissions, and rating display
 */

import { db } from './firebase-config.js';
import { collection, addDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Rating variables
let selectedRating = 0;
let currentFilter = 'all';

// Category ratings
const categoryRatings = {
    teamwork: 0,
    communication: 0,
    skill: 0,
    attitude: 0
};

/**
 * Show rating form for a player
 */
export function showRatingForm(playerId, playerName) {
    console.log('Showing rating form for:', playerName, playerId);
    
    // Reset form state
    selectedRating = 0;
    Object.keys(categoryRatings).forEach(key => categoryRatings[key] = 0);
    
    const modalHTML = `
        <div id="rating-modal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>⭐ Rate Player: ${playerName}</h2>
                    <button class="close-btn" onclick="closeRatingModal()">&times;</button>
                </div>
                
                <div class="modal-body">
                    <!-- Overall Rating -->
                    <div class="rating-section">
                        <h3>Overall Rating</h3>
                        <div class="star-rating" id="overall-rating">
                            ${[1,2,3,4,5].map(i => `
                                <span class="star" data-rating="${i}" onclick="setRating(${i})">⭐</span>
                            `).join('')}
                        </div>
                        <p class="rating-description" id="rating-description">Click stars to rate</p>
                    </div>
                    
                    <!-- Category Ratings -->
                    <div class="rating-section">
                        <h3>Category Ratings</h3>
                        
                        <div class="category-rating">
                            <label>🤝 Teamwork</label>
                            <div class="star-rating" id="teamwork-rating">
                                ${[1,2,3,4,5].map(i => `
                                    <span class="star" data-rating="${i}" onclick="setCategoryRating('teamwork', ${i})">⭐</span>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="category-rating">
                            <label>💬 Communication</label>
                            <div class="star-rating" id="communication-rating">
                                ${[1,2,3,4,5].map(i => `
                                    <span class="star" data-rating="${i}" onclick="setCategoryRating('communication', ${i})">⭐</span>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="category-rating">
                            <label>🎯 Skill</label>
                            <div class="star-rating" id="skill-rating">
                                ${[1,2,3,4,5].map(i => `
                                    <span class="star" data-rating="${i}" onclick="setCategoryRating('skill', ${i})">⭐</span>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="category-rating">
                            <label>😊 Attitude</label>
                            <div class="star-rating" id="attitude-rating">
                                ${[1,2,3,4,5].map(i => `
                                    <span class="star" data-rating="${i}" onclick="setCategoryRating('attitude', ${i})">⭐</span>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    
                    <!-- Comment -->
                    <div class="rating-section">
                        <h3>Comment (Optional)</h3>
                        <textarea id="rating-comment" class="form-input" 
                                placeholder="Share your experience playing with this player..."
                                maxlength="500"></textarea>
                        <div class="character-count">
                            <span id="comment-count">0</span>/500 characters
                        </div>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeRatingModal()">Cancel</button>
                    <button class="btn" onclick="submitRating('${playerId}', '${playerName.replace(/'/g, "\\'")}')">
                        <span id="submit-loading" class="hidden">
                            <span class="loading-spinner"></span>
                        </span>
                        <span id="submit-text">Submit Rating</span>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Setup comment counter
    const commentField = document.getElementById('rating-comment');
    const commentCount = document.getElementById('comment-count');
    
    if (commentField && commentCount) {
        commentField.addEventListener('input', function() {
            commentCount.textContent = this.value.length;
        });
    }
}

/**
 * Close rating modal
 */
export function closeRatingModal() {
    const modal = document.getElementById('rating-modal');
    if (modal) {
        modal.remove();
    }
}

/**
 * Set overall rating
 */
export function setRating(rating) {
    selectedRating = rating;
    updateStarDisplay('overall-rating', rating);
    
    const descriptions = {
        1: '⭐ Poor - Negative experience',
        2: '⭐⭐ Below Average - Some issues',
        3: '⭐⭐⭐ Average - Decent teammate',
        4: '⭐⭐⭐⭐ Good - Positive experience',
        5: '⭐⭐⭐⭐⭐ Excellent - Great teammate!'
    };
    
    const descElement = document.getElementById('rating-description');
    if (descElement) {
        descElement.textContent = descriptions[rating] || 'Click stars to rate';
    }
}

/**
 * Set category rating
 */
export function setCategoryRating(category, rating) {
    categoryRatings[category] = rating;
    updateStarDisplay(`${category}-rating`, rating);
}

/**
 * Update star display
 */
function updateStarDisplay(containerId, rating) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const stars = container.querySelectorAll('.star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

/**
 * Submit rating
 */
export async function submitRating(playerId, playerName) {
    console.log('Submitting rating for:', playerName, playerId);
    
    // Validate required fields
    if (selectedRating === 0) {
        if (typeof showToast === 'function') {
            showToast('Please select an overall rating!', 'error');
        }
        return;
    }
    
    // Ensure user is authenticated
    if (!globalThis.currentUser) {
        if (typeof showToast === 'function') {
            showToast('Please sign in to submit ratings!', 'error');
        }
        return;
    }
    
    // Show loading state
    if (typeof setLoadingState === 'function') {
        setLoadingState('submit', true);
    }
    
    try {
        // Get form values
        const comment = document.getElementById('rating-comment')?.value.trim() || '';
        
        // Calculate average category rating
        const categoryValues = Object.values(categoryRatings).filter(r => r > 0);
        const avgCategoryRating = categoryValues.length > 0 
            ? categoryValues.reduce((a, b) => a + b, 0) / categoryValues.length 
            : 0;
        
        // Prepare rating data
        const ratingData = {
            playerId: playerId,
            playerName: playerName,
            reviewerId: globalThis.currentUser.uid,
            reviewerEmail: globalThis.currentUser.email,
            reviewerName: globalThis.currentUser.displayName || globalThis.currentUser.email,
            overallRating: selectedRating,
            categoryRatings: { ...categoryRatings },
            avgCategoryRating: avgCategoryRating,
            comment: comment,
            timestamp: new Date(),
            createdAt: new Date().toISOString(),
            reportCount: 0,
            isReported: false
        };
        
        console.log('Rating data:', ratingData);
        
        // Submit to Firestore
        await addDoc(collection(db, 'ratings'), ratingData);
        
        console.log('✅ Rating submitted successfully');
        
        if (typeof showToast === 'function') {
            showToast('Rating submitted successfully! 🎉', 'success');
        }
        
        // Close modal
        closeRatingModal();
        
    } catch (error) {
        console.error('❌ Rating submission failed:', error);
        
        if (typeof showToast === 'function') {
            showToast('Failed to submit rating. Please try again.', 'error');
        }
    } finally {
        if (typeof setLoadingState === 'function') {
            setLoadingState('submit', false);
        }
    }
}

/**
 * Filter reviews by rating
 */
export function filterReviews(rating) {
    currentFilter = rating;
    console.log('Filtering reviews by:', rating);
    
    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeBtn = document.querySelector(`[onclick="filterReviews('${rating}')"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    // Apply filter to visible reviews
    const reviewItems = document.querySelectorAll('.review-item');
    reviewItems.forEach(item => {
        const reviewRating = parseInt(item.dataset.rating);
        
        if (rating === 'all' || reviewRating === parseInt(rating)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// Export functions to global scope for compatibility
globalThis.showRatingForm = showRatingForm;
globalThis.closeRatingModal = closeRatingModal;
globalThis.setRating = setRating;
globalThis.setCategoryRating = setCategoryRating;
globalThis.submitRating = submitRating;
globalThis.filterReviews = filterReviews; 