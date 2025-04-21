/**
 * gameReducer.ts
 * Redux reducer for game state
 */

import { GameState, Message } from '../../types/gameTypes';
import {
    SET_GAME_STATE,
    SET_LOADING,
    SET_ERROR,
    ADD_MESSAGE,
    UPDATE_PLAYER_STATUS,
    CLEAR_GAME_STATE
} from '../actions/gameActions';

// Define the initial state
export interface GameReducerState {
    gameState: GameState | null;
    isLoading: boolean;
    error: string | null;
    gameMessages: Message[];
}

const initialGameState: GameState = {
    gameId: '',
    status: 'lobby',
    phase: 'drawing',
    players: [],
    hostId: '',
    round: 0,
    momentumLevel: 3, // Start at neutral momentum
    activePlayerId: null,
    mandateThreshold: 8,
    maxPlayers: 2,
    maxRounds: 10,
    created: new Date().toISOString(),
    log: [],
    coalitions: [],
    centerCards: []
};

const initialState: GameReducerState = {
    gameState: null,
    isLoading: false,
    error: null,
    gameMessages: []
};

// The reducer
const gameReducer = (state = initialState, action: any): GameReducerState => {
    switch (action.type) {
        case SET_GAME_STATE:
            return {
                ...state,
                gameState: action.payload,
                error: null // Clear any errors when we successfully update game state
            };

        case SET_LOADING:
            return {
                ...state,
                isLoading: action.payload
            };

        case SET_ERROR:
            return {
                ...state,
                error: action.payload
            };

        case ADD_MESSAGE:
            // Avoid duplicate messages
            const existingMessageIndex = state.gameMessages.findIndex(
                msg =>
                    msg.text === action.payload.text &&
                    msg.timestamp === action.payload.timestamp
            );

            if (existingMessageIndex !== -1) {
                return state;
            }

            return {
                ...state,
                gameMessages: [...state.gameMessages, action.payload]
            };

        case UPDATE_PLAYER_STATUS:
            if (!state.gameState) {
                return state;
            }

            const { playerId, status } = action.payload;

            return {
                ...state,
                gameState: {
                    ...state.gameState,
                    players: state.gameState.players.map(player =>
                        player.userId === playerId
                            ? { ...player, isReady: status === 'ready' }
                            : player
                    )
                }
            };

        case CLEAR_GAME_STATE:
            return {
                ...initialState
            };

        default:
            return state;
    }
};

export default gameReducer;