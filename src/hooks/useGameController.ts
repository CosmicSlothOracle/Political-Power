/**
 * useGameController.ts
 * React hook for managing game flow and state transitions using GameControllerService
 */

import { useState, useEffect, useCallback } from 'react';
import { GameControllerService } from '../services/GameControllerService';
import { GameState, GamePhase, GameStatus, Player, GameSettings, DEFAULT_GAME_SETTINGS } from '../types/gameTypes';
import { GameActionService } from '../services/GameActionService';
import socketService from '../services/socketService';
import toast from '../components/ToastProvider';
import cardService from '../services/CardService';

/**
 * Hook that provides access to game controller functions and state
 */
export function useGameController(userId: string = '') {
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [gamePhase, setGamePhase] = useState<GamePhase>('setup');
    const [gameStatus, setGameStatus] = useState<GameStatus>('lobby');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [settings, setSettings] = useState<GameSettings>(DEFAULT_GAME_SETTINGS);
    const [isInitialized, setIsInitialized] = useState<boolean>(false);

    // Handler for game state updates from the GameActionService
    const handleGameStateUpdate = useCallback((updatedGameState: GameState) => {
        console.log('[useGameController] Game state updated:', updatedGameState);
        setGameState(updatedGameState);
        setGamePhase(updatedGameState.phase);
        setGameStatus(updatedGameState.status);
    }, []);

    // Initialize services
    useEffect(() => {
        const initializeServices = async () => {
            try {
                setIsLoading(true);

                // First, ensure socket service is connected
                const socketConnected = await socketService.connect();
                if (!socketConnected) {
                    console.warn('Failed to connect to socket service. Some features may be limited.');
                } else {
                    console.log('Socket service connected successfully');
                }

                // Initialize other services
                const cardServiceInitialized = await cardService.initialize();
                if (!cardServiceInitialized) {
                    console.warn('Failed to initialize card service. Some features may be limited.');
                }

                // Get controller service instance
                const controller = GameControllerService.getInstance();

                // Initialize game action service
                const gameActionService = GameActionService.getInstance();
                await gameActionService.initialize();

                // Add listeners for game state changes
                gameActionService.addGameStateListener(handleGameStateUpdate);

                // Add phase and status change listeners
                controller.addPhaseChangeListener(setGamePhase);
                controller.addStatusChangeListener(setGameStatus);

                // Clean up socket connection issues listener
                const handleSocketError = (errorMsg: string) => {
                    console.error('Socket error:', errorMsg);
                    setError(`Connection error: ${ errorMsg }`);
                };

                socketService.on('error', handleSocketError);

                setIsInitialized(true);
                setIsLoading(false);

                // Clean up function
                return () => {
                    controller.removePhaseChangeListener(setGamePhase);
                    controller.removeStatusChangeListener(setGameStatus);
                    gameActionService.removeGameStateListener(handleGameStateUpdate);
                    socketService.off('error', handleSocketError);
                };
            } catch (err) {
                console.error('Failed to initialize game controller:', err);
                setError('Failed to initialize game services. Please try again.');
                setIsLoading(false);
            }
        };

        initializeServices();
    }, [userId, handleGameStateUpdate]);

    // Handle phase changes
    const handlePhaseChange = useCallback((phase: GamePhase) => {
        console.log(`[GameController] Game phase changed to ${ phase }`);
        setGamePhase(phase);

        // We could add specific logic based on phase changes here
        if (phase === 'finished') {
            toast.info('Game has concluded!');
        }
    }, []);

    // Listen for game phase changes
    useEffect(() => {
        if (!isInitialized) return;

        const controller = GameControllerService.getInstance();
        controller.addPhaseChangeListener(handlePhaseChange);

        return () => {
            controller.removePhaseChangeListener(handlePhaseChange);
        };
    }, [isInitialized, handlePhaseChange]);

    // Handle status changes
    const handleStatusChange = useCallback((status: GameStatus) => {
        console.log(`[GameController] Game status changed to ${ status }`);
        setGameStatus(status);

        // We could add specific logic based on status changes here
        if (status === 'active') {
            toast.success('Game has started!');
        }
    }, []);

    // Listen for game status changes
    useEffect(() => {
        if (!isInitialized) return;

        const controller = GameControllerService.getInstance();
        controller.addStatusChangeListener(handleStatusChange);

        return () => {
            controller.removeStatusChangeListener(handleStatusChange);
        };
    }, [isInitialized, handleStatusChange]);

    // Create a new game
    const createGame = useCallback(async (
        gameName: string,
        playerName: string,
        gameSettings: GameSettings
    ): Promise<GameState> => {
        if (!userId) {
            throw new Error('User ID not provided');
        }

        try {
            setIsLoading(true);
            setError(null);

            // Create a host player object
            const hostPlayer: Player = {
                id: userId,
                name: playerName,
                deckId: 'default-deck',
                hand: [],
                played: [],
                influence: 0,
                isReady: true,
                isConnected: true,
                coalition: null,
                lastRoll: null,
                deck: {
                    id: 'default-deck',
                    name: 'Default Deck',
                    cards: [],
                    drawPile: [],
                    discardPile: []
                },
                influenceModifier: 0,
                protectedMandates: false,
                canPlaySpecial: true,
                discardNext: false
            };

            // Update controller settings
            const controller = GameControllerService.getInstance();
            controller.updateGameSettings(gameSettings);

            // Create the game
            console.log(`[GameController] Creating game "${ gameName }" with player "${ playerName }"`);
            const newGameState = await controller.createNewGame(gameName, hostPlayer, gameSettings);

            setGameState(newGameState);
            return newGameState;
        } catch (err: any) {
            console.error("[GameController] Error creating game:", err);
            setError(`Failed to create game: ${ err.message }`);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    // Join an existing game
    const joinGame = useCallback(async (
        gameId: string,
        playerName: string
    ): Promise<GameState> => {
        if (!userId) {
            throw new Error('User ID not provided');
        }

        try {
            setIsLoading(true);
            setError(null);

            // Create a player object
            const player: Player = {
                id: userId,
                name: playerName,
                deckId: 'default-deck',
                hand: [],
                played: [],
                influence: 0,
                isReady: false,
                isConnected: true,
                coalition: null,
                lastRoll: null,
                deck: {
                    id: 'default-deck',
                    name: 'Default Deck',
                    cards: [],
                    drawPile: [],
                    discardPile: []
                },
                influenceModifier: 0,
                protectedMandates: false,
                canPlaySpecial: true,
                discardNext: false
            };

            // Join the game
            console.log(`[GameController] Joining game "${ gameId }" with player "${ playerName }"`);
            const controller = GameControllerService.getInstance();
            const updatedGameState = await controller.joinGame(gameId, player);

            setGameState(updatedGameState);
            return updatedGameState;
        } catch (err: any) {
            console.error("[GameController] Error joining game:", err);
            setError(`Failed to join game: ${ err.message }`);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    // Start the game
    const startGame = useCallback(async (): Promise<GameState | null> => {
        try {
            setIsLoading(true);
            setError(null);

            const controller = GameControllerService.getInstance();
            const updatedGameState = await controller.startGame();

            if (updatedGameState) {
                console.log("[GameController] Game started:", updatedGameState);
                setGameState(updatedGameState);
                return updatedGameState;
            } else {
                setError('Failed to start game');
                return null;
            }
        } catch (err: any) {
            console.error("[GameController] Error starting game:", err);
            setError(`Failed to start game: ${ err.message }`);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Leave the game
    const leaveGame = useCallback(async (): Promise<boolean> => {
        try {
            setIsLoading(true);
            setError(null);

            const controller = GameControllerService.getInstance();
            const success = await controller.leaveGame();

            if (success) {
                setGameState(null);
            }

            return success;
        } catch (err: any) {
            console.error("[GameController] Error leaving game:", err);
            setError(`Failed to leave game: ${ err.message }`);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Update game settings
    const updateSettings = useCallback((newSettings: Partial<GameSettings>): void => {
        setSettings(prev => ({ ...prev, ...newSettings }));

        const controller = GameControllerService.getInstance();
        controller.updateGameSettings(newSettings);
    }, []);

    // Play a card
    const playCard = useCallback(async (cardId: string): Promise<boolean> => {
        try {
            setIsLoading(true);
            setError(null);

            const controller = GameControllerService.getInstance();
            const updatedGameState = await controller.playCard(cardId);

            if (updatedGameState) {
                setGameState(updatedGameState);
                return true;
            } else {
                setError('Failed to play card');
                return false;
            }
        } catch (err: any) {
            console.error("[GameController] Error playing card:", err);
            setError(`Failed to play card: ${ err.message }`);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Draw a card
    const drawCard = useCallback(async (): Promise<boolean> => {
        try {
            setIsLoading(true);
            setError(null);

            const controller = GameControllerService.getInstance();
            const updatedGameState = await controller.drawCard();

            if (updatedGameState) {
                setGameState(updatedGameState);
                return true;
            } else {
                setError('Failed to draw card');
                return false;
            }
        } catch (err: any) {
            console.error("[GameController] Error drawing card:", err);
            setError(`Failed to draw card: ${ err.message }`);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // End the turn
    const endTurn = useCallback(async (): Promise<boolean> => {
        try {
            setIsLoading(true);
            setError(null);

            const controller = GameControllerService.getInstance();
            const updatedGameState = await controller.endTurn();

            if (updatedGameState) {
                setGameState(updatedGameState);
                return true;
            } else {
                setError('Failed to end turn');
                return false;
            }
        } catch (err: any) {
            console.error("[GameController] Error ending turn:", err);
            setError(`Failed to end turn: ${ err.message }`);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Rename updateSettings to updateGameSettings for consistency with client.tsx
    const updateGameSettings = updateSettings;

    // Global cleanup effect that runs on unmount
    useEffect(() => {
        return () => {
            console.log('[useGameController] Cleaning up all listeners and services');
            const gameActionService = GameActionService.getInstance();
            const gameControllerService = GameControllerService.getInstance();

            // Remove all listeners
            gameActionService.removeGameStateListener(handleGameStateUpdate);
            gameControllerService.removePhaseChangeListener(handlePhaseChange);
            gameControllerService.removeStatusChangeListener(handleStatusChange);

            // Reset state
            setIsInitialized(false);
            setGameState(null);
        };
    }, [handleGameStateUpdate, handlePhaseChange, handleStatusChange]);

    return {
        gameState,
        gamePhase,
        gameStatus,
        isLoading,
        error,
        settings,
        isInitialized,
        createGame,
        joinGame,
        startGame,
        leaveGame,
        updateSettings,
        setGameState,
        playCard,
        drawCard,
        endTurn,
        updateGameSettings
    };
}