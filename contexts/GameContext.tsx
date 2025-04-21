import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import gameService from '../services/gameService';
import { GameState, Card, Player, GameActionType } from '../types/gameTypes';

// Define the context interface
interface GameContextType {
    game: GameState | null;
    loading: boolean;
    error: string | null;
    createGame: (options: {
        name: string;
        maxPlayers: number;
        maxRounds: number;
        deckId: string;
    }) => Promise<GameState>;
    joinGame: (gameId: string, deckId: string) => Promise<GameState>;
    leaveGame: () => Promise<boolean>;
    startGame: () => Promise<boolean>;
    playCard: (cardId: string) => Promise<boolean>;
    performAction: (actionType: GameActionType, actionPayload: any) => Promise<boolean>;
    isHost: () => boolean;
    currentPlayer: Player | null;
}

// Create the context with default values
const GameContext = createContext<GameContextType>({
    game: null,
    loading: false,
    error: null,
    createGame: async () => { throw new Error('GameContext not initialized'); },
    joinGame: async () => { throw new Error('GameContext not initialized'); },
    leaveGame: async () => { throw new Error('GameContext not initialized'); },
    startGame: async () => { throw new Error('GameContext not initialized'); },
    playCard: async () => { throw new Error('GameContext not initialized'); },
    performAction: async () => { throw new Error('GameContext not initialized'); },
    isHost: () => false,
    currentPlayer: null,
});

// Provider component
export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [game, setGame] = useState<GameState | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);

    // Update current player when game changes
    useEffect(() => {
        if (game && game.players) {
            // Get current user ID - this would come from your auth system
            const userId = localStorage.getItem('userId');

            if (userId) {
                const player = game.players.find(p => p.userId === userId) || null;
                setCurrentPlayer(player);
            }
        } else {
            setCurrentPlayer(null);
        }
    }, [game]);

    // Set up game state listener
    useEffect(() => {
        const unsubscribe = gameService.onGameStateChanged((gameState) => {
            setGame(gameState);
            setError(null);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    // Clean up when component unmounts
    useEffect(() => {
        return () => {
            gameService.destroy();
        };
    }, []);

    const createGame = useCallback(async (options: {
        name: string;
        maxPlayers: number;
        maxRounds: number;
        deckId: string;
    }): Promise<GameState> => {
        setLoading(true);
        setError(null);

        try {
            const result = await gameService.createGame(options);
            setLoading(false);
            return result;
        } catch (err) {
            setLoading(false);
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMessage);
            throw err;
        }
    }, []);

    const joinGame = useCallback(async (gameId: string, deckId: string): Promise<GameState> => {
        setLoading(true);
        setError(null);

        try {
            const result = await gameService.joinGame(gameId, deckId);
            setLoading(false);
            return result;
        } catch (err) {
            setLoading(false);
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMessage);
            throw err;
        }
    }, []);

    const leaveGame = useCallback(async (): Promise<boolean> => {
        setLoading(true);
        setError(null);

        try {
            const result = await gameService.leaveGame();
            setLoading(false);
            return result;
        } catch (err) {
            setLoading(false);
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMessage);
            throw err;
        }
    }, []);

    const startGame = useCallback(async (): Promise<boolean> => {
        setLoading(true);
        setError(null);

        try {
            const result = await gameService.startGame();
            setLoading(false);
            return result;
        } catch (err) {
            setLoading(false);
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMessage);
            throw err;
        }
    }, []);

    const playCard = useCallback(async (cardId: string): Promise<boolean> => {
        setLoading(true);
        setError(null);

        try {
            const result = await gameService.playCard(cardId);
            setLoading(false);
            return result;
        } catch (err) {
            setLoading(false);
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMessage);
            throw err;
        }
    }, []);

    const performAction = useCallback(async (
        actionType: GameActionType,
        actionPayload: any
    ): Promise<boolean> => {
        setLoading(true);
        setError(null);

        try {
            const result = await gameService.performAction(actionType, actionPayload);
            setLoading(false);
            return result;
        } catch (err) {
            setLoading(false);
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMessage);
            throw err;
        }
    }, []);

    const isHost = useCallback((): boolean => {
        return gameService.isHost();
    }, []);

    return (
        <GameContext.Provider
            value={{
                game,
                loading,
                error,
                createGame,
                joinGame,
                leaveGame,
                startGame,
                playCard,
                performAction,
                isHost,
                currentPlayer,
            }}
        >
            {children}
        </GameContext.Provider>
    );
};

// Custom hook to use the game context
export const useGame = () => useContext(GameContext);

export default GameContext;