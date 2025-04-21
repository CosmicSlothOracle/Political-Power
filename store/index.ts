/**
 * store/index.ts
 * Main Redux store configuration with middleware
 */

import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import gameReducer from './reducers/gameReducer';
import socketMiddleware from './middleware/socketMiddleware';

// Root reducer
const rootReducer = combineReducers({
    gameState: gameReducer,
    // Add other reducers here as needed
});

// Configure the store
const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false, // Disable serializable check for complex objects
        }).concat(socketMiddleware),
});

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;