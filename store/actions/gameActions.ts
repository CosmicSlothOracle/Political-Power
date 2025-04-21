/**
 * gameActions.ts
 * Redux actions for game state management
 */

import { GameState, Player, Message } from '../../types/gameTypes';
import {
    SOCKET_CONNECT,
    SOCKET_DISCONNECT,
    SOCKET_JOIN_GAME,
    SOCKET_LEAVE_GAME,
    SOCKET_START_GAME,
    SOCKET_PLAY_CARD,
    SOCKET_REVEAL_CARD,
    SOCKET_ROLL_DICE,
    SOCKET_PROPOSE_COALITION,
    SOCKET_ACCEPT_COALITION,
    SOCKET_DECLINE_COALITION,
    SOCKET_SEND_MESSAGE,
    SOCKET_TOGGLE_READY
} from '../middleware/socketMiddleware';

// Action Types
export const SET_GAME_STATE = 'game/setGameState';
export const SET_LOADING = 'game/setLoading';
export const SET_ERROR = 'game/setError';
export const ADD_MESSAGE = 'game/addMessage';
export const UPDATE_PLAYER_STATUS = 'game/updatePlayerStatus';
export const CLEAR_GAME_STATE = 'game/clearGameState';

// Regular Action Creators
export const setGameState = (gameState: GameState) => ({
    type: SET_GAME_STATE,
    payload: gameState
});

export const setLoading = (isLoading: boolean) => ({
    type: SET_LOADING,
    payload: isLoading
});

export const setError = (error: string | null) => ({
    type: SET_ERROR,
    payload: error
});

export const addMessage = (message: Message) => ({
    type: ADD_MESSAGE,
    payload: message
});

export const updatePlayerStatus = (playerId: string, status: string) => ({
    type: UPDATE_PLAYER_STATUS,
    payload: { playerId, status }
});

export const clearGameState = () => ({
    type: CLEAR_GAME_STATE
});

// Socket Action Creators
export const connectSocket = (token: string, useMock: boolean = false) => ({
    type: SOCKET_CONNECT,
    payload: { token, useMock }
});

export const disconnectSocket = () => ({
    type: SOCKET_DISCONNECT
});

export const joinGame = (gameId: string) => ({
    type: SOCKET_JOIN_GAME,
    payload: { gameId }
});

export const leaveGame = (gameId: string) => ({
    type: SOCKET_LEAVE_GAME,
    payload: { gameId }
});

export const startGame = (gameId: string) => ({
    type: SOCKET_START_GAME,
    payload: { gameId }
});

export const playCard = (gameId: string, cardId: string) => ({
    type: SOCKET_PLAY_CARD,
    payload: { gameId, cardId }
});

export const revealCard = (gameId: string) => ({
    type: SOCKET_REVEAL_CARD,
    payload: { gameId }
});

export const rollDice = (gameId: string) => ({
    type: SOCKET_ROLL_DICE,
    payload: { gameId }
});

export const proposeCoalition = (gameId: string, targetUserId: string) => ({
    type: SOCKET_PROPOSE_COALITION,
    payload: { gameId, targetUserId }
});

export const acceptCoalition = (gameId: string, partnerUserId: string) => ({
    type: SOCKET_ACCEPT_COALITION,
    payload: { gameId, partnerUserId }
});

export const declineCoalition = (gameId: string, partnerUserId: string) => ({
    type: SOCKET_DECLINE_COALITION,
    payload: { gameId, partnerUserId }
});

export const sendMessage = (gameId: string, text: string) => ({
    type: SOCKET_SEND_MESSAGE,
    payload: { gameId, text }
});

export const toggleReady = (gameId: string) => ({
    type: SOCKET_TOGGLE_READY,
    payload: { gameId }
});