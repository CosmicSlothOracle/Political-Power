/**
 * useGameActions.ts
 * Custom hook for integrating the GameActionService into React components
 */

import { useState, useEffect, useCallback } from 'react';
import { GameState, Player } from '../types/gameTypes';
import { GameActionService } from '../services/GameActionService';
import { CardUtils } from '../game/CardUtils';

export const useGameActions = (initialPlayerId?: string) => {
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPlayerId, setCurrentPlayerId] = useState<string | undefined>(initialPlayerId);

    const gameActionService = GameActionService.getInstance();

    // Initialize and set up event listeners
    useEffect(() => {
        gameActionService.initialize();

        // Get initial game state
        const initialState = gameActionService.getCurrentGameState();
        if (initialState) {
            setGameState(initialState);
        }

        // Add listener for game state updates
        const handleGameStateUpdate = (updatedState: GameState) => {
            setGameState(updatedState);
        };

        gameActionService.addGameStateListener(handleGameStateUpdate);

        // Clean up
        return () => {
            gameActionService.removeGameStateListener(handleGameStateUpdate);
        };
    }, []);

    // Set current player ID
    useEffect(() => {
        if (initialPlayerId) {
            setCurrentPlayerId(initialPlayerId);
        }
    }, [initialPlayerId]);

    // Create a new game
    const createGame = useCallback(async (options: {
        name: string;
        maxPlayers: number;
        maxRounds: number;
        mandateThreshold: number;
        players: Player[]
    }) => {
        setIsLoading(true);
        setError(null);

        try {
            const newGameState = await gameActionService.createGame(options);
            setGameState(newGameState);
            return newGameState;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create game';
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [gameActionService]);

    // Join an existing game
    const joinGame = useCallback(async (gameId: string, player: Player) => {
        setIsLoading(true);
        setError(null);

        try {
            const updatedGameState = await gameActionService.joinGame(gameId, player);
            setGameState(updatedGameState);
            setCurrentPlayerId(player.id);
            return updatedGameState;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to join game';
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [gameActionService]);

    // Play a card
    const playCard = useCallback(async (cardId: string) => {
        if (!gameState || !currentPlayerId) {
            setError('No active game or player');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const updatedGameState = await gameActionService.playCard(cardId);
            setGameState(updatedGameState);
            return updatedGameState;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to play card';
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [gameState, currentPlayerId, gameActionService]);

    // Draw a card
    const drawCard = useCallback(async () => {
        if (!gameState || !currentPlayerId) {
            setError('No active game or player');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const updatedGameState = await gameActionService.drawCard();
            setGameState(updatedGameState);
            return updatedGameState;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to draw card';
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [gameState, currentPlayerId, gameActionService]);

    // End the current player's turn
    const endTurn = useCallback(async () => {
        if (!gameState || !currentPlayerId) {
            setError('No active game or player');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const updatedGameState = await gameActionService.endTurn();
            setGameState(updatedGameState);
            return updatedGameState;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to end turn';
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [gameState, currentPlayerId, gameActionService]);

    // Send a chat message
    const sendChatMessage = useCallback(async (message: string) => {
        if (!gameState || !currentPlayerId) {
            setError('No active game or player');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const updatedGameState = await gameActionService.sendChatMessage(message);
            setGameState(updatedGameState);
            return updatedGameState;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [gameState, currentPlayerId, gameActionService]);

    // Leave the current game
    const leaveGame = useCallback(async () => {
        if (!gameState) {
            return true;
        }

        setIsLoading(true);
        setError(null);

        try {
            const success = await gameActionService.leaveGame();
            if (success) {
                setGameState(null);
            }
            return success;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to leave game';
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [gameState, gameActionService]);

    // Get current player
    const getCurrentPlayer = useCallback(() => {
        if (!gameState || !currentPlayerId) return null;
        return gameState.players.find(p => p.id === currentPlayerId) || null;
    }, [gameState, currentPlayerId]);

    // Get cards in the current player's hand
    const getPlayerHand = useCallback(() => {
        const player = getCurrentPlayer();
        if (!player) return [];
        return CardUtils.getPlayerHandCards(player);
    }, [getCurrentPlayer]);

    // Get cards played by the current player
    const getPlayerPlayedCards = useCallback(() => {
        const player = getCurrentPlayer();
        if (!player) return [];
        return CardUtils.getPlayerPlayedCards(player);
    }, [getCurrentPlayer]);

    // Calculate current player's total influence
    const getPlayerInfluence = useCallback(() => {
        const player = getCurrentPlayer();
        if (!player) return 0;
        return CardUtils.calculateTotalInfluence(player);
    }, [getCurrentPlayer]);

    // Check if it's the current player's turn
    const isPlayerTurn = useCallback(() => {
        if (!gameState || !currentPlayerId) return false;
        return gameState.activePlayerId === currentPlayerId;
    }, [gameState, currentPlayerId]);

    return {
        // State
        gameState,
        isLoading,
        error,
        currentPlayerId,

        // Game operations
        createGame,
        joinGame,
        playCard,
        drawCard,
        endTurn,
        sendChatMessage,
        leaveGame,

        // Utility functions
        getCurrentPlayer,
        getPlayerHand,
        getPlayerPlayedCards,
        getPlayerInfluence,
        isPlayerTurn,

        // Manual setters
        setCurrentPlayerId
    };
};