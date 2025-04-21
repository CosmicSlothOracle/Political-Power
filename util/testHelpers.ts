/**
 * testHelpers.ts
 * Utility functions to help with testing and development
 */

/**
 * Creates a test user with a unique ID
 * The ID will be saved to localStorage for persistence across page reloads
 * @returns {string} The user ID
 */
export function getTestUserId(): string {
    // Check if a test user ID already exists in localStorage
    if (typeof window !== 'undefined') {
        try {
            const savedUserId = localStorage.getItem('testUserId');
            if (savedUserId && savedUserId.trim() !== '') {
                console.log('Using existing test user ID:', savedUserId);
                return savedUserId;
            }
        } catch (error) {
            console.error('Error accessing localStorage:', error);
        }
    }

    // Generate a new user ID if one doesn't exist
    const newUserId = `user-${ Date.now() }-${ Math.floor(Math.random() * 1000) }`;

    // Save to localStorage for persistence
    if (typeof window !== 'undefined') {
        try {
            localStorage.setItem('testUserId', newUserId);
            console.log('Created new test user ID:', newUserId);
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }

    return newUserId;
}

/**
 * Validates that the test user ID exists and returns it
 * If no user ID exists, it will create a new one
 * @returns {string} The user ID if it exists, otherwise a new user ID
 */
export function validateTestUser(): string {
    if (typeof window === 'undefined') {
        return 'user-server-side';
    }

    try {
        const userId = localStorage.getItem('testUserId');
        if (!userId || userId.trim() === '') {
            const newId = getTestUserId();
            console.log('No valid user ID found, created new one:', newId);
            return newId;
        }

        console.log('Validated existing user ID:', userId);
        return userId;
    } catch (error) {
        console.error('Error validating user ID:', error);
        return getTestUserId();
    }
}

/**
 * Clears the test user ID from localStorage
 */
export function clearTestUser(): void {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('testUserId');
        console.log('Test user ID cleared');
    }
}