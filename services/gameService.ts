/**
 * gameService.ts
 * Service for managing game state and interactions using the socket connection
 */

import socketService from './socketService';
import { GameState, Card, Player, GameAction, GameActionType } from '../types/gameTypes';
import { allCards, getCardById } from '../data/cards';
import { v4 as uuidv4 } from 'uuid';

class GameService {
    private currentGame: GameState | null = null;
    private gameStateListeners: ((gameState: GameState) => void)[] = [];

    /**
     * Initialize the game service and set up event listeners
     */
    init() {
        // Listen for game updates from the server
        socketService.on('game-updated', this.handleGameUpdated.bind(this));
        return this;
    }

    /**
     * Handle updates to the game state
     */
    private handleGameUpdated(gameState: GameState) {
        console.log('[GameService] Game updated', gameState);
        this.currentGame = gameState;
        this.notifyListeners();
    }

    /**
     * Notify all listeners about the game state change
     */
    private notifyListeners() {
        if (!this.currentGame) return;

        this.gameStateListeners.forEach(listener => {
            listener(this.currentGame!);
        });
    }

    /**
     * Register a listener for game state changes
     */
    onGameStateChanged(callback: (gameState: GameState) => void) {
        this.gameStateListeners.push(callback);

        // If we already have a game state, call the callback immediately
        if (this.currentGame) {
            callback(this.currentGame);
        }

        // Return an unsubscribe function
        return () => {
            this.gameStateListeners = this.gameStateListeners.filter(
                listener => listener !== callback
            );
        };
    }

    /**
     * Create a new game
     */
    createGame(playerNames: string[]): GameState {
        if (playerNames.length < 2 || playerNames.length > 6) {
            throw new Error('Spieleranzahl muss zwischen 2 und 6 liegen');
        }

        const players: Player[] = playerNames.map(name => ({
            id: uuidv4(),
            name,
            deck: [],
            hand: [],
            mandates: 0,
            drawPile: [],
            discardPile: [],
            playedCharacters: [],
            playedSpecials: [],
            playedTraps: [],
            isActive: false
        }));

        // Erste Spieler aktiv setzen
        players[0].isActive = true;

        const gameState: GameState = {
            id: uuidv4(),
            players,
            currentRound: 1,
            phase: GamePhase.SETUP,
            momentum: 3, // Neutraler Startwert
            activePlayerId: players[0].id,
            winner: null,
            coalitions: [],
            log: [{
                timestamp: new Date(),
                message: 'Spiel gestartet',
                type: 'system'
            }],
            startTime: new Date()
        };

        return gameState;
    }

    /**
     * Create a deck for a player under consideration of the budget
     */
    createDeckForPlayer(gameState: GameState, playerId: string, deckCards: string[], budget: number): GameState {
        const player = this.getPlayerById(gameState, playerId);
        if (!player) {
            throw new Error('Spieler nicht gefunden');
        }

        // Karten ins Deck laden
        const deck: Card[] = [];
        let totalValue = 0;
        let charakterCount = 0;
        let specialCount = 0;
        let trapOrBonusCount = 0;

        for (const cardId of deckCards) {
            const card = getCardById(cardId);
            if (!card) {
                throw new Error(`Karte mit ID ${ cardId } nicht gefunden`);
            }

            // Budget prüfen
            totalValue += card.campaignValue;
            if (totalValue > budget) {
                throw new Error('Budget überschritten');
            }

            // Kartentypen zählen
            if (card.type === 'charakterkarte') charakterCount++;
            else if (card.type === 'spezialkarte') specialCount++;
            else if (card.type === 'fallenkarte' || card.type === 'bonuskarte') trapOrBonusCount++;

            deck.push(card);
        }

        // Deckzusammensetzung prüfen
        if (charakterCount !== 10) {
            throw new Error('Das Deck muss genau 10 Charakterkarten enthalten');
        }
        if (specialCount !== 5) {
            throw new Error('Das Deck muss genau 5 Spezialkarten enthalten');
        }
        if (trapOrBonusCount !== 5) {
            throw new Error('Das Deck muss genau 5 Fallen- oder Bonuskarten enthalten');
        }
        if (deck.length !== 20) {
            throw new Error('Das Deck muss genau 20 Karten enthalten');
        }

        // Auf Duplikate prüfen
        const uniqueCardIds = new Set(deckCards);
        if (uniqueCardIds.size !== deckCards.length) {
            throw new Error('Keine doppelten Karten erlaubt');
        }

        // Deck dem Spieler zuweisen
        player.deck = deck;

        return {
            ...gameState,
            players: gameState.players.map(p => p.id === playerId ? player : p),
            log: [
                ...gameState.log,
                {
                    timestamp: new Date(),
                    message: `${ player.name } hat ein Deck erstellt`,
                    type: 'system',
                    playerId
                }
            ]
        };
    }

    /**
     * Start the current game (host only)
     */
    startGame(gameState: GameState): GameState {
        // Prüfen, ob alle Spieler ein Deck haben
        for (const player of gameState.players) {
            if (player.deck.length !== 20) {
                throw new Error(`Spieler ${ player.name } hat kein vollständiges Deck`);
            }
        }

        // Spielstart-Karten austeilen:
        // 2 Charakterkarten + 1 Spezial-/Bonuskarte, dann auf 6 Karten auffüllen
        const updatedPlayers = gameState.players.map(player => {
            // Deck mischen
            const shuffledDeck = [...player.deck].sort(() => 0.5 - Math.random());

            // Karten nach Typ sortieren
            const charakterCards = shuffledDeck.filter(card => card.type === 'charakterkarte');
            const specialCards = shuffledDeck.filter(card => card.type === 'spezialkarte');
            const trapOrBonusCards = shuffledDeck.filter(card =>
                card.type === 'fallenkarte' || card.type === 'bonuskarte');

            // Starter-Hand zusammenstellen
            const startHand = [
                ...charakterCards.slice(0, 2),  // 2 Charakterkarten
                ...(specialCards.length > 0 ? [specialCards[0]] : [trapOrBonusCards[0]])  // 1 Spezial- oder Bonuskarte
            ];

            // Restliche Karten zum Nachziehstapel
            const remainingCards = shuffledDeck.filter(card => !startHand.includes(card));

            // Auffüllen auf 6 Karten
            const additionalCards = remainingCards.slice(0, 6 - startHand.length);
            const hand = [...startHand, ...additionalCards];
            const drawPile = remainingCards.slice(6 - startHand.length);

            return {
                ...player,
                hand,
                drawPile,
                discardPile: []
            };
        });

        return {
            ...gameState,
            players: updatedPlayers,
            phase: GamePhase.MOMENTUM, // Zur Momentum-Phase übergehen
            log: [
                ...gameState.log,
                {
                    timestamp: new Date(),
                    message: 'Spiel gestartet. Startkarten ausgeteilt.',
                    type: 'system'
                }
            ]
        };
    }

    /**
     * Würfelt den Momentum-Wert
     */
    throwMomentum(gameState: GameState, playerId: string): GameState {
        // Prüfen, ob wir in der richtigen Phase sind
        if (gameState.phase !== GamePhase.MOMENTUM) {
            throw new Error('Momentumwurf nur in der Momentum-Phase möglich');
        }

        // Prüfen, ob der Spieler mit den wenigsten Mandaten wirft
        if (gameState.currentRound > 1) {
            const playerWithFewestMandates = [...gameState.players]
                .sort((a, b) => a.mandates - b.mandates)[0];

            if (playerWithFewestMandates.id !== playerId) {
                throw new Error('Nur der Spieler mit den wenigsten Mandaten darf würfeln');
            }
        }

        // Würfeln (1-6)
        const momentumValue = Math.floor(Math.random() * 6) + 1;

        return {
            ...gameState,
            momentum: momentumValue,
            phase: gameState.players.length >= 3 ? GamePhase.COALITION : GamePhase.CHARACTER, // Bei 3+ Spielern Koalitionsphase, sonst direkt zur Charakterphase
            log: [
                ...gameState.log,
                {
                    timestamp: new Date(),
                    message: `Momentum-Wurf: ${ momentumValue }`,
                    type: 'system',
                    playerId
                }
            ]
        };
    }

    /**
     * Koalitionsangebot eines Spielers
     */
    offerCoalition(gameState: GameState, playerId: string, targetPlayerId: string): GameState {
        // Prüfen, ob wir in der richtigen Phase sind
        if (gameState.phase !== GamePhase.COALITION) {
            throw new Error('Koalitionsangebote nur in der Koalitionsphase möglich');
        }

        // Prüfen, ob der Spieler sich selbst eine Koalition anbietet
        if (playerId === targetPlayerId) {
            throw new Error('Koalition mit sich selbst nicht möglich');
        }

        // Prüfen, ob der Zielspieler existiert
        const targetPlayer = this.getPlayerById(gameState, targetPlayerId);
        if (!targetPlayer) {
            throw new Error('Zielspieler nicht gefunden');
        }

        // Bei hohem Momentum (5-6) sind 3er-Koalitionen erlaubt
        const existingCoalition = gameState.coalitions.find(
            c => c.player1Id === playerId || c.player2Id === playerId
        );

        if (existingCoalition && gameState.momentum < 5) {
            throw new Error('Bei Momentum < 5 nur 2er-Koalitionen erlaubt');
        }

        // Log-Eintrag für das Angebot
        const newGameState = {
            ...gameState,
            log: [
                ...gameState.log,
                {
                    timestamp: new Date(),
                    message: `${ this.getPlayerById(gameState, playerId)?.name } bietet ${ targetPlayer.name } eine Koalition an`,
                    type: 'action',
                    playerId
                }
            ]
        };

        return newGameState;
    }

    /**
     * Koalitionsangebot annehmen
     */
    acceptCoalition(gameState: GameState, playerId: string, offeredByPlayerId: string): GameState {
        // Prüfen, ob wir in der richtigen Phase sind
        if (gameState.phase !== GamePhase.COALITION) {
            throw new Error('Koalitionsangebote nur in der Koalitionsphase möglich');
        }

        // Existierende Koalition prüfen und aktualisieren
        const existingCoalitionIndex = gameState.coalitions.findIndex(
            c => (c.player1Id === playerId && c.player2Id === offeredByPlayerId) ||
                (c.player1Id === offeredByPlayerId && c.player2Id === playerId)
        );

        let updatedCoalitions = [...gameState.coalitions];

        if (existingCoalitionIndex >= 0) {
            // Bestehende Koalition: Runden inkrementieren
            const coalition = gameState.coalitions[existingCoalitionIndex];
            updatedCoalitions[existingCoalitionIndex] = {
                ...coalition,
                consecutiveRounds: coalition.consecutiveRounds + 1
            };
        } else {
            // Neue Koalition hinzufügen
            updatedCoalitions.push({
                player1Id: offeredByPlayerId,
                player2Id: playerId,
                roundFormed: gameState.currentRound,
                consecutiveRounds: 1
            });
        }

        // Spieler aktualisieren
        const updatedPlayers = gameState.players.map(player => {
            if (player.id === playerId) {
                return { ...player, coalitionWith: offeredByPlayerId };
            }
            if (player.id === offeredByPlayerId) {
                return { ...player, coalitionWith: playerId };
            }
            return player;
        });

        return {
            ...gameState,
            players: updatedPlayers,
            coalitions: updatedCoalitions,
            log: [
                ...gameState.log,
                {
                    timestamp: new Date(),
                    message: `${ this.getPlayerById(gameState, playerId)?.name } hat die Koalition mit ${ this.getPlayerById(gameState, offeredByPlayerId)?.name } angenommen`,
                    type: 'action',
                    playerId
                }
            ]
        };
    }

    /**
     * Zur nächsten Phase wechseln
     */
    nextPhase(gameState: GameState): GameState {
        switch (gameState.phase) {
            case GamePhase.SETUP:
                return {
                    ...gameState,
                    phase: GamePhase.MOMENTUM,
                    log: [
                        ...gameState.log,
                        {
                            timestamp: new Date(),
                            message: 'Momentum-Phase beginnt',
                            type: 'system'
                        }
                    ]
                };

            case GamePhase.MOMENTUM:
                return {
                    ...gameState,
                    phase: gameState.players.length >= 3 ? GamePhase.COALITION : GamePhase.CHARACTER,
                    log: [
                        ...gameState.log,
                        {
                            timestamp: new Date(),
                            message: gameState.players.length >= 3 ? 'Koalitionsphase beginnt' : 'Charakterkartenphase beginnt',
                            type: 'system'
                        }
                    ]
                };

            case GamePhase.COALITION:
                return {
                    ...gameState,
                    phase: GamePhase.CHARACTER,
                    log: [
                        ...gameState.log,
                        {
                            timestamp: new Date(),
                            message: 'Charakterkartenphase beginnt',
                            type: 'system'
                        }
                    ]
                };

            case GamePhase.CHARACTER:
                return {
                    ...gameState,
                    phase: GamePhase.SPECIAL,
                    log: [
                        ...gameState.log,
                        {
                            timestamp: new Date(),
                            message: 'Spezial-/Bonus-/Fallenphase beginnt',
                            type: 'system'
                        }
                    ]
                };

            case GamePhase.SPECIAL:
                return {
                    ...gameState,
                    phase: GamePhase.RESOLUTION,
                    log: [
                        ...gameState.log,
                        {
                            timestamp: new Date(),
                            message: 'Auflösungs- und Vergleichsphase beginnt',
                            type: 'system'
                        }
                    ]
                };

            case GamePhase.RESOLUTION:
                return {
                    ...gameState,
                    phase: GamePhase.INFLUENCE_LOSS,
                    log: [
                        ...gameState.log,
                        {
                            timestamp: new Date(),
                            message: 'Einflussverlustphase beginnt',
                            type: 'system'
                        }
                    ]
                };

            case GamePhase.INFLUENCE_LOSS:
                return {
                    ...gameState,
                    phase: GamePhase.DRAW,
                    log: [
                        ...gameState.log,
                        {
                            timestamp: new Date(),
                            message: 'Kartenziehphase beginnt',
                            type: 'system'
                        }
                    ]
                };

            case GamePhase.DRAW:
                // Nächste Runde starten oder Spiel beenden
                const winner = this.checkForWinner(gameState);
                if (winner) {
                    return {
                        ...gameState,
                        phase: GamePhase.END,
                        winner: winner.id,
                        endTime: new Date(),
                        log: [
                            ...gameState.log,
                            {
                                timestamp: new Date(),
                                message: `${ winner.name } hat gewonnen!`,
                                type: 'result'
                            }
                        ]
                    };
                } else {
                    return {
                        ...gameState,
                        currentRound: gameState.currentRound + 1,
                        phase: GamePhase.MOMENTUM,
                        log: [
                            ...gameState.log,
                            {
                                timestamp: new Date(),
                                message: `Runde ${ gameState.currentRound + 1 } beginnt`,
                                type: 'system'
                            }
                        ]
                    };
                }

            default:
                return gameState;
        }
    }

    // Hilfsfunktionen

    /**
     * Findet einen Spieler anhand seiner ID
     */
    private getPlayerById(gameState: GameState, playerId: string): Player | undefined {
        return gameState.players.find(p => p.id === playerId);
    }

    /**
     * Prüft, ob ein Spieler gewonnen hat
     */
    private checkForWinner(gameState: GameState): Player | null {
        const winner = gameState.players.find(player => player.mandates >= 12);
        return winner || null;
    }

    /**
     * Create a new game
     */
    createGame(options: {
        name: string;
        maxPlayers: number;
        maxRounds: number;
        deckId: string;
    }): Promise<GameState> {
        return new Promise((resolve, reject) => {
            if (!socketService.isConnected()) {
                reject(new Error('Socket not connected'));
                return;
            }

            socketService.on('create-game-response', (response: { success: boolean; game?: GameState; error?: string }) => {
                socketService.off('create-game-response');

                if (response.success && response.game) {
                    this.currentGame = response.game;
                    socketService.joinGame(response.game.gameId);
                    this.notifyListeners();
                    resolve(response.game);
                } else {
                    reject(new Error(response.error || 'Failed to create game'));
                }
            });

            socketService.emit('create-game', options);
        });
    }

    /**
     * Join an existing game
     */
    joinGame(gameId: string, deckId: string): Promise<GameState> {
        return new Promise((resolve, reject) => {
            if (!socketService.isConnected()) {
                reject(new Error('Socket not connected'));
                return;
            }

            socketService.on('join-game-response', (response: { success: boolean; game?: GameState; error?: string }) => {
                socketService.off('join-game-response');

                if (response.success && response.game) {
                    this.currentGame = response.game;
                    socketService.joinGame(gameId);
                    this.notifyListeners();
                    resolve(response.game);
                } else {
                    reject(new Error(response.error || 'Failed to join game'));
                }
            });

            socketService.emit('join-game', { gameId, deckId });
        });
    }

    /**
     * Leave the current game
     */
    leaveGame(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (!socketService.isConnected() || !this.currentGame) {
                reject(new Error('Socket not connected or no active game'));
                return;
            }

            const gameId = this.currentGame.gameId;

            socketService.on('leave-game-response', (response: { success: boolean; error?: string }) => {
                socketService.off('leave-game-response');

                if (response.success) {
                    socketService.leaveGame(gameId);
                    this.currentGame = null;
                    this.notifyListeners();
                    resolve(true);
                } else {
                    reject(new Error(response.error || 'Failed to leave game'));
                }
            });

            socketService.emit('leave-game', { gameId });
        });
    }

    /**
     * Start the current game (host only)
     */
    startGame(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (!socketService.isConnected() || !this.currentGame) {
                reject(new Error('Socket not connected or no active game'));
                return;
            }

            if (!this.isHost()) {
                reject(new Error('Only the host can start the game'));
                return;
            }

            socketService.on('start-game-response', (response: { success: boolean; error?: string }) => {
                socketService.off('start-game-response');

                if (response.success) {
                    resolve(true);
                } else {
                    reject(new Error(response.error || 'Failed to start game'));
                }
            });

            socketService.emit('start-game', { gameId: this.currentGame.gameId });
        });
    }

    /**
     * Play a card in the current game
     */
    playCard(cardId: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (!socketService.isConnected() || !this.currentGame) {
                reject(new Error('Socket not connected or no active game'));
                return;
            }

            socketService.on('play-card-response', (response: { success: boolean; error?: string }) => {
                socketService.off('play-card-response');

                if (response.success) {
                    resolve(true);
                } else {
                    reject(new Error(response.error || 'Failed to play card'));
                }
            });

            socketService.emit('play-card', {
                gameId: this.currentGame.gameId,
                cardId
            });
        });
    }

    /**
     * Perform a game action
     */
    performAction(actionType: GameActionType, actionPayload: any): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (!socketService.isConnected() || !this.currentGame) {
                reject(new Error('Socket not connected or no active game'));
                return;
            }

            socketService.on('game-action-response', (response: { success: boolean; error?: string }) => {
                socketService.off('game-action-response');

                if (response.success) {
                    resolve(true);
                } else {
                    reject(new Error(response.error || 'Failed to perform action'));
                }
            });

            const action: GameAction = {
                type: actionType,
                payload: actionPayload,
                gameId: this.currentGame.gameId,
                playerId: '', // Will be set by the server
                timestamp: new Date().toISOString()
            };

            socketService.emit('game-action', action);
        });
    }

    /**
     * Get all available games to join
     */
    getAvailableGames(): Promise<GameState[]> {
        return new Promise((resolve, reject) => {
            if (!socketService.isConnected()) {
                reject(new Error('Socket not connected'));
                return;
            }

            socketService.on('available-games-response', (response: { success: boolean; games?: GameState[]; error?: string }) => {
                socketService.off('available-games-response');

                if (response.success && response.games) {
                    resolve(response.games);
                } else {
                    reject(new Error(response.error || 'Failed to get available games'));
                }
            });

            socketService.emit('get-available-games', {});
        });
    }

    /**
     * Get the current game state
     */
    getCurrentGame(): GameState | null {
        return this.currentGame;
    }

    /**
     * Check if the current player is the host
     */
    isHost(): boolean {
        if (!this.currentGame) return false;

        // We need a user service to get the current user ID
        // For now, assume we have a userId in localStorage
        const userId = localStorage.getItem('userId');
        return userId === this.currentGame.hostId;
    }

    /**
     * Clean up resources before component unmounting
     */
    destroy() {
        socketService.off('game-updated');
        this.gameStateListeners = [];
        this.currentGame = null;
    }
}

// Create a singleton instance
const gameService = new GameService().init();

export default gameService;