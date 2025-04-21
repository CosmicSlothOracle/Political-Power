import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Check if code is running in browser
const isClient = typeof window !== 'undefined';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests
api.interceptors.request.use(
    (config) => {
        if (isClient) {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers['x-auth-token'] = token;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Authentication services
export const authService = {
    register: async (userData) => {
        // For development only - return mock data
        if (!isClient || process.env.NODE_ENV === 'development') {
            return {
                token: 'mock-token-123',
                user: { id: 'user1', username: 'Player 1' }
            };
        }

        const response = await api.post('/auth/register', userData);
        return response.data;
    },

    login: async (credentials) => {
        // For development only - return mock data
        if (!isClient || process.env.NODE_ENV === 'development') {
            const mockData = {
                token: 'mock-token-123',
                user: { id: 'user1', username: 'Player 1' }
            };

            if (isClient) {
                localStorage.setItem('token', mockData.token);
                localStorage.setItem('user', JSON.stringify(mockData.user));
            }

            return mockData;
        }

        const response = await api.post('/auth/login', credentials);
        if (response.data.token && isClient) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    logout: () => {
        if (isClient) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    },

    getProfile: async () => {
        // For development only - return mock data
        if (!isClient || process.env.NODE_ENV === 'development') {
            return {
                user: { id: 'user1', username: 'Player 1' }
            };
        }

        const response = await api.get('/auth/profile');
        return response.data;
    }
};

// Card services
export const cardService = {
    getAllCards: async () => {
        const response = await api.get('/cards');
        return response.data;
    },

    getCardById: async (id) => {
        const response = await api.get(`/cards/${ id }`);
        return response.data;
    },

    getCardsByType: async (type) => {
        const response = await api.get(`/cards/type/${ type }`);
        return response.data;
    },

    seedCards: async () => {
        const response = await api.post('/cards/seed');
        return response.data;
    }
};

// Deck services
export const deckService = {
    getUserDecks: async () => {
        const response = await api.get('/decks');
        return response.data;
    },

    getDeckById: async (id) => {
        const response = await api.get(`/decks/${ id }`);
        return response.data;
    },

    createDeck: async (deckData) => {
        const response = await api.post('/decks', deckData);
        return response.data;
    },

    updateDeck: async (id, deckData) => {
        const response = await api.put(`/decks/${ id }`, deckData);
        return response.data;
    },

    deleteDeck: async (id) => {
        const response = await api.delete(`/decks/${ id }`);
        return response.data;
    }
};

// Game services
export const gameService = {
    getUserGames: async () => {
        const response = await api.get('/games');
        return response.data;
    },

    getGameById: async (id) => {
        const response = await api.get(`/games/${ id }`);
        return response.data;
    },

    createGame: async (gameData) => {
        const response = await api.post('/games', gameData);
        return response.data;
    },

    joinGame: async (joinData) => {
        const response = await api.post('/games/join', joinData);
        return response.data;
    },

    leaveGame: async (gameId) => {
        const response = await api.post(`/games/leave/${ gameId }`);
        return response.data;
    }
};

export default {
    auth: authService,
    cards: cardService,
    decks: deckService,
    games: gameService
};