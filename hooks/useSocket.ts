/**
 * useSocket.ts
 * Custom hook for socket functionality
 */

import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    connectSocket,
    disconnectSocket,
    joinGame,
    leaveGame,
    startGame,
    playCard,
    revealCard,
    rollDice,
    proposeCoalition,
    acceptCoalition,
    declineCoalition,
    sendMessage,
    toggleReady
} from '../store/actions/gameActions';
import { RootState } from '../redux/store';

const useSocket = (gameId?: string) => {
    const dispatch = useDispatch();
    const { gameState, isLoading, error, gameMessages } = useSelector((state: RootState) => state.gameState);

    // Connect to socket
    const connect = useCallback((token: string, useMock = false) => {
        dispatch(connectSocket(token, useMock));
    }, [dispatch]);

    // Disconnect from socket
    const disconnect = useCallback(() => {
        dispatch(disconnectSocket());
    }, [dispatch]);

    // Join a game
    const join = useCallback((id: string) => {
        dispatch(joinGame(id));
    }, [dispatch]);

    // Leave a game
    const leave = useCallback((id: string) => {
        dispatch(leaveGame(id));
    }, [dispatch]);

    // Start a game
    const start = useCallback((id: string) => {
        dispatch(startGame(id));
    }, [dispatch]);

    // Play a card
    const play = useCallback((id: string, cardId: string) => {
        dispatch(playCard(id, cardId));
    }, [dispatch]);

    // Reveal a card
    const reveal = useCallback((id: string) => {
        dispatch(revealCard(id));
    }, [dispatch]);

    // Roll dice
    const roll = useCallback((id: string) => {
        dispatch(rollDice(id));
    }, [dispatch]);

    // Propose coalition
    const propose = useCallback((id: string, targetUserId: string) => {
        dispatch(proposeCoalition(id, targetUserId));
    }, [dispatch]);

    // Accept coalition
    const accept = useCallback((id: string, partnerUserId: string) => {
        dispatch(acceptCoalition(id, partnerUserId));
    }, [dispatch]);

    // Decline coalition
    const decline = useCallback((id: string, partnerUserId: string) => {
        dispatch(declineCoalition(id, partnerUserId));
    }, [dispatch]);

    // Send message
    const message = useCallback((id: string, text: string) => {
        dispatch(sendMessage(id, text));
    }, [dispatch]);

    // Toggle ready state
    const ready = useCallback((id: string) => {
        dispatch(toggleReady(id));
    }, [dispatch]);

    // If gameId is provided, automatically join the game on mount
    useEffect(() => {
        if (gameId) {
            join(gameId);

            // Clean up on unmount
            return () => {
                leave(gameId);
            };
        }
    }, [gameId, join, leave]);

    return {
        // State
        gameState,
        isLoading,
        error,
        gameMessages,

        // Actions
        connect,
        disconnect,
        join,
        leave,
        start,
        play,
        reveal,
        roll,
        propose,
        accept,
        decline,
        message,
        ready
    };
};

export default useSocket;