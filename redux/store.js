import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import cardReducer from './cardSlice';
import deckReducer from './deckSlice';
import gameReducer from './gameSlice';

const store = configureStore({
    reducer: {
        auth: authReducer,
        cards: cardReducer,
        decks: deckReducer,
        games: gameReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore non-serializable values for these action types
                ignoredActions: ['games/setCurrentGame', 'games/updateGameState'],
                // Ignore specified paths in the state
                ignoredPaths: ['games.currentGame']
            }
        })
});

export default store;