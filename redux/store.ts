import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import gameReducer from './gameSlice';
import authReducer from './authSlice';
import cardReducer from './cardSlice';
import gameStateReducer from '../store/reducers/gameReducer';
import socketMiddleware from '../store/middleware/socketMiddleware';

const rootReducer = combineReducers({
    game: gameReducer,
    auth: authReducer,
    cards: cardReducer,
    gameState: gameStateReducer
});

const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }).concat(socketMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;