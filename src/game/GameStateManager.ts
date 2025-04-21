/**
 * GameStateManager.ts
 * Central service for managing game state, processing actions and handling turns
 */

import { Card, Deck, Player, GameState, GameAction, ActionType } from '../types/gameTypes';
import { DeckManager } from './DeckManager';

export class GameStateManager {
    /**
     * Initializes a new game with the given players and decks
     */
    static initializeGame(gameId: string, players: Player[], gameName: string, maxRounds: number, mandateThreshold: number): GameState {
        return {
            gameId,
            name: gameName,
            players,
            currentTurn: 0,
            round: 1,
            maxRounds,
            mandateThreshold,
            phase: 'setup',
            activePlayerId: players[0]?.id || '',
            log: [{
                timestamp: Date.now(),
                message: `Game "${ gameName }" started with ${ players.length } players`
            }],
            status: 'active'
        };
    }

    /**
     * Processes a player action and returns the updated game state
     */
    static processAction(gameState: GameState, action: GameAction): GameState {
        // Validate that it's the player's turn
        if (action.playerId !== gameState.activePlayerId && action.type !== ActionType.CHAT) {
            return this.addToLog(gameState, `Invalid action: Not ${ action.playerId }'s turn`);
        }

        let updatedState = { ...gameState };

        switch (action.type) {
            case ActionType.PLAY_CARD:
                updatedState = this.handlePlayCard(updatedState, action);
                break;
            case ActionType.DRAW_CARD:
                updatedState = this.handleDrawCard(updatedState, action);
                break;
            case ActionType.END_TURN:
                updatedState = this.handleEndTurn(updatedState, action);
                break;
            case ActionType.CHAT:
                updatedState = this.addToLog(updatedState, `${ this.getPlayerName(updatedState, action.playerId) }: ${ action.message }`);
                break;
            default:
                updatedState = this.addToLog(updatedState, `Unknown action type: ${ action.type }`);
        }

        // Check for game end conditions
        updatedState = this.checkGameEndConditions(updatedState);

        return updatedState;
    }

    /**
     * Handles the PLAY_CARD action
     */
    private static handlePlayCard(gameState: GameState, action: GameAction): GameState {
        // Find the player
        const playerIndex = gameState.players.findIndex(p => p.id === action.playerId);
        if (playerIndex === -1) return this.addToLog(gameState, `Invalid player: ${ action.playerId }`);

        const player = gameState.players[playerIndex];

        // Check if the card is in the player's hand
        if (!player.hand.includes(action.cardId)) {
            return this.addToLog(gameState, `Card ${ action.cardId } not in player's hand`);
        }

        // Get the card details
        const card = this.findCardById(gameState, action.cardId);
        if (!card) {
            return this.addToLog(gameState, `Card ${ action.cardId } not found in game`);
        }

        // Remove the card from the player's hand
        const updatedPlayer = {
            ...player,
            hand: player.hand.filter(id => id !== action.cardId),
            played: [...player.played, action.cardId],
            influence: player.influence + (card.influence || 0)
        };

        // Update the player in the game state
        const updatedPlayers = [...gameState.players];
        updatedPlayers[playerIndex] = updatedPlayer;

        // Add to log
        let updatedState = {
            ...gameState,
            players: updatedPlayers
        };

        updatedState = this.addToLog(
            updatedState,
            `${ this.getPlayerName(updatedState, action.playerId) } played ${ card.name } (+${ card.influence || 0 } influence)`
        );

        // Apply card effects if any
        if (card.effect) {
            updatedState = this.addToLog(updatedState, `Effect: ${ card.effect }`);
            // In a real implementation, we would process the effect here
        }

        return updatedState;
    }

    /**
     * Handles the DRAW_CARD action
     */
    private static handleDrawCard(gameState: GameState, action: GameAction): GameState {
        // Find the player
        const playerIndex = gameState.players.findIndex(p => p.id === action.playerId);
        if (playerIndex === -1) return this.addToLog(gameState, `Invalid player: ${ action.playerId }`);

        const player = gameState.players[playerIndex];

        // Draw a card from the player's deck
        const { drawnCardIds, updatedDeck } = DeckManager.drawCards(player.deck, 1);

        if (drawnCardIds.length === 0) {
            return this.addToLog(gameState, `${ this.getPlayerName(gameState, action.playerId) } has no cards left to draw`);
        }

        // Add the card to the player's hand
        const updatedPlayer = {
            ...player,
            hand: [...player.hand, ...drawnCardIds],
            deck: updatedDeck
        };

        // Update the player in the game state
        const updatedPlayers = [...gameState.players];
        updatedPlayers[playerIndex] = updatedPlayer;

        // Add to log
        return this.addToLog(
            { ...gameState, players: updatedPlayers },
            `${ this.getPlayerName(gameState, action.playerId) } drew a card`
        );
    }

    /**
     * Handles the END_TURN action
     */
    private static handleEndTurn(gameState: GameState, action: GameAction): GameState {
        // Calculate the next player's index
        const currentPlayerIndex = gameState.players.findIndex(p => p.id === action.playerId);
        if (currentPlayerIndex === -1) return this.addToLog(gameState, `Invalid player: ${ action.playerId }`);

        const nextPlayerIndex = (currentPlayerIndex + 1) % gameState.players.length;
        const nextPlayerId = gameState.players[nextPlayerIndex].id;

        let updatedState = this.addToLog(
            gameState,
            `${ this.getPlayerName(gameState, action.playerId) } ended their turn`
        );

        // If we've gone all the way around, increment the round
        let newRound = gameState.round;
        if (nextPlayerIndex === 0) {
            newRound++;
            updatedState = this.addToLog(updatedState, `Round ${ newRound } begins`);
        }

        // Update game state
        return {
            ...updatedState,
            activePlayerId: nextPlayerId,
            currentTurn: gameState.currentTurn + 1,
            round: newRound,
            phase: newRound > gameState.maxRounds ? 'final' : updatedState.phase
        };
    }

    /**
     * Checks if any game end conditions have been met
     */
    private static checkGameEndConditions(gameState: GameState): GameState {
        // Check if max rounds reached
        if (gameState.round > gameState.maxRounds && gameState.phase !== 'finished') {
            let winner = this.determineWinner(gameState);
            return {
                ...gameState,
                phase: 'finished',
                status: 'completed',
                winner: winner?.id,
                log: [
                    ...gameState.log,
                    {
                        timestamp: Date.now(),
                        message: `Game over! ${ winner ? this.getPlayerName(gameState, winner.id) + ' wins!' : 'It\'s a tie!' }`
                    }
                ]
            };
        }

        // Check if any player reached the mandate threshold
        const winningPlayer = gameState.players.find(p => p.mandates >= gameState.mandateThreshold);

        if (winningPlayer && gameState.phase !== 'finished') {
            return {
                ...gameState,
                phase: 'finished',
                status: 'completed',
                winner: winningPlayer.id,
                log: [
                    ...gameState.log,
                    {
                        timestamp: Date.now(),
                        message: `${ this.getPlayerName(gameState, winningPlayer.id) } reached the mandate threshold and wins!`
                    }
                ]
            };
        }

        return gameState;
    }

    /**
     * Determines the winner based on influence
     */
    private static determineWinner(gameState: GameState): Player | null {
        let highestInfluence = -1;
        let winningPlayer: Player | null = null;
        let tie = false;

        for (const player of gameState.players) {
            if (player.influence > highestInfluence) {
                highestInfluence = player.influence;
                winningPlayer = player;
                tie = false;
            } else if (player.influence === highestInfluence) {
                tie = true;
            }
        }

        if (tie) return null;
        return winningPlayer;
    }

    /**
     * Adds a message to the game log
     */
    private static addToLog(gameState: GameState, message: string): GameState {
        return {
            ...gameState,
            log: [
                ...gameState.log,
                {
                    timestamp: Date.now(),
                    message
                }
            ]
        };
    }

    /**
     * Finds a card by ID in the game state
     */
    private static findCardById(gameState: GameState, cardId: string): Card | undefined {
        for (const player of gameState.players) {
            const card = player.deck.cards.find(c => c.id === cardId);
            if (card) return card;
        }
        return undefined;
    }

    /**
     * Gets a player's name by ID
     */
    private static getPlayerName(gameState: GameState, playerId: string): string {
        const player = gameState.players.find(p => p.id === playerId);
        return player ? player.name : 'Unknown Player';
    }
}